import React, { useState, useEffect } from 'react';
import { Building2, Languages } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  currentView: 'citizen' | 'government';
  setCurrentView: (view: 'citizen' | 'government') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  pendingCount: number;
  delayedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  lang,
  setLang,
  pendingCount,
  delayedCount,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      setCurrentDateTime(
        lang === 'ne'
          ? now.toLocaleDateString('ne-NP', options)
          : now.toLocaleDateString('en-GB', options)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md sticky top-0 z-40">
      {/* Top Project Status Bar */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {lang === 'ne'
              ? 'Sarkari-Sewa | कागजात पूर्व-परीक्षण तथा क्यु व्यवस्थापन प्रणाली'
              : 'Sarkari-Sewa | Document Pre-Scrutiny & Queue Management System'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-slate-300">{currentDateTime}</span>
          <button
            onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')}
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition"
            title="Toggle Language / भाषा परिवर्तन"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? 'English (EN)' : 'नेपाली (NE)'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold shadow-inner border border-slate-700">
            <Building2 className="w-5 h-5 text-slate-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Sarkari-Sewa
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                AI OCR & Queue
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'ne'
                ? 'कृत्रिम बुद्धिमत्ता (AI) कागजात ओसीआर तथा क्यु मनिटरिङ'
                : 'AI Document Vision Detector • Interactive Guide • Official Dashboard'}
            </p>
          </div>
        </div>

        {/* View Switcher: Citizen vs Government */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setCurrentView('citizen')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
              currentView === 'citizen'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>{lang === 'ne' ? 'नागरिक सेवा पोर्टल' : 'Citizen Portal'}</span>
          </button>

          <button
            onClick={() => setCurrentView('government')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition relative ${
              currentView === 'government'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>{lang === 'ne' ? 'सरकारी ड्यासबोर्ड' : 'Government Dashboard'}</span>

            {delayedCount > 0 ? (
              <span className="ml-1.5 px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold">
                {delayedCount}
              </span>
            ) : pendingCount > 0 ? (
              <span className="ml-1.5 px-1.5 py-0.2 bg-slate-700 text-slate-200 text-[10px] rounded-full">
                {pendingCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
};
