import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Clock,
  MapPin,
  Building2,
  HardHat,
  CheckCircle2,
  Circle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';

interface ComplaintTrackingModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const ComplaintTrackingModal: React.FC<ComplaintTrackingModalProps> = ({
  complaint,
  onClose,
}) => {
  const { t, language, addCitizenFeedback } = useStore();
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(!!complaint?.citizenFeedback);
  const [showFeedbackInput, setShowFeedbackInput] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  if (!complaint) return null;

  // Timeline step definitions
  const timelineSteps: { key: ComplaintStatus; label: string; desc?: string }[] = [
    { key: 'submitted', label: t.tracking.reported, desc: new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { key: 'dept_assigned', label: t.tracking.deptAssigned, desc: complaint.departmentName },
    { key: 'employee_assigned', label: t.tracking.empAssigned, desc: complaint.assignedEmployeeName || 'Assigned to field team' },
    { key: 'in_progress', label: t.tracking.inProgress, desc: 'Team is on-site working' },
    { key: 'completed', label: t.tracking.completed, desc: 'Proof uploaded' },
    { key: 'verified', label: t.tracking.verified, desc: 'Reviewed by Municipal Supervisor' },
    { key: 'resolved', label: t.tracking.resolved, desc: 'Problem fixed' },
  ];

  const getStepStatus = (stepKey: ComplaintStatus) => {
    const statusOrder: ComplaintStatus[] = [
      'submitted',
      'classified',
      'dept_assigned',
      'employee_assigned',
      'accepted',
      'in_progress',
      'completed',
      'verified',
      'resolved',
    ];

    const currentIdx = statusOrder.indexOf(complaint.status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (complaint.status === 'reopened' && stepKey === 'verified') {
      return 'warning';
    }

    if (currentIdx >= stepIdx) {
      return 'completed';
    }
    if (currentIdx === stepIdx - 1) {
      return 'current';
    }
    return 'pending';
  };

  const handleFeedback = (satisfied: boolean) => {
    if (!satisfied) {
      setShowFeedbackInput(true);
    } else {
      addCitizenFeedback(complaint.id, true);
      setFeedbackGiven(true);
    }
  };

  const handleDetailedFeedbackSubmit = () => {
    addCitizenFeedback(complaint.id, false, feedbackComment);
    setFeedbackGiven(true);
    setShowFeedbackInput(false);
  };

  const citizenPhoto = complaint.citizenEvidence?.[0]?.imageUrl;
  const resolutionPhoto = complaint.resolutionEvidence?.[0]?.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-[#1E1B4B] text-white">
          <div>
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Complaint Tracking
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>#{complaint.id}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-800 text-indigo-200 border border-indigo-700">
                {t.statuses[complaint.status] || complaint.status}
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Quick Summary Card */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <h4 className="text-sm font-bold text-gray-900 leading-snug">{complaint.subCategory}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              "{complaint.translatedDescription}"
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 border-t border-gray-200/80">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>{complaint.location.address}</span>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{complaint.departmentName}</span>
              </span>
            </div>
          </div>

          {/* Registered Citizen Profile & Geo-Address Authentication Card */}
          {complaint.citizenProfile && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <img
                src={complaint.citizenProfile.photoUrl}
                alt={complaint.citizenProfile.name}
                className="w-13 h-13 rounded-xl object-cover ring-2 ring-emerald-500 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Registered by: {complaint.citizenProfile.name}</span>
                </div>
                <p className="text-[11px] text-gray-600 truncate mt-0.5">
                  📍 {complaint.citizenProfile.registrationAddress}
                </p>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mt-1">
                  ✓ On-site Verified Reporter
                </span>
              </div>
            </div>
          )}

          {/* SLA Timer Indicator */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-indigo-950 block">Resolution Target</span>
                <span className="text-[11px] text-indigo-700">
                  Target SLA: {complaint.slaHours} hours
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {complaint.status === 'resolved' ? 'Resolved in SLA' : 'In Progress'}
            </span>
          </div>

          {/* Visual Resolution Timeline */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {t.tracking.timelineTitle}
            </h4>

            <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {timelineSteps.map((step, idx) => {
                const state = getStepStatus(step.key);
                return (
                  <div key={idx} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                        state === 'completed'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : state === 'current'
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : state === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-300'
                      }`}
                    >
                      {state === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : state === 'current' ? (
                        <Circle className="w-2.5 h-2.5 fill-white" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-xs font-bold ${
                          state === 'completed'
                            ? 'text-gray-900'
                            : state === 'current'
                            ? 'text-indigo-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.desc && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before & After Photo Comparison (PRD Section 23) */}
          {(citizenPhoto || resolutionPhoto) && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                {t.tracking.proofTitle}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Before Photo */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Citizen Photo (Before)
                  </span>
                  {citizenPhoto ? (
                    <img
                      src={citizenPhoto}
                      alt="Before work"
                      className="w-full h-32 object-cover rounded-xl border border-gray-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-full h-32 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-400 italic">
                      No photo provided
                    </div>
                  )}
                </div>

                {/* After Photo */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Municipal Proof (After)
                  </span>
                  {resolutionPhoto ? (
                    <div className="relative">
                      <img
                        src={resolutionPhoto}
                        alt="After repair"
                        className="w-full h-32 object-cover rounded-xl border-2 border-emerald-500 shadow-xs"
                      />
                      <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-2">
                      <Clock className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-[11px] text-gray-500 font-medium">Work in progress</span>
                      <span className="text-[10px] text-gray-400">Proof uploaded upon fix</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Citizen Feedback Section (PRD Section 26) */}
          {complaint.status === 'resolved' && (
            <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl">
              <h4 className="text-xs font-bold text-indigo-950 mb-1">
                {t.tracking.feedbackTitle}
              </h4>
              <p className="text-[11px] text-indigo-700 mb-3">
                Your feedback ensures municipal teams remain responsive and accountable.
              </p>

              {complaint.citizenFeedback ? (
                <div className="p-3 bg-white rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {complaint.citizenFeedback.satisfied
                        ? 'Citizen rated: Satisfied with resolution'
                        : 'Citizen reported: Issue still pending review'}
                    </span>
                  </div>
                  {complaint.citizenFeedback.comment && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{complaint.citizenFeedback.comment}"
                    </p>
                  )}
                </div>
              ) : showFeedbackInput ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us what is still wrong..."
                    className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleDetailedFeedbackSubmit}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Flag Issue for Supervisor Reopening
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback(true)}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{t.tracking.feedbackYes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(false)}
                    className="flex-1 py-2.5 px-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{t.tracking.feedbackNo}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

