import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CityGISMap } from './CityGISMap';
import { VerificationQueue } from './VerificationQueue';
import { SupervisorComplaintModal } from './SupervisorComplaintModal';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  Building2,
  Users,
  Search,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '../../types';

export const SupervisorDashboard: React.FC = () => {
  const { complaints } = useStore();
  const [activeTab, setActiveTab] = useState<'map' | 'verification' | 'complaints'>('map');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Department counts
  const getDeptCount = (deptId: string) => {
    return complaints.filter((c) => c.departmentId === deptId && c.status !== 'resolved').length;
  };

  const totalComplaints = 1284 + complaints.length - 5;
  const activeComplaints = complaints.filter((c) => c.status !== 'resolved').length + 308;
  const overdueCount = 42;
  const pendingVerificationCount = complaints.filter((c) => c.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-900 text-white rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Nagpur Municipal Operations Center
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Administrative Control & SLA Compliance Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'map' ? 'bg-white text-indigo-950 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview & GIS Map</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all relative ${
              activeTab === 'verification'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Verification Queue</span>
            {pendingVerificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'complaints'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Department Registry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards matching design.md Section 16 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Total Complaints
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-gray-900">{totalComplaints.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-600">+14% vs avg</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Citywide 30-day intake</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Active in Field
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-indigo-950">{activeComplaints}</span>
            <span className="text-xs font-semibold text-indigo-600">Assigned</span>
          </div>
          <span className="text-[11px] text-indigo-700 mt-1 block">Across 15 municipal wards</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Overdue Complaints
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-rose-600">{overdueCount}</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
              Escalated
            </span>
          </div>
          <span className="text-[11px] text-rose-800 mt-1 block">Breached maximum resolution SLA</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            SLA Compliance
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-600">94.2%</span>
            <span className="text-xs font-semibold text-emerald-700">Target: &gt;90%</span>
          </div>
          <span className="text-[11px] text-emerald-800 mt-1 block">Average resolution: 28.4h</span>
        </div>
      </div>

      {/* design.md Section 16 & 17: "⚠ NEEDS ATTENTION" Alert Section */}
      <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/5 rounded-3xl border border-amber-300/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-600 text-white rounded-2xl shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>⚠ ACTION REQUIRED: SLA & Escalation Alerts</span>
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-900 mt-1">
              <span>• <strong>42 complaints</strong> currently overdue across departments</span>
              <span>• <strong>7 high-priority complaints</strong> approaching SLA in &lt; 4 hours</span>
              <span>• <strong>23 complaints</strong> clustered around Ward 12</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('map')}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          Inspect Hotspots →
        </button>
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CityGISMap onSelectComplaint={(c) => setSelectedComplaint(c)} />
          </div>

          {/* Department Workload Summary */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Department Workloads</span>
            </h3>
            <p className="text-xs text-gray-500">
              Active open work orders distributed across municipal units
            </p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-800">Roads & Infrastructure</span>
                  <span className="text-indigo-600">{184 + getDeptCount('roads')} active</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-800">Municipal Sanitation</span>
                  <span className="text-amber-600">{91 + getDeptCount('sanitation')} active</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-800">Water Supply & Drainage</span>
                  <span className="text-cyan-600">{27 + getDeptCount('water')} active</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-800">Street Lighting & Power</span>
                  <span className="text-purple-600">{10 + getDeptCount('lighting')} active</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => setActiveTab('verification')}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Go to Verification Queue ({pendingVerificationCount} ready)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && <VerificationQueue />}

      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-gray-900">Citywide Incident Registry</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, address, issue..."
                className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Category & Summary</th>
                  <th className="p-3">Location & Ward</th>
                  <th className="p-3">Assigned Officer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className="hover:bg-indigo-50/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-indigo-700">#{c.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{c.subCategory}</p>
                      <p className="text-gray-500 text-[11px] line-clamp-1 italic">
                        "{c.translatedDescription}"
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-800 font-medium">{c.location.address}</p>
                      <p className="text-gray-400 text-[11px]">{c.location.ward}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-800 font-medium">{c.assignedEmployeeName || 'Pending'}</p>
                      <p className="text-gray-400 text-[11px]">{c.departmentName}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : c.status === 'in_progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-600">{c.slaHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supervisor Complaint Inspection Modal */}
      <SupervisorComplaintModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
};

