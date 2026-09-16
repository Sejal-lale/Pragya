import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HomeScreen } from './HomeScreen';
import { MyComplaintsScreen } from './MyComplaintsScreen';
import { CitizenProfileScreen } from './CitizenProfileScreen';
import { VoiceModal } from './VoiceModal';
import { TextModal } from './TextModal';
import { GuidedAssistantModal } from './GuidedAssistantModal';
import { AIUnderstoodModal } from './AIUnderstoodModal';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import { LocationModal } from './LocationModal';
import { SummaryModal } from './SummaryModal';
import { SuccessModal } from './SuccessModal';
import { ComplaintTrackingModal } from './ComplaintTrackingModal';
import { Home, ClipboardList, User, Shield } from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintPriority } from '../../types';

export const CitizenApp: React.FC = () => {
  const { t, language, addComplaint, joinComplaint, mobileFrame } = useStore();
  const [activeTab, setActiveTab] = useState<'home' | 'complaints' | 'profile'>('home');

  // Guided conversational voice assistant state
  const [isGuidedAssistantOpen, setIsGuidedAssistantOpen] = useState<boolean>(false);

  // Multi-step complaint creation state
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isTextOpen, setIsTextOpen] = useState<boolean>(false);
  const [isUnderstoodOpen, setIsUnderstoodOpen] = useState<boolean>(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState<boolean>(false);
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Tracking modal state
  const [trackingComplaint, setTrackingComplaint] = useState<Complaint | null>(null);

  // Staged complaint creation data
  const [draftComplaint, setDraftComplaint] = useState<{
    rawTranscript: string;
    translatedDescription: string;
    category: ComplaintCategory;
    subCategory: string;
    departmentId: string;
    departmentName: string;
    priority: ComplaintPriority;
    slaHours: number;
    photoUrl: string | null;
    location: {
      lat: number;
      lng: number;
      address: string;
      ward: string;
      landmark?: string;
    };
  }>({
    rawTranscript: '',
    translatedDescription: '',
    category: 'roads',
    subCategory: 'Pothole Repair',
    departmentId: 'roads',
    departmentName: 'Roads & Infrastructure',
    priority: 'high',
    slaHours: 48,
    photoUrl: null,
    location: {
      lat: 21.1458,
      lng: 79.0882,
      address: 'Near Laxmi Nagar Square, Wardha Road',
      ward: 'Ward 12, Nagpur',
      landmark: 'Near Bus Stop',
    },
  });

  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);

  // Step 1 -> Step 2 (Voice/Text -> AI Understood)
  const handleProcessedInput = (data: {
    rawTranscript: string;
    translatedDescription: string;
    category: ComplaintCategory;
    subCategory: string;
    departmentId: string;
    departmentName: string;
    priority: ComplaintPriority;
    slaHours: number;
  }) => {
    setDraftComplaint((prev) => ({
      ...prev,
      ...data,
    }));
    setIsVoiceOpen(false);
    setIsTextOpen(false);
    setIsUnderstoodOpen(true);
  };

  // Step 2 -> Step 3 (AI Understood confirmed -> Photo Screen)
  const handleUnderstoodConfirmed = (updatedData: {
    translatedDescription: string;
    category: ComplaintCategory;
    subCategory: string;
    departmentId: string;
    departmentName: string;
    priority: ComplaintPriority;
    slaHours: number;
  }) => {
    setDraftComplaint((prev) => ({
      ...prev,
      ...updatedData,
    }));
    setIsUnderstoodOpen(false);
    setIsPhotoOpen(true);
  };

  // Step 3 -> Step 4 (Photo -> Location Screen)
  const handlePhotoSelected = (photoUrl: string | null) => {
    setDraftComplaint((prev) => ({
      ...prev,
      photoUrl,
    }));
    setIsPhotoOpen(false);
    setIsLocationOpen(true);
  };

  // Step 4 -> Step 5 (Location confirmed -> Summary Screen)
  const handleLocationConfirmed = (locData: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
    landmark?: string;
  }) => {
    setDraftComplaint((prev) => ({
      ...prev,
      location: locData,
    }));
    setIsLocationOpen(false);
    setIsSummaryOpen(true);
  };

  // Duplicate complaint join action
  const handleJoinExisting = (existingId: string) => {
    joinComplaint(existingId);
    setIsLocationOpen(false);
    setActiveTab('complaints');
  };

  // Step 5 -> Final Submit
  const handleFinalSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const deadlineDate = new Date(now.getTime() + draftComplaint.slaHours * 60 * 60 * 1000);

      const newComp = addComplaint({
        title: draftComplaint.subCategory,
        description: draftComplaint.rawTranscript || draftComplaint.translatedDescription,
        originalLanguage: language,
        originalTranscript: draftComplaint.rawTranscript,
        translatedDescription: draftComplaint.translatedDescription,
        category: draftComplaint.category,
        subCategory: draftComplaint.subCategory,
        departmentId: draftComplaint.departmentId,
        departmentName: draftComplaint.departmentName,
        assignedEmployeeId: 'EMP-R042',
        assignedEmployeeName: 'Rahul Sharma',
        priority: draftComplaint.priority,
        status: 'dept_assigned',
        deadline: deadlineDate.toISOString(),
        slaHours: draftComplaint.slaHours,
        location: draftComplaint.location,
        citizenEvidence: draftComplaint.photoUrl
          ? [
              {
                id: 'EV-' + Date.now(),
                imageUrl: draftComplaint.photoUrl,
                timestamp: now.toISOString(),
                uploadedBy: 'Citizen',
                role: 'citizen',
              },
            ]
          : [],
      });

      setIsSubmitting(false);
      setIsSummaryOpen(false);
      setCreatedComplaint(newComp);
      setIsSuccessOpen(true);
    }, 1100);
  };

  // Smartphone / Canvas Wrapper
  const content = (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8F9FA] flex flex-col relative pb-16">
      {/* Citizen Header */}
      <div className="p-4 bg-white border-b border-gray-200/80 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            P
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 tracking-tight leading-none">PRAGYA</h1>
            <span className="text-[10px] text-gray-500 font-medium">Nagpur Civic Care</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ward 12
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeScreen
            onOpenVoice={() => setIsGuidedAssistantOpen(true)}
            onOpenText={() => setIsGuidedAssistantOpen(true)}
            onSelectComplaint={(c) => setTrackingComplaint(c)}
            onViewAllComplaints={() => setActiveTab('complaints')}
          />
        )}
        {activeTab === 'complaints' && (
          <MyComplaintsScreen onSelectComplaint={(c) => setTrackingComplaint(c)} />
        )}
        {activeTab === 'profile' && <CitizenProfileScreen />}
      </main>

      {/* Bottom Navigation: 3 items strictly per design.md Section 3 */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-6 flex items-center justify-around z-30 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.home}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('complaints')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'complaints'
              ? 'text-indigo-600 font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.complaints}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'profile'
              ? 'text-indigo-600 font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.profile}</span>
        </button>
      </nav>

      {/* Guided Conversational Voice Assistant (Spoken dialogue, Name, Problem, Location, Photo, Citizen Selfie with live geo-address) */}
      <GuidedAssistantModal
        isOpen={isGuidedAssistantOpen}
        onClose={() => setIsGuidedAssistantOpen(false)}
        onComplaintCreated={(comp) => {
          setCreatedComplaint(comp);
          setTrackingComplaint(comp);
        }}
      />

      {/* Modals */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onProcessed={handleProcessedInput}
      />

      <TextModal
        isOpen={isTextOpen}
        onClose={() => setIsTextOpen(false)}
        onProcessed={handleProcessedInput}
      />

      <AIUnderstoodModal
        isOpen={isUnderstoodOpen}
        onClose={() => setIsUnderstoodOpen(false)}
        data={draftComplaint}
        onConfirm={handleUnderstoodConfirmed}
        onEdit={() => {
          setIsUnderstoodOpen(false);
          setIsVoiceOpen(true);
        }}
      />

      <PhotoCaptureModal
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        category={draftComplaint.category}
        onPhotoSelected={handlePhotoSelected}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onLocationConfirmed={handleLocationConfirmed}
        onJoinExisting={handleJoinExisting}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        data={draftComplaint}
        onSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        complaint={createdComplaint}
        onTrack={(id) => {
          setIsSuccessOpen(false);
          setTrackingComplaint(createdComplaint);
        }}
        onHome={() => {
          setIsSuccessOpen(false);
          setActiveTab('home');
        }}
      />

      <ComplaintTrackingModal
        complaint={trackingComplaint}
        onClose={() => setTrackingComplaint(null)}
      />
    </div>
  );

  // Render inside phone mockup frame if mobileFrame is enabled
  if (mobileFrame) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-900 py-6 px-4 flex items-center justify-center">
        <div className="w-full max-w-[410px] h-[840px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-2xl ring-12 ring-slate-800 relative flex flex-col">
          {/* Phone speaker notch */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-neutral-800 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-neutral-800 ml-3" />
          </div>

          <div className="w-full h-full bg-[#F8F9FA] rounded-[38px] overflow-hidden flex flex-col relative pt-4">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};

