import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  HardHat,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Complaint } from '../../types';
import confetti from 'canvas-confetti';

interface VerificationQueueProps {
  onSelectComplaint?: (c: Complaint) => void;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = () => {
  const { complaints, verifyComplaint, addToast } = useStore();
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState<string>('');
  const [showReopenInput, setShowReopenInput] = useState<boolean>(false);

  // Complaints ready for verification (status === 'completed' or 'verified')
  const completedComplaints = complaints.filter(
    (c) => c.status === 'completed' || c.status === 'verified'
  );

  const activeComplaint =
    completedComplaints.find((c) => c.id === activeComplaintId) || completedComplaints[0] || null;

  const handleVerify = (id: string) => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#10B981', '#4F46E5', '#3B82F6'],
    });

    verifyComplaint(id, true, 'Supervisor verification sign-off completed.');
    addToast({
      type: 'success',
      title: 'Resolution Verified',
      message: `${id} has been verified and marked as fully resolved.`,
    });
  };

  const handleReopen = (id: string) => {
    if (!reopenReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Remarks Required',
        message: 'Please provide feedback explaining what work is still required.',
      });
      return;
    }

    verifyComplaint(id, false, reopenReason);
    setShowReopenInput(false);
    setReopenReason('');
  };

  if (completedComplaints.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-xs">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-900">Verification Queue is Clear</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          No complaints currently awaiting supervisor inspection. When field employees submit proof of work, they will appear here for review.
        </p>
      </div>
    );
  }

  const citizenPhoto = activeComplaint?.citizenEvidence?.[0]?.imageUrl;
  const resolutionPhoto = activeComplaint?.resolutionEvidence?.[0]?.imageUrl;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Completion Verification Desk</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {completedComplaints.filter((c) => c.status === 'completed').length} Pending Sign-off
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare citizen complaint against employee resolution evidence before signing off
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of items awaiting verification */}
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          {completedComplaints.map((item) => {
            const isSelected = activeComplaint?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveComplaintId(item.id);
                  setShowReopenInput(false);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-800">#{item.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status === 'verified' ? 'Verified' : 'Needs Verification'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">
                  {item.subCategory}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                  {item.location.address}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-200/60">
                  <span>Worker: {item.assignedEmployeeName || 'Field unit'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Side-by-side Evidence Comparison & Decision */}
        {activeComplaint && (
          <div className="lg:col-span-2 bg-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-700">#{activeComplaint.id}</span>
                <h3 className="text-base font-bold text-gray-900">{activeComplaint.subCategory}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeComplaint.location.address} • {activeComplaint.location.ward}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {activeComplaint.departmentName}
                </span>
              </div>
            </div>

            {/* 3-Point Visual Evidence: Citizen Verification + Before + After */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  3-Point Visual Verification
                </span>
                <span className="text-[11px] text-gray-400">Citizen Reporter • Before Issue • After Work</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Citizen Verification Photo */}
                <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-emerald-300 shadow-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-800">1. Citizen Reporter</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">Verified</span>
                  </div>
                  {activeComplaint.citizenProfile ? (
                    <div className="relative">
                      <img
                        src={activeComplaint.citizenProfile.photoUrl}
                        alt="Citizen"
                        className="w-full h-36 object-cover rounded-lg border border-emerald-200"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1 text-[9px] text-white rounded-b-lg truncate">
                        📍 {activeComplaint.citizenProfile.registrationAddress}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-36 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 italic">
                      Legacy report
                    </div>
                  )}
                  <p className="text-[11px] font-bold text-gray-800 truncate">
                    {activeComplaint.citizenProfile?.name || 'Citizen'}
                  </p>
                </div>

                {/* 2. Before Photo */}
                <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gray-600">2. Issue (Before)</span>
                    <span className="text-gray-400">Reported</span>
                  </div>
                  {citizenPhoto ? (
                    <img
                      src={citizenPhoto}
                      alt="Before"
                      className="w-full h-36 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 italic">
                      No photo
                    </div>
                  )}
                  <p className="text-[11px] text-gray-600 line-clamp-1 italic">
                    "{activeComplaint.translatedDescription}"
                  </p>
                </div>

                {/* 3. After Photo */}
                <div className="space-y-1.5 bg-white p-2.5 rounded-xl border-2 border-emerald-500 shadow-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-700">3. Proof (After)</span>
                    <span className="text-emerald-600 font-semibold">Repaired</span>
                  </div>
                  {resolutionPhoto ? (
                    <img
                      src={resolutionPhoto}
                      alt="After"
                      className="w-full h-36 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 italic">
                      No after photo
                    </div>
                  )}
                  <p className="text-[11px] text-gray-600 line-clamp-1 font-medium">
                    Note: {activeComplaint.resolutionEvidence?.[0]?.note || 'Work completed on site.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee notes and actions */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1">
              <span className="font-bold text-gray-700">Assigned Officer:</span>
              <p className="text-gray-600">
                {activeComplaint.assignedEmployeeName || 'Rahul Sharma'} (Status: {activeComplaint.status})
              </p>
            </div>

            {/* Supervisor Actions */}
            <div className="pt-2">
              {showReopenInput ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="Provide detailed feedback for worker (e.g., Road surface needs better asphalt compaction)..."
                    className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReopen(activeComplaint.id)}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                    >
                      Confirm Reopening & Notify Field Officer
                    </button>
                    <button
                      type="button"
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
                    type="button"
                    onClick={() => handleVerify(activeComplaint.id)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Verify Resolution & Close Complaint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReopenInput(true)}
                    className="py-3 px-4 bg-white hover:bg-rose-50 border border-gray-300 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>↻ Reopen</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

