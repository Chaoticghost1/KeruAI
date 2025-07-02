import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="bg-slate-700 p-1 rounded-lg flex">
      <button
        onClick={() => setLanguage('es')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
          language === 'es'
            ? 'bg-slate-600 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <i className="fas fa-flag mr-2"></i>
        Español
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
          language === 'en'
            ? 'bg-slate-600 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <i className="fas fa-flag mr-2"></i>
        English
      </button>
    </div>
  );
}
