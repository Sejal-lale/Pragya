import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, ArrowRight, Home, Building2, Clock, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Complaint } from '../../types';

interface SuccessModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  onTrack: (id: string) => void;
  onHome: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  complaint,
  onTrack,
  onHome,
}) => {
  const { t, language } = useStore();

  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#6366F1'],
      });
    }
  }, [isOpen]);

  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 text-center space-y-4">
          {/* Animated Success Badge */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-gray-900">{t.success.title}</h3>
            <p className="text-sm font-bold text-indigo-700 mt-1 bg-indigo-50 py-1 px-3 rounded-full inline-block border border-indigo-100">
              #{complaint.id}
            </p>
          </div>

          {/* Department & SLA Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold">{t.success.routedTo}:</span>
              <span className="text-gray-900 font-bold ml-auto">{complaint.departmentName}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-700 border-t border-gray-200 pt-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">{t.success.slaNotice}</span>
              <span className="text-xs font-bold text-emerald-700 ml-auto bg-emerald-50 px-2 py-0.5 rounded-md">
                On Track
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 italic px-4 leading-relaxed">
            {t.success.notifyNote}
          </p>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => onTrack(complaint.id)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>{t.success.trackBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onHome}
              className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.success.homeBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

