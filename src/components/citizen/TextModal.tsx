import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Edit3, Sparkles, X, Send } from 'lucide-react';
import { ComplaintCategory, ComplaintPriority } from '../../types';

interface TextModalProps {
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

export const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, onProcessed }) => {
  const { t, language } = useStore();
  const [inputText, setInputText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (textToSubmit: string) => {
    const text = textToSubmit.trim();
    if (!text) return;

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

      if (lower.includes('kachra') || lower.includes('कचरा') || lower.includes('garbage') || lower.includes('waste') || lower.includes('dump')) {
        category = 'sanitation';
        subCategory = 'Solid Waste Accumulation';
        departmentId = 'sanitation';
        departmentName = 'Municipal Sanitation & Waste';
        priority = 'medium';
        slaHours = 24;
        translated = 'Communal garbage accumulation and illegal dumping needing clearing.';
      } else if (lower.includes('light') || lower.includes('लाइट') || lower.includes('street') || lower.includes('andhera') || lower.includes('pole')) {
        category = 'lighting';
        subCategory = 'Streetlight Fixture Failure';
        departmentId = 'lighting';
        departmentName = 'Electrical & Street Lighting';
        priority = 'medium';
        slaHours = 24;
        translated = 'Non-operational streetlights leading to safety and visibility issues.';
      } else if (lower.includes('pani') || lower.includes('पाणी') || lower.includes('water') || lower.includes('leak') || lower.includes('pipeline') || lower.includes('drain')) {
        category = 'water';
        subCategory = 'Water Pipeline / Drainage Issue';
        departmentId = 'water';
        departmentName = 'Water Supply & Underground Drainage';
        priority = 'high';
        slaHours = 36;
        translated = 'Water supply infrastructure leak or drainage obstruction reported.';
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
    }, 700);
  };

  const samplePrompts = [
    language === 'mr' ? 'रस्त्यावर मोठा खड्डा आहे' : language === 'hi' ? 'रोड पर बहुत बड़ा गड्ढा है' : 'Big pothole on road',
    language === 'mr' ? 'कचऱ्याची कुंडी भरून वाहत आहे' : language === 'hi' ? 'कचरे का डिब्बा भर गया है' : 'Overflowing trash bin',
    language === 'mr' ? 'गल्लीतील स्ट्रीट लाईट बंद आहे' : language === 'hi' ? 'गली की स्ट्रीट लाइट बंद है' : 'Street light broken',
    language === 'mr' ? 'पिण्याचे पाणी वाया जात आहे' : language === 'hi' ? 'पानी की पाइपलाइन फूट गई' : 'Water pipe burst',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Edit3 className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {language === 'mr' ? 'समस्या लिहून सांगा' : language === 'hi' ? 'समस्या लिखकर बताएं' : 'Describe the problem'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            {language === 'mr'
              ? 'आपल्या परिसरात नेमकी काय अडचण आहे?'
              : language === 'hi'
              ? 'आपके क्षेत्र में क्या समस्या है?'
              : 'What civic issue are you facing?'}
          </label>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'mr'
                ? 'उदा. आमच्या रस्त्यावर मोठा खड्डा पडला आहे...'
                : language === 'hi'
                ? 'उदा. हमारे रोड पर बड़ा गड्ढा हो गया है...'
                : 'e.g. Large pothole on the corner of 5th cross...'
            }
            className="w-full p-3.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
          />

          {/* Quick topic tags */}
          <div className="mt-3">
            <span className="text-[11px] font-medium text-gray-400 block mb-1.5">Quick fill ideas:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(tag)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-full text-xs text-gray-600 transition-colors border border-gray-200"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!inputText.trim() || isAnalyzing}
            onClick={() => handleSubmit(inputText)}
            className={`mt-5 w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
              !inputText.trim() || isAnalyzing
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Pragya is analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Continue →</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

