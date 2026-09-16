import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mic, Edit3, MapPin, ChevronRight, Clock, Sparkles, Search } from 'lucide-react';
import { Complaint } from '../../types';

interface HomeScreenProps {
  onOpenVoice: () => void;
  onOpenText: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onViewAllComplaints: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenVoice,
  onOpenText,
  onSelectComplaint,
  onViewAllComplaints,
}) => {
  const { t, complaints, currentUser, setIsLoginModalOpen, addToast } = useStore();
  const [trackIdInput, setTrackIdInput] = useState<string>('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? t.greeting.morning : hour < 17 ? t.greeting.afternoon : t.greeting.evening;
    if (currentUser) {
      return `${timeGreeting}, ${currentUser.name}`;
    }
    return `${timeGreeting}, Citizen`;
  };

  const userComplaints = currentUser
    ? complaints.filter(
        (c) =>
          c.citizenProfile?.name.toLowerCase() === currentUser.name.toLowerCase() ||
          c.citizenEvidence?.some((e) => e.uploadedBy.includes(currentUser.name))
      )
    : complaints;

  const recentComplaints = userComplaints.slice(0, 3);

  return (
    <div className="flex flex-col space-y-5 pb-20">
      {/* Conversational Greeting */}
      <div className="pt-2 flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block mb-1.5">
            {getGreeting()}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {t.greeting.question}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {t.tagline}
          </p>
        </div>

        {!currentUser && (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-xs font-bold text-indigo-600 bg-white border border-gray-200 hover:border-indigo-400 px-3 py-1.5 rounded-xl shadow-xs transition-colors shrink-0"
          >
            Login →
          </button>
        )}
      </div>

      {/* Primary Hero Interaction: Tell Pragya what's wrong (Voice CTA) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition-opacity" />

        <div className="relative bg-gradient-to-b from-[#1E1B4B] to-[#312E81] text-white rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden flex flex-col items-center text-center">
          {/* Decorative background glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-amber-500/15 blur-2xl" />

          {/* Voice Prompt */}
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Voice-First Civic Assist
          </span>

          <h3 className="text-xl sm:text-2xl font-bold max-w-xs leading-snug">
            {t.home.micCta}
          </h3>
          <p className="text-xs text-indigo-200 mt-1 mb-6 max-w-xs leading-relaxed">
            {t.home.micSubtext}
          </p>

          {/* Large Pulsing Microphone Button */}
          <button
            type="button"
            onClick={onOpenVoice}
            className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-indigo-950 font-bold flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse-ring cursor-pointer group"
          >
            <Mic className="w-11 h-11 text-indigo-950 group-hover:scale-110 transition-transform" />
          </button>

          <span className="text-[11px] font-semibold text-amber-200 mt-4 tracking-wide">
            Hindi • Marathi • English
          </span>
        </div>
      </div>

      {/* Alternative: Write it instead */}
      <div className="flex items-center gap-3 justify-center text-xs text-gray-400 font-medium">
        <span className="h-px bg-gray-200 flex-1" />
        <span>{t.home.or}</span>
        <span className="h-px bg-gray-200 flex-1" />
      </div>

      <button
        type="button"
        onClick={onOpenText}
        className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
      >
        <Edit3 className="w-4 h-4 text-indigo-600" />
        <span>{t.home.writeCta}</span>
      </button>

      {/* Quick Track by Complaint ID */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-indigo-600" />
            <span>Track Grievance by ID</span>
          </span>
          <span className="text-[10px] text-gray-400 font-medium">e.g. #PRG-37170</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const cleanId = trackIdInput.trim().toUpperCase().replace(/^#/, '');
            if (!cleanId) return;
            const found = complaints.find(
              (c) => c.id.toUpperCase() === cleanId || c.id.toUpperCase() === `PRG-${cleanId}`
            );
            if (found) {
              onSelectComplaint(found);
            } else {
              addToast({
                type: 'error',
                title: 'Complaint Not Found',
                message: `Could not locate #${cleanId}. Showing all complaints.`,
              });
              onViewAllComplaints();
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Enter ID: #PRG-37170 or 37170"
            value={trackIdInput}
            onChange={(e) => setTrackIdInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-gray-800"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Track →
          </button>
        </form>
      </div>

      {/* Detected Location Card */}
      <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {t.home.yourLocation}
            </span>
            <p className="text-xs font-bold text-gray-800">Ward 12, Dharampeth, Nagpur</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          GPS Active
        </span>
      </div>

      {/* Recent Complaints Section */}
      {recentComplaints.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {t.home.recentComplaints}
            </h4>
            <button
              onClick={onViewAllComplaints}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
            >
              <span>{t.home.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 shadow-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0 border border-gray-100">
                    {c.category === 'roads'
                      ? '🛣️'
                      : c.category === 'sanitation'
                      ? '🗑️'
                      : c.category === 'lighting'
                      ? '💡'
                      : '🚰'}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {c.subCategory}
                    </h5>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{c.location.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        #{c.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          c.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.statuses[c.status] || c.status}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

