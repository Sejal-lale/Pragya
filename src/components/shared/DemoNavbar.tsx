import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Language } from '../../types';
import { LoginModal } from '../auth/LoginModal';
import {
  Users,
  HardHat,
  ShieldAlert,
  Languages,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';

export const DemoNavbar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    logout,
    isLoginModalOpen,
    setIsLoginModalOpen,
    language,
    setLanguage,
    mobileFrame,
    setMobileFrame,
    toasts,
    removeToast,
  } = useStore();

  const languages: { key: Language; label: string }[] = [
    { key: 'hi', label: 'हिंदी' },
    { key: 'en', label: 'English' },
    { key: 'mr', label: 'मराठी' },
  ];

  return (
    <>
      {/* Top Demo Bar */}
      <header className="sticky top-0 z-50 bg-[#1E1B4B] text-white border-b border-indigo-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-300 to-indigo-200 bg-clip-text text-transparent">
                PRAGYA
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium bg-indigo-900/90 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-700/50">
                Civic AI Platform
              </span>
            </div>
          </div>

          {/* Center: Auth State / Active Portal Banner */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-indigo-950/90 px-3 py-1.5 rounded-xl border border-indigo-800 shadow-inner">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold">
                    {currentUser.role === 'employee' ? <HardHat className="w-3.5 h-3.5" /> : currentUser.role === 'supervisor' ? <ShieldAlert className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                )}
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase ${
                        currentUser.role === 'supervisor'
                          ? 'bg-amber-500 text-indigo-950'
                          : currentUser.role === 'employee'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-300 block leading-none">
                    {currentUser.departmentName || currentUser.ward || 'Citizen Portal'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Logout to public citizen portal"
                  className="ml-2 px-2 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Public Access • Report Without Login</span>
                </span>

                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-300 text-indigo-950 shadow-sm hover:scale-102 active:scale-98 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login with ID</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Controls: Language, Phone View Toggle, Reset */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-indigo-950/80 p-0.5 rounded-lg border border-indigo-800/80">
              <Languages className="w-3.5 h-3.5 text-indigo-400 ml-1.5 mr-0.5" />
              {languages.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLanguage(l.key)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    language === l.key
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Mobile frame toggle (Only visible in citizen mode) */}
            {currentRole === 'citizen' && (
              <button
                onClick={() => setMobileFrame((prev) => !prev)}
                title={mobileFrame ? 'Switch to responsive view' : 'Preview inside phone frame'}
                className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mobileFrame
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">{mobileFrame ? 'Phone: ON' : 'Phone'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 transform transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-600'
                : toast.type === 'warning'
                ? 'bg-amber-900/95 text-white border-amber-600'
                : toast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-600'
                : 'bg-indigo-900/95 text-white border-indigo-600'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>
              <p className="text-xs text-indigo-100 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
