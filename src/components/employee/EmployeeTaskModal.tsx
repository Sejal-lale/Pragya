import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Play,
  Upload,
  ArrowRight,
  ShieldAlert,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Complaint, EvidenceItem } from '../../types';
import { sampleCivicImages } from '../../data/mockData';

interface EmployeeTaskModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const EmployeeTaskModal: React.FC<EmployeeTaskModalProps> = ({ complaint, onClose }) => {
  const { updateComplaintStatus, addToast } = useStore();
  const [isStartingWork, setIsStartingWork] = useState<boolean>(false);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [workNotes, setWorkNotes] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!complaint) return null;

  // Calculate SLA countdown
  const deadlineDate = new Date(complaint.deadline).getTime();
  const now = new Date().getTime();
  const diffHours = Math.round((deadlineDate - now) / (1000 * 60 * 60));
  const isOverdue = diffHours < 0;

  // Set default sample proof photo matching category
  const setDefaultSampleProof = () => {
    if (complaint.category === 'roads') setProofPhoto(sampleCivicImages.potholeAfter);
    else if (complaint.category === 'sanitation') setProofPhoto(sampleCivicImages.garbageAfter);
    else if (complaint.category === 'lighting') setProofPhoto(sampleCivicImages.streetlightAfter);
    else setProofPhoto(sampleCivicImages.waterleakAfter);
  };

  const handleStartWork = () => {
    setIsStartingWork(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateComplaintStatus(
      complaint.id,
      'in_progress',
      complaint.assignedEmployeeName || 'Field Employee',
      `Field work started at ${timeStr}. Equipment and crew on site.`
    );
    setIsStartingWork(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteTask = () => {
    if (!proofPhoto) {
      addToast({
        type: 'warning',
        title: 'Proof Required',
        message: 'Please upload an after-photo to verify resolution before completing.',
      });
      return;
    }

    setIsCompleting(true);
    const now = new Date().toISOString();

    const evidence: EvidenceItem = {
      id: 'EV-RES-' + Date.now(),
      imageUrl: proofPhoto,
      timestamp: now,
      uploadedBy: complaint.assignedEmployeeName || 'Field Officer',
      role: 'employee',
      note: workNotes || 'Repairs completed and inspected by field unit.',
    };

    updateComplaintStatus(
      complaint.id,
      'completed',
      complaint.assignedEmployeeName || 'Field Employee',
      workNotes || 'Field work finished. Evidence submitted for Supervisor verification.',
      evidence
    );

    setIsCompleting(false);
    onClose();
  };

  const citizenPhoto = complaint.citizenEvidence?.[0]?.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-800 text-indigo-200 border border-indigo-700">
                #{complaint.id}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  complaint.priority === 'critical'
                    ? 'bg-rose-600 text-white'
                    : complaint.priority === 'high'
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {complaint.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{complaint.subCategory}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* SLA Countdown Bar */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isOverdue
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : diffHours < 12
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold">
                {isOverdue
                  ? `SLA Breach: Overdue by ${Math.abs(diffHours)} hours`
                  : `⏱ ${diffHours}h remaining until deadline`}
              </span>
            </div>
            <span className="text-xs font-semibold">
              Deadline: {new Date(complaint.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Registered Citizen Profile & Geo-Address Card */}
          {complaint.citizenProfile && (
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <img
                src={complaint.citizenProfile.photoUrl}
                alt={complaint.citizenProfile.name}
                className="w-13 h-13 rounded-xl object-cover ring-2 ring-emerald-500 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Reported by: {complaint.citizenProfile.name}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full ml-auto">
                    ✓ Verified Reporter
                  </span>
                </div>
                <p className="text-[11px] text-gray-700 truncate mt-0.5">
                  📍 {complaint.citizenProfile.registrationAddress}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Registered: {new Date(complaint.citizenProfile.registeredAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Description & Citizen Voice Transcript */}
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Citizen Reported Issue
              </span>
              <p className="text-sm font-medium text-gray-800 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                "{complaint.translatedDescription}"
              </p>
              {complaint.originalTranscript && (
                <p className="text-xs text-gray-500 italic mt-1 px-1">
                  Original transcript ({complaint.originalLanguage}): "{complaint.originalTranscript}"
                </p>
              )}
            </div>

            {/* Location */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900">{complaint.location.address}</p>
                  <p className="text-[11px] text-gray-500">{complaint.location.ward}</p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${complaint.location.lat},${complaint.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Citizen Photo Evidence */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Citizen Photo Evidence (Before)
            </span>
            {citizenPhoto ? (
              <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-64 shadow-xs">
                <img
                  src={citizenPhoto}
                  alt="Citizen evidence"
                  className="w-full h-56 object-cover"
                />
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center text-xs text-gray-400 italic">
                Citizen submitted complaint without photo
              </div>
            )}
          </div>

          {/* Status Workflow Action Area */}
          <div className="pt-2 border-t border-gray-200 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Field Execution Actions
            </h4>

            {complaint.status === 'dept_assigned' || complaint.status === 'employee_assigned' ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateComplaintStatus(
                      complaint.id,
                      'accepted',
                      complaint.assignedEmployeeName || 'Rahul Sharma',
                      'Task accepted by field officer.'
                    )
                  }
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Accept Task
                </button>
              </div>
            ) : complaint.status === 'accepted' ? (
              <button
                type="button"
                onClick={handleStartWork}
                disabled={isStartingWork}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Work on Site (Record Timestamp)</span>
              </button>
            ) : complaint.status === 'in_progress' ? (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">
                    Upload Completion Proof (After Photo)
                  </span>
                  <button
                    type="button"
                    onClick={setDefaultSampleProof}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Load Sample Repaired Photo
                  </button>
                </div>

                {proofPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm max-h-48">
                    <img
                      src={proofPhoto}
                      alt="Work Proof"
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setProofPhoto(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 bg-white border-2 border-dashed border-indigo-300 rounded-xl text-center cursor-pointer hover:bg-indigo-50/50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-gray-800">Tap to upload completion proof</p>
                    <p className="text-[11px] text-gray-400">Camera snap or photo library</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                <textarea
                  rows={2}
                  value={workNotes}
                  onChange={(e) => setWorkNotes(e.target.value)}
                  placeholder="Notes on resolution (e.g., Pothole filled with cold asphalt mix, leveled, barricades removed)..."
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={handleCompleteTask}
                  disabled={isCompleting || !proofPhoto}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    !proofPhoto
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 active:scale-98'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Work Completed & Submit to Supervisor</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Work has been completed and verified. This complaint is currently {complaint.status}.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

