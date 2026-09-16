import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Clock, ChevronRight, Filter, Search, User, ShieldCheck, LogIn } from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';

interface MyComplaintsScreenProps {
  onSelectComplaint: (complaint: Complaint) => void;
}

export const MyComplaintsScreen: React.FC<MyComplaintsScreenProps> = ({ onSelectComplaint }) => {
  const { t, complaints, currentUser, setIsLoginModalOpen } = useStore();
  const [scope, setScope] = useState<'my' | 'all'>(currentUser ? 'my' : 'all');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter complaints based on scope (personal previous complaints vs all ward complaints)
  // Filter complaints based on scope (personal previous complaints vs all ward complaints)
  const scopedComplaints = complaints.filter((c) => {
    // If user entered a search query (like #PRG-37170 or PRG-37170), allow global lookup across all complaints
    if (searchQuery.trim().length > 0) return true;
    if (scope === 'my' && currentUser) {
      const matchName = c.citizenProfile?.name.toLowerCase() === currentUser.name.toLowerCase();
      const matchEvidence = c.citizenEvidence?.some((e) => e.uploadedBy.includes(currentUser.name));
      return matchName || matchEvidence;
    }
    return true;
  });

  const filteredComplaints = scopedComplaints.filter((c) => {
    if (filter === 'active' && c.status === 'resolved') return false;
    if (filter === 'resolved' && c.status !== 'resolved') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().replace(/^#/, '').trim();
      return (
        c.id.toLowerCase().replace(/^#/, '').includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.subCategory.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        (c.citizenProfile?.name && c.citizenProfile.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'reopened':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {currentUser ? 'My Previous Complaints' : t.nav.complaints}
          </h2>
          <p className="text-xs text-gray-500">
            {currentUser
              ? `Viewing complaint history & timelines for ${currentUser.name}`
              : 'Track live progress and official municipal proof'}
          </p>
        </div>

        {currentUser && (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Citizen</span>
          </span>
        )}
      </div>

      {/* Guest Login Hint Banner */}
      {!currentUser && (
        <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between gap-2">
          <div className="text-xs text-indigo-900">
            <span className="font-bold block">Looking for your past complaints?</span>
            <span className="text-[11px] text-indigo-700">Login with your name to view your personal history.</span>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
        </div>
      )}

      {/* Scope Switcher: My Complaints vs All Ward Complaints (When logged in) */}
      {currentUser && (
        <div className="flex bg-indigo-950/90 p-1 rounded-2xl text-xs font-bold text-white shadow-xs">
          <button
            onClick={() => setScope('my')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              scope === 'my'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:text-white'
            }`}
          >
            My Previous Complaints ({complaints.filter(c => c.citizenProfile?.name.toLowerCase() === currentUser.name.toLowerCase()).length})
          </button>
          <button
            onClick={() => setScope('all')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              scope === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:text-white'
            }`}
          >
            All Ward Issues ({complaints.length})
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
        {(['all', 'active', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              filter === f
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Resolved'}
          </button>
        ))}
      </div>

      {/* Complaint Cards */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">No complaints found</p>
            <p className="text-xs text-gray-400 mt-1">
              Tap the microphone on Home to submit a new complaint
            </p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectComplaint(c)}
              className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 shadow-xs transition-all cursor-pointer flex flex-col space-y-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {c.category === 'roads'
                      ? '🛣️'
                      : c.category === 'sanitation'
                      ? '🗑️'
                      : c.category === 'lighting'
                      ? '💡'
                      : '🚰'}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {c.subCategory}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{c.location.address}</p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    c.status
                  )}`}
                >
                  {t.statuses[c.status] || c.status}
                </span>
              </div>

              {/* Translation snippet */}
              <p className="text-xs text-gray-600 line-clamp-2 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                "{c.translatedDescription}"
              </p>

              {/* Citizen & Stamped Location details */}
              {c.citizenProfile && (
                <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-emerald-50/60 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                  <img
                    src={c.citizenProfile.photoUrl}
                    alt={c.citizenProfile.name}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-400"
                  />
                  <span className="font-bold text-emerald-900 truncate">
                    Registered by {c.citizenProfile.name}
                  </span>
                  <span className="text-emerald-700 text-[10px] ml-auto">
                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Footer details */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                <span className="font-bold text-indigo-700">#{c.id}</span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>SLA: {c.slaHours}h</span>
                </span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                  View Timeline →
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
