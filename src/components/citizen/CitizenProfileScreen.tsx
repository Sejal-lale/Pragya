import React from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Languages, PhoneCall, ShieldAlert, HeartHandshake, MapPin } from 'lucide-react';
import { Language } from '../../types';

export const CitizenProfileScreen: React.FC = () => {
  const { language, setLanguage, t } = useStore();

  const langOptions: { code: Language; name: string; native: string }[] = [
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'en', name: 'English', native: 'English' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {t.nav.profile}
        </h2>
        <p className="text-xs text-gray-500">Citizen profile & preferences</p>
      </div>

      {/* Citizen Card */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
          PR
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Citizen User</h3>
          <p className="text-xs text-gray-500">+91 98230 XXXXX</p>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-emerald-200">
            Verified Citizen • Ward 12
          </span>
        </div>
      </div>

      {/* Preferred Language */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <Languages className="w-4 h-4 text-indigo-600" />
          <span>Preferred Language / भाषा निवडा</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {langOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLanguage(opt.code)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                language === opt.code
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span className="text-sm block">{opt.native}</span>
              <span className="text-[10px] text-gray-400 block">{opt.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Jurisdiction Info */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>Municipal Jurisdiction</span>
        </div>
        <p className="text-xs text-gray-600">
          Nagpur Municipal Corporation (NMC) — Dharampeth Zone (Ward 12)
        </p>
      </div>

      {/* PRD Section 5: Non-goals & Emergency Redirects */}
      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2 text-rose-950">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Emergency Services Disclaimer</span>
        </div>
        <p className="text-[11px] text-rose-800 leading-relaxed">
          Pragya is designed for non-emergency municipal issues (potholes, garbage, lighting, leaks). For life-threatening emergencies, dial national helplines:
        </p>
        <div className="flex items-center gap-3 pt-1">
          <a
            href="tel:112"
            className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Dial 112 (Emergency)</span>
          </a>
        </div>
      </div>
    </div>
  );
};

