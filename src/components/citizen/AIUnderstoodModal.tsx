import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Check, Edit2, Clock, Building2, ShieldAlert, ArrowRight } from 'lucide-react';
import { ComplaintCategory, ComplaintPriority } from '../../types';

interface AIUnderstoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    rawTranscript: string;
    translatedDescription: string;
    category: ComplaintCategory;
    subCategory: string;
    departmentId: string;
    departmentName: string;
    priority: ComplaintPriority;
    slaHours: number;
  };
  onConfirm: (updatedData: {
    translatedDescription: string;
    category: ComplaintCategory;
    subCategory: string;
    departmentId: string;
    departmentName: string;
    priority: ComplaintPriority;
    slaHours: number;
  }) => void;
  onEdit: () => void;
}

export const AIUnderstoodModal: React.FC<AIUnderstoodModalProps> = ({
  isOpen,
  onClose,
  data,
  onConfirm,
  onEdit,
}) => {
  const { t, language } = useStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(data.translatedDescription);

  if (!isOpen) return null;

  const categoryIcons: Record<ComplaintCategory, string> = {
    roads: '🛣️',
    sanitation: '🗑️',
    water: '🚰',
    lighting: '💡',
    infrastructure: '🏛️',
  };

  const handleSaveAndConfirm = () => {
    onConfirm({
      ...data,
      translatedDescription: description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header with AI Badge */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/20 rounded-lg backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{t.understood.title}</h3>
              <p className="text-[11px] text-indigo-200">{t.understood.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Core Card Content */}
        <div className="p-5 space-y-4">
          {/* Category Highlight */}
          <div className="flex items-center gap-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <span className="text-3xl">{categoryIcons[data.category] || '🏛️'}</span>
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                {t.understood.categoryLabel}
              </span>
              <p className="text-sm font-bold text-gray-900">{data.subCategory}</p>
              <p className="text-xs text-gray-500">{t.categories[data.category]}</p>
            </div>
          </div>

          {/* Citizen Speech & Understood Meaning */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            {data.rawTranscript && (
              <div className="mb-2 pb-2 border-b border-gray-200/80">
                <span className="text-[11px] text-gray-400 font-medium block">
                  {language === 'mr' ? 'आपण जे बोललात:' : language === 'hi' ? 'आपने जो कहा:' : 'Your spoken words:'}
                </span>
                <p className="text-xs text-gray-700 italic">"{data.rawTranscript}"</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                  {language === 'mr' ? 'प्रज्ञाने समजलेला अर्थ:' : language === 'hi' ? 'प्रज्ञा का विश्लेषण:' : 'Understood civic issue:'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditing ? 'Done' : t.understood.editBtn}</span>
                </button>
              </div>

              {isEditing ? (
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  "{description}"
                </p>
              )}
            </div>
          </div>

          {/* Department & SLA Intelligence */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.understood.departmentLabel}</span>
              </div>
              <p className="text-xs font-bold text-gray-800 line-clamp-1">{data.departmentName}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.understood.slaLabel}</span>
              </div>
              <p className="text-xs font-bold text-gray-800">
                {data.slaHours} {language === 'mr' ? 'तास' : language === 'hi' ? 'घंटे' : 'Hours'}
              </p>
            </div>
          </div>

          {/* Priority Note */}
          <div className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold">Priority: {t.priorities[data.priority]}</span>
            </div>
            <span className="text-[11px] text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full font-medium">
              Auto-Assigned
            </span>
          </div>

          {/* Confirmation Question & Actions */}
          <div className="pt-2">
            <p className="text-center text-xs font-semibold text-gray-600 mb-3">
              {t.understood.isCorrect}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveAndConfirm}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>{t.understood.confirmBtn}</span>
              </button>

              <button
                onClick={onEdit}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                {language === 'mr' ? 'पुन्हा बोला / बदल करा' : language === 'hi' ? 'फिर से बोलें / बदलें' : 'Speak again / Cancel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

