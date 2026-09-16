import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Users,
  HardHat,
  ShieldAlert,
  X,
  LogIn,
  Key,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Role, demoAccounts, AuthUser } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useStore();
  const [selectedRole, setSelectedRole] = useState<Role>('citizen');
  const [identifier, setIdentifier] = useState<string>('Pooja Rao');

  if (!isOpen) return null;

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    if (role === 'citizen') setIdentifier('Pooja Rao');
    else if (role === 'employee') setIdentifier('EMP-R042');
    else setIdentifier('SUP-NMC-01');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if matches a demo account or construct one
    let targetUser = demoAccounts.find(
      (acc) =>
        acc.role === selectedRole &&
        (acc.id.toLowerCase() === identifier.trim().toLowerCase() ||
          acc.name.toLowerCase() === identifier.trim().toLowerCase() ||
          acc.phone?.includes(identifier.trim()))
    );

    if (!targetUser) {
      // Create user on the fly based on selected role
      if (selectedRole === 'citizen') {
        targetUser = {
          id: 'CIT-' + Math.floor(100 + Math.random() * 900),
          name: identifier.trim() || 'Citizen User',
          role: 'citizen',
          phone: '+91 98230 XXXXX',
          ward: 'Ward 12, Dharampeth',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
        };
      } else if (selectedRole === 'employee') {
        targetUser = {
          id: identifier.trim() || 'EMP-R042',
          name: 'Rahul Sharma',
          role: 'employee',
          departmentId: 'roads',
          departmentName: 'Roads & Infrastructure',
          ward: 'Ward 12, Nagpur',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        };
      } else {
        targetUser = {
          id: identifier.trim() || 'SUP-NMC-01',
          name: 'Er. Rajesh Kulkarni',
          role: 'supervisor',
          departmentName: 'Nagpur Municipal Control Center (NMC)',
          ward: 'Central Operations',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
        };
      }
    }

    login(targetUser);
    onClose();
  };

  const handleDemoClick = (acc: AuthUser) => {
    login(acc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1E1B4B] via-indigo-900 to-[#312E81] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-800/80 rounded-xl text-amber-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pragya Portal Login</h3>
              <p className="text-[11px] text-indigo-200">Access role-specific municipal controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Role selector tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange('citizen')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'citizen'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('employee')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'employee'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Employee</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('supervisor')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'supervisor'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Supervisor</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {selectedRole === 'citizen'
                  ? 'Citizen Name or Mobile Number'
                  : selectedRole === 'employee'
                  ? 'Official Employee ID'
                  : 'Supervisor Security ID'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  selectedRole === 'citizen'
                    ? 'e.g. Pooja Rao or 9823014829'
                    : selectedRole === 'employee'
                    ? 'e.g. EMP-R042'
                    : 'e.g. SUP-NMC-01'
                }
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {selectedRole === 'citizen'
                  ? 'Login to Citizen History & Complaints'
                  : selectedRole === 'employee'
                  ? 'Open Field Employee Dashboard'
                  : 'Open Supervisor Control Center'}
              </span>
            </button>
          </form>

          {/* Fast 1-Click Demo Profiles */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              1-Click Fast Demo Credentials:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleDemoClick(acc)}
                  className="p-2 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 border border-gray-200 rounded-xl text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-gray-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-indigo-700 block leading-tight">
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {acc.role === 'citizen'
                          ? `Citizen • ${acc.ward}`
                          : acc.role === 'employee'
                          ? `Officer • ${acc.departmentName}`
                          : 'Supervisor • NMC'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-gray-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Guest Access Shortcut ("Complaint window should open without login") */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto"
            >
              <span>Or report a problem directly without login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

