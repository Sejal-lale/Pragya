import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { mockEmployees } from '../../data/mockData';
import { EmployeeTaskModal } from './EmployeeTaskModal';
import {
  HardHat,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Filter,
  ChevronRight,
  Calendar,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Complaint, ComplaintPriority } from '../../types';

export const EmployeeDashboard: React.FC = () => {
  const { complaints, currentEmployeeId, setCurrentEmployeeId } = useStore();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | ComplaintPriority>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');

  const currentEmployee =
    mockEmployees.find((e) => e.id === currentEmployeeId) || mockEmployees[0];

  // Employee tasks: match assigned employee or department
  const employeeComplaints = complaints.filter(
    (c) =>
      c.assignedEmployeeId === currentEmployee.id ||
      c.departmentId === currentEmployee.departmentId
  );

  // Compute stats
  const activeCount = employeeComplaints.filter(
    (c) => !['completed', 'verified', 'resolved'].includes(c.status)
  ).length;

  const completedCount = employeeComplaints.filter((c) =>
    ['completed', 'verified', 'resolved'].includes(c.status)
  ).length;

  const now = new Date().getTime();
  const overdueCount = employeeComplaints.filter((c) => {
    if (['completed', 'verified', 'resolved'].includes(c.status)) return false;
    return new Date(c.deadline).getTime() < now;
  }).length;

  const dueSoonCount = employeeComplaints.filter((c) => {
    if (['completed', 'verified', 'resolved'].includes(c.status)) return false;
    const diff = new Date(c.deadline).getTime() - now;
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  }).length;

  // Filter complaints
  const filteredTasks = employeeComplaints.filter((c) => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (filterStatus === 'active' && ['completed', 'verified', 'resolved'].includes(c.status))
      return false;
    if (filterStatus === 'completed' && !['completed', 'verified', 'resolved'].includes(c.status))
      return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      {/* Top Employee Profile Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={currentEmployee.avatar}
            alt={currentEmployee.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{currentEmployee.name}</h2>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                On Duty
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <HardHat className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentEmployee.departmentName}</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentEmployee.ward}</span>
            </p>
          </div>
        </div>

        {/* Switch employee profile dropdown for testing */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-gray-400 font-medium">Switch Officer:</span>
          <select
            value={currentEmployeeId}
            onChange={(e) => setCurrentEmployeeId(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {mockEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.departmentName.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stat Cards matching design.md Section 13 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Active Tasks
          </span>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{activeCount}</p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">Assigned in your zone</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Due Today
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{dueSoonCount}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">&lt; 24 hours SLA remaining</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Overdue
          </span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{overdueCount}</p>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">Urgent escalation risk</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Completed
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Verified & closed</span>
        </div>
      </div>

      {/* Filters & Task List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-gray-900">Today's Assigned Complaints</h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status tab */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === 'active' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === 'completed' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                All
              </button>
            </div>

            {/* Priority filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTasks.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">All caught up!</p>
              <p className="text-xs text-gray-500 mt-0.5">No pending complaints matching this filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const deadlineDate = new Date(task.deadline).getTime();
              const diffHours = Math.round((deadlineDate - now) / (1000 * 60 * 60));
              const isOverdue = diffHours < 0;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedComplaint(task)}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {task.priority.toUpperCase()} PRIORITY
                      </span>

                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        #{task.id}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {task.subCategory}
                    </h4>

                    <p className="text-xs text-gray-600 line-clamp-2">
                      "{task.translatedDescription}"
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="line-clamp-1">{task.location.address} • {task.location.ward}</span>
                    </div>
                  </div>

                  {/* Bottom Bar: SLA timer and Open Task CTA */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Clock
                        className={`w-3.5 h-3.5 ${
                          isOverdue
                            ? 'text-rose-600'
                            : diffHours < 12
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={
                          isOverdue
                            ? 'text-rose-600 font-bold'
                            : diffHours < 12
                            ? 'text-amber-600 font-bold'
                            : 'text-gray-500'
                        }
                      >
                        {isOverdue ? `Overdue by ${Math.abs(diffHours)}h` : `⏱ ${diffHours}h remaining`}
                      </span>
                    </div>

                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Task</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Modal */}
      <EmployeeTaskModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
};

