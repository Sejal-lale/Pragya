import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  MapPin,
  CheckCircle2,
  Sparkles,
  X,
  ChevronRight,
  ArrowLeft,
  Upload,
  User,
  ShieldCheck,
  Send,
  Navigation,
  Move,
  AlertCircle,
  Users,
  Search,
  RefreshCw,
  Crosshair,
  Video,
} from 'lucide-react';
import { ComplaintCategory, ComplaintPriority, Complaint } from '../../types';
import { classifyCivicIssue } from '../../services/aiClassifierService';
import {
  startCameraStream,
  stopCameraStream,
  captureVideoFrame,
  stampGeoWatermark,
} from '../../utils/cameraUtils';
import {
  searchNagpurLocationsLive,
  detectDeviceLocation,
  reverseGeocodeCoords,
  NAGPUR_LOCALITIES,
  NagpurLocality,
  getCategoryBadge,
} from '../../services/locationService';
import L from 'leaflet';
import confetti from 'canvas-confetti';

interface GuidedAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated: (complaint: Complaint) => void;
}

/**
 * Smart Name Cleaner - Strips conversational greeting prefixes in Hindi, Marathi, and English
 */
function extractNameFromSpeech(transcript: string): string {
  let cleaned = transcript.trim();
  // Hindi prefixes & suffixes
  cleaned = cleaned.replace(/^(नमस्ते|नमस्कार|मेरा नाम|नाम है|मैं हूँ|मैं)\s+/i, '');
  cleaned = cleaned.replace(/\s+(है|हूँ)$/i, '');
  // Marathi prefixes & suffixes
  cleaned = cleaned.replace(/^(नमस्कार|माझं नाव|माझे नाव|मी आहे|मी)\s+/i, '');
  cleaned = cleaned.replace(/\s+(आहे)$/i, '');
  // English prefixes
  cleaned = cleaned.replace(/^(hello|hi|namaste|my name is|i am|this is|name is)\s+/i, '');
  cleaned = cleaned.replace(/^(mr\.|mrs\.|ms\.)\s+/i, '');
  return cleaned.trim();
}

