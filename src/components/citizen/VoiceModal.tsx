import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mic, MicOff, Volume2, Sparkles, X, ChevronRight } from 'lucide-react';
import { ComplaintCategory, ComplaintPriority } from '../../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessed: (data: {
    rawTranscript: string;
    translatedDescription: string;
    category: ComplaintCategory;
    subCategory: string;
    departmentId: string;
    departmentName: string;
    priority: ComplaintPriority;
    slaHours: number;
  }) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose, onProcessed }) => {
  const { t, language } = useStore();
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Web Speech API Support
  useEffect(() => {
    if (!isOpen) return;
    setIsRecording(true);
    setTranscript('');

    const windowObj = window as unknown as {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    };
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    let recognition: any = null;

    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onerror = () => {
          // graceful fallback
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch {
        // speech recognition not supported or permission denied
      }
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, language]);

  if (!isOpen) return null;

  // AI Classification mapping simulator
  const handleProcessText = (text: string) => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let category: ComplaintCategory = 'roads';
      let subCategory = 'Pothole Repair';
      let departmentId = 'roads';
      let departmentName = 'Roads & Infrastructure';
      let priority: ComplaintPriority = 'high';
      let slaHours = 48;
      let translated = text;

      if (lower.includes('kachra') || lower.includes('कचरा') || lower.includes('garbage') || lower.includes('dustbin') || lower.includes('waste')) {
        category = 'sanitation';
        subCategory = 'Garbage Accumulation';
        departmentId = 'sanitation';
        departmentName = 'Municipal Sanitation & Waste';
        priority = 'medium';
        slaHours = 24;
        translated = 'Garbage accumulation near market area creating health risk and odor.';
      } else if (lower.includes('light') || lower.includes('लाइट') || lower.includes('street') || lower.includes('andhera') || lower.includes('अंधार') || lower.includes('दीवा')) {
        category = 'lighting';
        subCategory = 'Streetlight Fixture Failure';
        departmentId = 'lighting';
        departmentName = 'Electrical & Street Lighting';
        priority = 'medium';
        slaHours = 24;
        translated = 'Streetlight not working on main stretch for several days, causing pitch dark condition.';
      } else if (lower.includes('pani') || lower.includes('पाणी') || lower.includes('water') || lower.includes('pipe') || lower.includes('drain') || lower.includes('nali') || lower.includes('नाली')) {
        category = 'water';
        subCategory = 'Water Pipeline / Drainage Blockage';
        departmentId = 'water';
        departmentName = 'Water Supply & Underground Drainage';
        priority = 'high';
        slaHours = 36;
        translated = 'Severely leaking drinking water pipe causing water wastage and street flooding.';
      } else {
        // Default road/pothole
        category = 'roads';
        subCategory = 'Road Pothole / Crater';
        departmentId = 'roads';
        departmentName = 'Roads & Infrastructure';
        priority = 'high';
        slaHours = 48;
        translated = 'Large crater/pothole on the roadway posing severe accident hazard for two-wheelers.';
      }

      setIsAnalyzing(false);
      onProcessed({
        rawTranscript: text,
        translatedDescription: translated,
        category,
        subCategory,
        departmentId,
        departmentName,
        priority,
        slaHours,
      });
    }, 900);
  };

  const samplePresets = [
    {
      title: '🛣️ Pothole on Road',
      text:
        language === 'mr'
          ? 'आमच्या रस्त्यावर खूप मोठा खड्डा पडला आहे, गाड्या पडत आहेत'
          : language === 'hi'
          ? 'हमारे रोड पर बहुत बड़ा गड्ढा है और गाड़ियां फिसल रही हैं'
          : 'There is a large dangerous pothole on the road near the bus stop',
    },
    {
      title: '🗑️ Garbage Overflow',
      text:
        language === 'mr'
          ? 'बाजारपेठेत चार दिवसांपासून कचरा उचललेला नाही, दुर्गंधी पसरली आहे'
          : language === 'hi'
          ? 'यहां बाजार के पास चार दिन से कचरा नहीं उठाया गया है, बहुत बदबू आ रही है'
          : 'Garbage dumpster overflowing near the local market for 4 days',
    },
    {
      title: '💡 Broken Streetlight',
      text:
        language === 'mr'
          ? 'रस्त्यावरील स्ट्रीट लाईट बंद आहे, रात्री पूर्ण अंधार असतो'
          : language === 'hi'
          ? 'स्ट्रीट लाइट खराब है, रात को पूरा अंधेरा रहता है और डर लगता है'
          : 'Streetlight pole dark for 3 consecutive nights near cross road',
    },
    {
      title: '🚰 Water Pipeline Leak',
      text:
        language === 'mr'
          ? 'मुख्य पिण्याच्या पाण्याची पाईपलाईन फुटली असून पाणी वाया जात आहे'
          : language === 'hi'
          ? 'मेन पाइपलाइन टूट गई है और पीने का हजारों लीटर पानी बह रहा है'
          : 'Drinking water pipeline ruptured and flooding the street',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Volume2 className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">Pragya Voice Assist</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Mic Interaction */}
        <div className="p-6 text-center flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-gray-900">
            {isAnalyzing ? 'Understanding issue...' : t.voice.listening}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">{t.voice.instruction}</p>

          {/* Animated Big Mic Button */}
          <div className="my-7 relative flex items-center justify-center">
            {isRecording && !isAnalyzing && (
              <div className="absolute w-32 h-32 rounded-full bg-indigo-500/20 animate-pulse-ring" />
            )}
            <button
              onClick={() => {
                if (transcript) {
                  handleProcessText(transcript);
                } else {
                  setIsRecording(!isRecording);
                }
              }}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 ${
                isAnalyzing
                  ? 'bg-amber-500 text-white animate-spin'
                  : isRecording
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-indigo-300'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isAnalyzing ? (
                <Sparkles className="w-10 h-10 animate-pulse" />
              ) : isRecording ? (
                <Mic className="w-10 h-10" />
              ) : (
                <MicOff className="w-10 h-10" />
              )}
            </button>
          </div>

          {/* Sound wave visualization */}
          {isRecording && !isAnalyzing && (
            <div className="flex items-center gap-1.5 h-12 justify-center mb-2">
              <span className="w-1.5 bg-indigo-500 rounded-full animate-soundwave-1" />
              <span className="w-1.5 bg-indigo-600 rounded-full animate-soundwave-2" />
              <span className="w-1.5 bg-indigo-700 rounded-full animate-soundwave-3" />
              <span className="w-1.5 bg-indigo-600 rounded-full animate-soundwave-4" />
              <span className="w-1.5 bg-indigo-500 rounded-full animate-soundwave-5" />
            </div>
          )}

          {/* Live speech preview */}
          <div className="w-full bg-gray-50 rounded-2xl p-3.5 border border-gray-200 min-h-[60px] flex items-center justify-center text-sm text-gray-700 italic">
            {transcript ? (
              `"${transcript}"`
            ) : isRecording ? (
              <span className="text-gray-400 not-italic">Speak clearly near your phone...</span>
            ) : (
              <span className="text-gray-400 not-italic">Tap the mic or choose a preset below</span>
            )}
          </div>

          {transcript && !isAnalyzing && (
            <button
              onClick={() => handleProcessText(transcript)}
              className="mt-3 w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all"
            >
              Done speaking → Continue
            </button>
          )}
        </div>

        {/* Quick Presets / Examples for instant 1-click test */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/80 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.voice.quickPresetsTitle}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {samplePresets.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleProcessText(preset.text)}
                className="text-left p-2.5 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-800">{preset.title}</p>
                  <p className="text-[11px] text-gray-500 line-clamp-1 italic mt-0.5">"{preset.text}"</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

