import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  HardHat,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Complaint } from '../../types';
import confetti from 'canvas-confetti';

interface SupervisorComplaintModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const SupervisorComplaintModal: React.FC<SupervisorComplaintModalProps> = ({
  complaint,
  onClose,
}) => {
  const { verifyComplaint, addToast, t } = useStore();
  const [showReopenInput, setShowReopenInput] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');

  if (!complaint) return null;

  const citizenPhoto = complaint.citizenEvidence?.[0]?.imageUrl;
  const resolutionPhoto = complaint.resolutionEvidence?.[0]?.imageUrl;

  const handleVerify = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    verifyComplaint(complaint.id, true, 'Supervisor approved resolution.');
    onClose();
  };

  const handleReopen = () => {
    if (!reopenReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Feedback Required',
        message: 'Please explain what needs to be rectified before reopening.',
      });
      return;
    }
    verifyComplaint(complaint.id, false, reopenReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1E1B4B] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-800 text-indigo-200">
                #{complaint.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                {complaint.departmentName}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{complaint.subCategory}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status & SLA Banner */}
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">Status: {t.statuses[complaint.status] || complaint.status}</span>
              <span className="text-[11px] text-indigo-700">Target SLA: {complaint.slaHours} hours</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-200/80 text-indigo-900">
              Priority: {complaint.priority.toUpperCase()}
            </span>
          </div>

          {/* Citizen Description */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Citizen Complaint
            </span>
            <p className="text-sm font-medium text-gray-900">
              "{complaint.translatedDescription}"
            </p>
            {complaint.originalTranscript && (
              <p className="text-xs text-gray-500 italic">
                Spoken ({complaint.originalLanguage}): "{complaint.originalTranscript}"
              </p>
            )}
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-600 border-t border-gray-200/70">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>{complaint.location.address} ({complaint.location.ward})</span>
            </div>
          </div>

          {/* Registered Citizen Profile & Geo-Address Card */}
          {complaint.citizenProfile && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <img
                src={complaint.citizenProfile.photoUrl}
                alt={complaint.citizenProfile.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reported by: {complaint.citizenProfile.name}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full ml-auto font-semibold">
                    ✓ Verified
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 truncate mt-0.5">
                  📍 {complaint.citizenProfile.registrationAddress}
                </p>
              </div>
            </div>
          )}

          {/* Side by Side Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-1.5">
              <span className="text-xs font-bold text-gray-700 block">Citizen Photo (Before)</span>
              {citizenPhoto ? (
                <img
                  src={citizenPhoto}
                  alt="Before"
                  className="w-full h-40 object-cover rounded-xl border border-gray-200"
                />
              ) : (
                <div className="w-full h-40 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No citizen photo
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-2xl border-2 border-emerald-500 space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 block">Work Evidence (After)</span>
              {resolutionPhoto ? (
                <img
                  src={resolutionPhoto}
                  alt="After"
                  className="w-full h-40 object-cover rounded-xl border border-gray-200"
                />
              ) : (
                <div className="w-full h-40 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  Awaiting work completion
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-2 border-t border-gray-200">
            {showReopenInput ? (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Reason for reopening..."
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReopen}
                    className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm Reopen
                  </button>
                  <button
                    onClick={() => setShowReopenInput(false)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleVerify}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Verify Resolution & Close</span>
                </button>

                <button
                  onClick={() => setShowReopenInput(true)}
                  className="py-3 px-4 bg-white hover:bg-rose-50 border border-gray-300 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>↻ Reopen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