export const GuidedAssistantModal: React.FC<GuidedAssistantModalProps> = ({
  isOpen,
  onClose,
  onComplaintCreated,
}) => {
  const { t, language, addComplaint, currentUser, addToast } = useStore();

  // Step 1 to 6
  // 1: Name -> 2: Problem Photo -> 3: Problem Description -> 4: Location -> 5: Citizen Selfie -> 6: Summary
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Audio speech synthesis toggle
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Step 1: Citizen Name
  const [citizenName, setCitizenName] = useState<string>(currentUser ? currentUser.name : '');
  const [isListeningName, setIsListeningName] = useState<boolean>(false);
  const nameSpeechRecRef = useRef<any>(null);

  // Step 2: Problem Photo Evidence
  const [problemPhoto, setProblemPhoto] = useState<string | null>(null);
  const problemFileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Problem Description
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [translatedDesc, setTranslatedDesc] = useState<string>('');
  const [category, setCategory] = useState<ComplaintCategory>('roads');
  const [subCategory, setSubCategory] = useState<string>('Pothole Repair');
  const [deptName, setDeptName] = useState<string>('Roads & Infrastructure');
  const [deptId, setDeptId] = useState<string>('roads');
  const [priority, setPriority] = useState<ComplaintPriority>('high');
  const [slaHours, setSlaHours] = useState<number>(48);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const problemSpeechRecRef = useRef<any>(null);

  // Step 4: Location
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.1685,
    lng: 79.1022, // Default to Kamal Chowk, Nagpur
  });
  const [address, setAddress] = useState<string>('Kamal Chowk, Pachpaoli / Lashkaribagh');
  const [ward, setWard] = useState<string>('Ward 07, Kamal Chowk');
  const [wardId, setWardId] = useState<string>('ward-07');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [isGpsAutoDetected, setIsGpsAutoDetected] = useState<boolean>(false);
  const hasAutoRequestedGps = useRef<boolean>(false);
  const [localitySearch, setLocalitySearch] = useState<string>('');
  const [localitySuggestions, setLocalitySuggestions] = useState<NagpurLocality[]>([]);
  const [showLocalitySuggestions, setShowLocalitySuggestions] = useState<boolean>(false);

  // Step 5: Citizen Verification Photo with Live Geo-Address (LIVE CAMERA ONLY - NO UPLOADS)
  const [citizenPhoto, setCitizenPhoto] = useState<string | null>(null);
  const [isWatermarking, setIsWatermarking] = useState<boolean>(false);

  // Shared Live Camera Viewfinder State
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeCameraStream = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'problem' | 'selfie' | null>(null);

  // Step 6: Submitting state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Helper to cleanup camera
  const cleanupCamera = () => {
    if (activeCameraStream.current) {
      stopCameraStream(activeCameraStream.current);
      activeCameraStream.current = null;
    }
    setIsCameraActive(false);
    setCameraMode(null);
  };

  // Cleanup all streams & speech on unmount or modal close
  useEffect(() => {
    return () => {
      cleanupCamera();
      if (nameSpeechRecRef.current) {
        try { nameSpeechRecRef.current.stop(); } catch {}
      }
      if (problemSpeechRecRef.current) {
        try { problemSpeechRecRef.current.stop(); } catch {}
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Stop camera when changing steps
  useEffect(() => {
    cleanupCamera();
    if (nameSpeechRecRef.current) {
      try { nameSpeechRecRef.current.stop(); } catch {}
      setIsListeningName(false);
    }
    if (problemSpeechRecRef.current) {
      try { problemSpeechRecRef.current.stop(); } catch {}
      setIsRecording(false);
    }
  }, [currentStep]);

  // Text-to-Speech (TTS) Guide function
  const speakPrompt = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Trigger spoken prompt when step or language changes
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    let speechText = '';
    if (currentStep === 1) {
      speechText =
        language === 'mr'
          ? 'नमस्कार! आपलं नाव काय आहे? बोला किंवा लिहा.'
          : language === 'hi'
          ? 'नमस्ते! आपका नाम क्या है? बोलकर या लिखकर बताएं.'
          : 'Namaste! What is your name? Please speak or write.';
    } else if (currentStep === 2) {
      speechText =
        language === 'mr'
          ? 'समस्येचा एक फोटो कॅमेऱ्याने घ्या किंवा अपलोड करा.'
          : language === 'hi'
          ? 'समस्या की फोटो कैमरे से लें या अपलोड करें.'
          : 'Please capture or upload a photo of the problem.';
    } else if (currentStep === 3) {
      speechText =
        language === 'mr'
          ? 'सांगा, काय अडचण झाली आहे? आपल्या आवाजात सांगा.'
          : language === 'hi'
          ? 'बताएं, क्या समस्या हुई? अपनी आवाज में बताएं.'
          : 'Please describe the problem you are facing.';
    } else if (currentStep === 4) {
      speechText =
        language === 'mr'
          ? 'समस्या कुठे आहे? जागा निश्चित करा.'
          : language === 'hi'
          ? 'समस्या कहाँ है? स्थान की पुष्टि करें.'
          : 'Where is the problem located? Confirm your locality.';
    } else if (currentStep === 5) {
      speechText =
        language === 'mr'
          ? 'तक्रार नोंदवणार्‍याचा एक थेट सेल्फी फोटो घ्या.'
          : language === 'hi'
          ? 'शिकायत दर्ज करने वाले की लाइव सेल्फी फोटो लें.'
          : 'Please take your instant citizen verification selfie.';
    }

    if (speechText) {
      const timer = setTimeout(() => speakPrompt(speechText), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, language, isOpen, isMuted]);

  // ----------------------------------------------------
  // STEP 1: Name Speech Recognition Handler
  // ----------------------------------------------------
  const startNameRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({
        type: 'info',
        title: 'Voice Input',
        message: 'Speech recognition is not supported in this browser. Please type your name.',
      });
      return;
    }

    if (isListeningName) {
      if (nameSpeechRecRef.current) {
        try { nameSpeechRecRef.current.stop(); } catch {}
      }
      setIsListeningName(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => setIsListeningName(true);

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript) {
          const detected = extractNameFromSpeech(transcript);
          if (detected) {
            setCitizenName(detected);
          }
        }
      };

      rec.onerror = () => setIsListeningName(false);
      rec.onend = () => setIsListeningName(false);

      nameSpeechRecRef.current = rec;
      rec.start();
    } catch {
      setIsListeningName(false);
    }
  };

  // Auto-start Name Mic on Step 1 load
  useEffect(() => {
    if (currentStep === 1 && isOpen && !citizenName) {
      const timer = setTimeout(() => {
        startNameRecognition();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  // ----------------------------------------------------
  // STEP 2 & 5: Camera Stream Control
  // ----------------------------------------------------
  const openCamera = async (mode: 'problem' | 'selfie') => {
    setCameraMode(mode);
    setIsCameraActive(true);

    setTimeout(async () => {
      if (!videoRef.current) return;
      try {
        const stream = await startCameraStream(
          videoRef.current,
          mode === 'selfie' ? 'user' : 'environment'
        );
        activeCameraStream.current = stream;
      } catch (err: any) {
        setIsCameraActive(false);
        setCameraMode(null);
        addToast({
          type: 'error',
          title: 'Camera Access Needed',
          message: 'Please allow camera permission or upload a photo.',
        });
      }
    }, 100);
  };

  // Auto-open Problem Camera on entering Step 2
  useEffect(() => {
    if (currentStep === 2 && isOpen && !problemPhoto) {
      const timer = setTimeout(() => {
        openCamera('problem');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  // Auto-open Selfie Camera on entering Step 5
  useEffect(() => {
    if (currentStep === 5 && isOpen && !citizenPhoto) {
      const timer = setTimeout(() => {
        openCamera('selfie');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;

    try {
      const rawDataUrl = captureVideoFrame(videoRef.current);
      cleanupCamera();

      if (cameraMode === 'problem') {
        setProblemPhoto(rawDataUrl);
        addToast({
          type: 'success',
          title: 'Problem Photo Captured',
          message: 'Advancing to describe problem...',
        });
        // Auto-advance to Step 3
        setTimeout(() => setCurrentStep(3), 400);
      } else if (cameraMode === 'selfie') {
        setIsWatermarking(true);
        // Stamp instant live geo-watermark
        const stamped = await stampGeoWatermark(rawDataUrl, {
          citizenName: citizenName || 'Verified Citizen',
          latitude: locationCoords.lat,
          longitude: locationCoords.lng,
          address,
          ward,
          badgeTitle: 'PRAGYA CITIZEN VERIFICATION • ON-SITE STAMP',
        });
        setCitizenPhoto(stamped);
        setIsWatermarking(false);
        addToast({
          type: 'success',
          title: 'Instant Selfie Geo-Marked',
          message: 'Advancing to review summary...',
        });
        // Auto-advance to Step 6
        setTimeout(() => setCurrentStep(6), 500);
      }
    } catch (err: any) {
      console.error('Error capturing photo:', err);
      cleanupCamera();
    }
  };

  // ----------------------------------------------------
  // STEP 3: Problem Speech Recognition & AI Classification
  // ----------------------------------------------------
  const handleProblemText = async (text: string) => {
    setRawTranscript(text);
    if (!text.trim() || text.trim().length < 3) return;

    setIsClassifying(true);
    try {
      const result = await classifyCivicIssue(text, language);
      setCategory(result.category);
      setSubCategory(result.subCategory);
      setDeptId(result.departmentId);
      setDeptName(result.departmentName);
      setPriority(result.priority);
      setSlaHours(result.slaHours);
      setTranslatedDesc(result.translatedDescription);
    } catch (err) {
      console.warn('AI classification fallback:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  const startProblemRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({
        type: 'info',
        title: 'Voice Input',
        message: 'Speech recognition is not supported in this browser. Please type your problem.',
      });
      return;
    }

    if (isRecording) {
      if (problemSpeechRecRef.current) {
        try { problemSpeechRecRef.current.stop(); } catch {}
      }
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => setIsRecording(true);

      rec.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + ' ';
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }
        const fullText = (finalStr + interimStr).trim();
        setRawTranscript(fullText);
        if (fullText.length > 4) {
          handleProblemText(fullText);
        }
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);

      problemSpeechRecRef.current = rec;
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Auto-start Problem Mic on Step 3 load
  useEffect(() => {
    if (currentStep === 3 && isOpen) {
      const timer = setTimeout(() => {
        startProblemRecognition();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  // ----------------------------------------------------
  // STEP 4: Live Locality Search & GPS Auto-Detect
  // ----------------------------------------------------
  // Real-time Nominatim + Local catalog search
  useEffect(() => {
    let isMounted = true;
    if (!localitySearch.trim()) {
      setLocalitySuggestions(NAGPUR_LOCALITIES.slice(0, 8));
      return;
    }

    searchNagpurLocationsLive(localitySearch).then((results) => {
      if (isMounted) {
        setLocalitySuggestions(results);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [localitySearch]);

  const handleAutoDetectLocation = async (isBackgroundDefault = false) => {
    setIsDetectingGps(true);
    try {
      const coords = await detectDeviceLocation();
      setLocationCoords(coords);
      setIsGpsAutoDetected(true);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      }

      const geoRes = await reverseGeocodeCoords(coords.lat, coords.lng);
      setAddress(geoRes.address);
      setWard(geoRes.ward);
      setWardId(geoRes.wardId);

      addToast({
        type: 'success',
        title: 'Current GPS Location Active',
        message: `${geoRes.address} (${geoRes.ward})`,
      });
    } catch (err: any) {
      if (!isBackgroundDefault) {
        addToast({
          type: 'info',
          title: 'GPS Location Notice',
          message: 'Could not access device GPS. You can search any place, mall, or chowk below.',
        });
      }
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Auto-detect GPS as DEFAULT when entering Step 4 or opening the assistant
  useEffect(() => {
    if ((currentStep === 4 || isOpen) && !hasAutoRequestedGps.current) {
      hasAutoRequestedGps.current = true;
      handleAutoDetectLocation(true);
    }
  }, [currentStep, isOpen]);

  // Mount Leaflet map when Step 4 is active
  useEffect(() => {
    if (currentStep !== 4 || !isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([locationCoords.lat, locationCoords.lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing civic marker
      const customIcon = L.divIcon({
        className: 'custom-civic-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; background: rgba(79, 70, 229, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 22px; height: 22px; background: #4F46E5; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 10;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([locationCoords.lat, locationCoords.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', async (e: any) => {
        const pos = e.target.getLatLng();
        setLocationCoords({ lat: pos.lat, lng: pos.lng });
        const res = await reverseGeocodeCoords(pos.lat, pos.lng);
        setAddress(res.address);
        setWard(res.ward);
        setWardId(res.wardId);
      });

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setLocationCoords({ lat, lng });
        const res = await reverseGeocodeCoords(lat, lng);
        setAddress(res.address);
        setWard(res.ward);
        setWardId(res.wardId);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentStep, isOpen]);

  const handleSelectLocality = (loc: NagpurLocality) => {
    setLocationCoords({ lat: loc.lat, lng: loc.lng });
    const cleanAddr = loc.name.includes('Nagpur') ? loc.name : `${loc.name}, Nagpur`;
    setAddress(cleanAddr);
    setWard(loc.wardName);
    setWardId(loc.wardId);
    setLocalitySearch(loc.name);
    setShowLocalitySuggestions(false);
    setIsGpsAutoDetected(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([loc.lat, loc.lng], 16);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([loc.lat, loc.lng]);
    }

    addToast({
      type: 'info',
      title: 'Place Selected',
      message: `${loc.name} (${loc.wardName})`,
    });
  };

  // ----------------------------------------------------
  // STEP 6: Final Submission
  // ----------------------------------------------------
  const handleFinalSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const deadlineDate = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

      const newComplaint = addComplaint({
        title: subCategory || 'Civic Issue Reported',
        description: rawTranscript || translatedDesc || 'Civic grievance reported via Pragya assistant',
        originalLanguage: language,
        originalTranscript: rawTranscript,
        translatedDescription: translatedDesc || rawTranscript,
        category,
        subCategory: subCategory || 'Civic Repair',
        departmentId: deptId,
        departmentName: deptName,
        assignedEmployeeId: 'EMP-R042',
        assignedEmployeeName: 'Rahul Sharma (EMP-R042)',
        priority,
        status: 'dept_assigned',
        deadline: deadlineDate.toISOString(),
        slaHours,
        location: {
          lat: locationCoords.lat,
          lng: locationCoords.lng,
          address,
          ward: ward || 'Ward 07, Kamal Chowk',
        },
        citizenEvidence: problemPhoto
          ? [
              {
                id: 'EV-' + Date.now(),
                imageUrl: problemPhoto,
                timestamp: now.toISOString(),
                uploadedBy: `Citizen (${citizenName || 'Reporter'})`,
                role: 'citizen',
                note: 'Live problem photo captured by citizen',
              },
            ]
          : [],
        citizenProfile: {
          name: citizenName || 'Verified Citizen',
          photoUrl: citizenPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
          registrationAddress: `${address}, ${ward}`,
          registrationGeo: { lat: locationCoords.lat, lng: locationCoords.lng },
          registeredAt: now.toISOString(),
          isVerified: true,
        },
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B'],
      });

      setIsSubmitting(false);
      onClose();
      onComplaintCreated(newComplaint);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Assistant Header */}
        <div className="p-4 bg-gradient-to-r from-[#1E1B4B] via-indigo-900 to-[#312E81] text-white flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-tr from-amber-400 to-amber-300 text-indigo-950 shadow-md ${
                  isSpeaking ? 'animate-pulse ring-2 ring-amber-300' : ''
                }`}
              >
                P
              </div>
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Pragya Voice Assistant</span>
                {isSpeaking && (
                  <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    Speaking
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-indigo-200">
                Step {currentStep} of 6 •{' '}
                {currentStep === 1
                  ? 'Your Name'
                  : currentStep === 2
                  ? 'Problem Photo'
                  : currentStep === 3
                  ? 'Describe Issue'
                  : currentStep === 4
                  ? 'Location'
                  : currentStep === 5
                  ? 'Citizen Selfie'
                  : 'Review & Confirm'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute voice assist' : 'Mute voice assist'}
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Line */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Scrollable Conversation Workspace */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* ======================================================== */}
          {/* STEP 1: Citizen Name (Instant Mic + Manual Write)        */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in text-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'mr'
                    ? 'नमस्कार! आपलं नाव काय आहे?'
                    : language === 'hi'
                    ? 'नमस्ते! आपका नाम क्या है?'
                    : 'Namaste! What is your name?'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Microphone is active — speak your name or type below
                </p>
              </div>

              {/* Voice Microphone Transcriber for Name */}
              <div className="py-2 flex flex-col items-center">
                <button
                  type="button"
                  onClick={startNameRecognition}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                    isListeningName
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {isListeningName ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                </button>
                <span className="text-xs font-semibold mt-2 text-indigo-900">
                  {isListeningName
                    ? 'Listening live... Speak your name'
                    : 'Tap mic if needed to speak'}
                </span>
                <span className="text-[10px] text-gray-400">
                  Supported: Hindi • Marathi • English
                </span>
              </div>

              {/* Name Detection & Manual Write Option */}
              <div className="max-w-sm mx-auto space-y-2 text-left">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                  Citizen Name (Auto-detected or edit):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Speak name or write here..."
                    className="w-full text-base font-bold px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 pr-10"
                  />
                  {citizenName && (
                    <button
                      onClick={() => setCitizenName('')}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={!citizenName.trim()}
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:max-w-xs mx-auto py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <span>Continue → Camera Auto-Opens</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: Problem Photo (Camera Opens Direct + Auto-Next)  */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'mr'
                    ? 'समस्येचा एक फोटो दाखवा 📸'
                    : language === 'hi'
                    ? 'समस्या की एक फोटो दिखाएं 📸'
                    : 'Show us the problem 📸'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live camera is open — snap photo or upload to continue automatically
                </p>
              </div>

              {/* LIVE CAMERA VIEWFINDER (OPENS DIRECTLY) */}
              {isCameraActive && cameraMode === 'problem' && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-600 shadow-xl max-w-sm mx-auto bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Camera</span>
                  </div>

                  {/* Direct upload shortcut inside viewfinder */}
                  <button
                    type="button"
                    onClick={() => problemFileInputRef.current?.click()}
                    className="absolute top-3 right-3 bg-black/75 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Or Upload</span>
                  </button>

                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer scale-105 active:scale-95 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo (Auto-Next)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CAPTURED PHOTO PREVIEW */}
              {!isCameraActive && problemPhoto && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md max-w-sm mx-auto">
                  <img
                    src={problemPhoto}
                    alt="Problem evidence"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Evidence Photo Saved</span>
                  </div>
                  <button
                    onClick={() => {
                      setProblemPhoto(null);
                      openCamera('problem');
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg hover:bg-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                </div>
              )}

              {/* FALLBACK IF CAMERA PERMISSION DENIED */}
              {!isCameraActive && !problemPhoto && (
                <div className="p-5 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-center space-y-3 max-w-sm mx-auto">
                  <Camera className="w-8 h-8 text-indigo-600 mx-auto" />
                  <p className="text-xs font-bold text-gray-800">
                    Camera not active. Click to open camera or upload file:
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => openCamera('problem')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Turn Camera On</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => problemFileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden File Input (Auto-advances after upload) */}
              <input
                ref={problemFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProblemPhoto(reader.result as string);
                      cleanupCamera();
                      addToast({
                        type: 'success',
                        title: 'Photo Uploaded',
                        message: 'Advancing to describe problem...',
                      });
                      setTimeout(() => setCurrentStep(3), 400);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />

              <div className="flex gap-2 pt-2 max-w-sm mx-auto">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Next → Describe Problem</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: Describe Problem (Mic Turns On Instantly)         */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                  Reporting as: {citizenName || 'Citizen'}
                </span>
                {problemPhoto && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Photo Attached</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'mr'
                    ? 'काय अडचण झाली आहे? बोला.'
                    : language === 'hi'
                    ? 'क्या समस्या हुई? बोलकर बताएं.'
                    : 'What happened? Describe the problem.'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mic is listening live — speak your problem or edit below
                </p>
              </div>

              {/* Pulsing Mic with Live Speech Indicator */}
              <div className="py-2 flex flex-col items-center">
                <button
                  type="button"
                  onClick={startProblemRecognition}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                </button>
                <span className="text-xs font-semibold text-indigo-900 mt-2">
                  {isRecording ? 'Listening live... Speak now' : 'Tap mic to start speech again'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {language === 'hi' ? 'हिंदी में बोलें' : language === 'mr' ? 'मराठीत बोला' : 'Speak in English'}
                </span>
              </div>

              {/* Live Transcript / Manual Edit Box */}
              <div className="text-left space-y-1 max-w-md mx-auto">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                  Captured Grievance (live words or edit):
                </label>
                <textarea
                  rows={3}
                  value={rawTranscript}
                  onChange={(e) => handleProblemText(e.target.value)}
                  placeholder="e.g. सड़क पर बड़ा गड्ढा है गाड़ियां फिसल रही हैं / रस्ता खराब आहे / Streetlight broken..."
                  className="w-full text-xs font-medium p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>

              {/* Live AI Understanding Card */}
              {(subCategory || isClassifying) && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-left space-y-1.5 max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>AI Civic Classification</span>
                      {isClassifying && (
                        <span className="text-[10px] text-indigo-500 animate-pulse">(Analyzing...)</span>
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      SLA: {slaHours}h
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-900">{subCategory}</p>
                  {translatedDesc && (
                    <p className="text-xs text-gray-600 italic">"{translatedDesc}"</p>
                  )}
                  <span className="text-[11px] font-medium text-indigo-700 block">
                    Dispatched to: {deptName}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2 max-w-md mx-auto">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  disabled={!rawTranscript.trim() && !subCategory}
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Confirm Problem → Location</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: Location (Kamal Chowk + Live Nominatim Search)    */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === 'mr'
                      ? 'समस्या कुठे आहे? जागा निश्चित करा.'
                      : language === 'hi'
                      ? 'समस्या कहाँ है? स्थान की पुष्टि करें.'
                      : 'Where is the problem located?'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Defaulted to your current location • Search any place, mall, theater, or chowk
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoDetectLocation(false)}
                  disabled={isDetectingGps}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'Locating...' : 'My GPS'}</span>
                </button>
              </div>

              {/* GPS Auto-detected banner */}
              {isGpsAutoDetected && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>✓ <strong>Current GPS Location Active</strong> — You can search below to change to any mall, theater, or landmark.</span>
                </div>
              )}

              {/* Locality Search Input with Live OpenStreetMap & Google-Style Places */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-white transition-colors">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={localitySearch}
                    onChange={(e) => {
                      setLocalitySearch(e.target.value);
                      setShowLocalitySuggestions(true);
                    }}
                    onFocus={() => setShowLocalitySuggestions(true)}
                    placeholder="Search any place, mall, theater, or chowk (e.g. VR Mall, Inox, Kamal Chowk)..."
                    className="w-full text-xs bg-transparent focus:outline-none text-gray-800 font-medium"
                  />
                  {localitySearch && (
                    <button
                      onClick={() => {
                        setLocalitySearch('');
                        setShowLocalitySuggestions(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Locality Dropdown Suggestions */}
                {showLocalitySuggestions && (
                  <div className="absolute top-full left-0 right-0 z-[600] mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100">
                    {localitySuggestions.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 text-center">Searching location...</div>
                    ) : (
                      localitySuggestions.map((loc, idx) => {
                        const badge = getCategoryBadge(loc.category);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocality(loc)}
                            className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50/80 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-gray-800">{loc.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border flex items-center gap-1 ${badge.color}`}>
                                  <span>{badge.icon}</span>
                                  <span>{badge.label}</span>
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500 block truncate">
                                {loc.zone} • {loc.wardName}
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Map Canvas */}
              <div className="relative h-52 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[11px] font-medium text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1 z-[400] shadow-xs">
                  <Move className="w-3 h-3 text-indigo-600" />
                  <span>Drag pin to fine-tune location</span>
                </div>
              </div>

              {/* Editable Address Card */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Selected Location:</span>
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 font-mono">
                    {locationCoords.lat.toFixed(4)}° N, {locationCoords.lng.toFixed(4)}° E
                  </span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street / Landmark address..."
                  className="w-full text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-gray-600 block">
                  Ward: <strong>{ward}</strong>
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Confirm Location → Selfie Auto-Opens</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: Citizen Selfie (Camera Opens Direct + Geo-Stamp) */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
                  ✓ Citizen Authenticity Check (No OTP)
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'mr'
                    ? 'थेट सेल्फी फोटो घ्या 🤳'
                    : language === 'hi'
                    ? 'लाइव सेल्फी फोटो लें 🤳'
                    : 'Take Live Verification Selfie 🤳'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Camera is open — snap instant selfie with live geo-stamping
                </p>
              </div>

              {/* LIVE SELFIE VIEWFINDER (OPENS DIRECTLY - NO UPLOADS ALLOWED) */}
              {isCameraActive && cameraMode === 'selfie' && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xl max-w-sm mx-auto bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover -scale-x-100"
                  />
                  {/* Face oval guide */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-36 h-48 border-2 border-dashed border-emerald-400/80 rounded-full" />
                  </div>
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Front Camera</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/75 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Only (No Uploads)</span>
                  </div>

                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={isWatermarking}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer scale-105 active:scale-95 transition-transform disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isWatermarking ? 'Stamping GPS...' : 'Snap Live Selfie (Auto-Next)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CAPTURED & GEO-WATERMARKED PHOTO PREVIEW */}
              {!isCameraActive && citizenPhoto && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xl max-w-sm mx-auto bg-black">
                  <img
                    src={citizenPhoto}
                    alt="Citizen reporter selfie"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={() => {
                      setCitizenPhoto(null);
                      openCamera('selfie');
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg hover:bg-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                </div>
              )}

              {/* FALLBACK IF CAMERA PERMISSION DENIED (LIVE CAMERA REQUIRED, NO UPLOADS) */}
              {!isCameraActive && !citizenPhoto && (
                <div className="p-5 bg-emerald-50/70 border-2 border-dashed border-emerald-300 rounded-2xl text-center space-y-3 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      Live Front Camera Required
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-1">
                      To prevent fraud and fake accounts, municipal grievance regulations require an instant live camera selfie. Gallery uploads are disabled.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCamera('selfie')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md shadow-emerald-200"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Turn On Selfie Camera</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-2 max-w-sm mx-auto">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  disabled={!citizenPhoto}
                  onClick={() => setCurrentStep(6)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Review Summary →</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: Final Review & Submit                            */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 inline-block mb-1">
                  Ready to Dispatch
                </span>
                <h3 className="text-lg font-bold text-gray-900">Review & Submit Grievance</h3>
                <p className="text-xs text-gray-500">
                  Your complaint will be immediately routed to the municipal team
                </p>
              </div>

              {/* Summary Cards */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Category & SLA
                    </span>
                    <p className="text-sm font-bold text-gray-900">{subCategory}</p>
                    <p className="text-xs text-indigo-600 font-medium">{deptName}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    SLA: {slaHours} Hours
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2 text-xs text-gray-700">
                  <span className="font-bold block text-gray-900">Description:</span>
                  <p className="mt-0.5">{rawTranscript || translatedDesc}</p>
                </div>

                <div className="border-t border-gray-200 pt-2 flex items-start gap-2 text-xs text-gray-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">{address}</p>
                    <p className="text-[11px] text-gray-500">{ward}</p>
                  </div>
                </div>

                {/* Verification Photos row */}
                <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block mb-1">
                      Problem Evidence:
                    </span>
                    {problemPhoto ? (
                      <img
                        src={problemPhoto}
                        alt="Problem"
                        className="w-full h-24 object-cover rounded-xl border border-gray-200"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 italic">No photo</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 block mb-1">
                      Citizen Geo-Selfie:
                    </span>
                    {citizenPhoto ? (
                      <img
                        src={citizenPhoto}
                        alt="Selfie"
                        className="w-full h-24 object-cover rounded-xl border border-emerald-400"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 italic">No selfie</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering in Supabase...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Grievance to Municipal Care</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
