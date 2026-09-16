import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle, MapPin, Camera, Building2, Clock, Send, X } from 'lucide-react';
import { ComplaintCategory, ComplaintPriority } from '../../types';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    translatedDescription: string;
    category: ComplaintCategory;
    subCategory: string;
    departmentId: string;
    departmentName: string;
    priority: ComplaintPriority;
    slaHours: number;
    photoUrl: string | null;
    location: {
      address: string;
      ward: string;
    };
  };
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  data,
  onSubmit,
  isSubmitting,
}) => {
  const { t, language } = useStore();

  if (!isOpen) return null;

  const categoryIcons: Record<ComplaintCategory, string> = {
    roads: '🛣️',
    sanitation: '🗑️',
    water: '🚰',
    lighting: '💡',
    infrastructure: '🏛️',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">{t.summary.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">{t.summary.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{t.summary.subtitle}</p>
          </div>

          {/* Simple Structured Cards */}
          <div className="space-y-2.5">
            {/* Category */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-2xl">{categoryIcons[data.category] || '🏛️'}</span>
              <div>
                <p className="text-xs font-bold text-gray-900">{data.subCategory}</p>
                <p className="text-[11px] text-gray-500">{t.categories[data.category]}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-900">{data.location.address}</p>
                <p className="text-[11px] text-gray-500">{data.location.ward}</p>
              </div>
            </div>

            {/* Photo Attached */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                <Camera className="w-4 h-4" />
              </span>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-800">
                  {data.photoUrl ? t.summary.photoAttached : t.summary.noPhoto}
                </span>
                {data.photoUrl && (
                  <img
                    src={data.photoUrl}
                    alt="Thumbnail"
                    className="w-9 h-9 object-cover rounded-lg border border-gray-300"
                  />
                )}
              </div>
            </div>

            {/* Department Routing Notice */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900">{data.departmentName}</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                {t.summary.deptNotice}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-indigo-900 font-semibold">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Expected resolution: {data.slaHours} {language === 'mr' ? 'तास' : language === 'hi' ? 'घंटे' : 'hours'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-98 ${
                isSubmitting
                  ? 'bg-indigo-400 text-white cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t.summary.submitting : t.summary.submitBtn}</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-2.5">{t.summary.trackNotice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

