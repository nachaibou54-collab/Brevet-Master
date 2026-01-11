
import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { SubjectInfo } from '../types';
import { errorTracker } from '../utils/errorTracker';

interface LayoutProps {
  children: React.ReactNode;
  onGoHome: () => void;
  onSelectSubject: (subject: SubjectInfo) => void;
  onOpenReminders?: () => void;
  onOpenDiagnostic?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onGoHome, onSelectSubject, onOpenReminders, onOpenDiagnostic }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleReportBug = () => {
    errorTracker.downloadReport();
  };

  const handleVersionClick = () => {
    const next = clickCount + 1;
    if (next >= 5) {
      onOpenDiagnostic?.();
      setClickCount(0);
    } else {
      setClickCount(next);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-3 h-14 md:h-16 flex items-center justify-between gap-2 md:gap-4">
          <button 
            onClick={() => {
              errorTracker.addBreadcrumb('navigation', 'Logo cliqué - Retour home');
              onGoHome();
            }}
            className="flex-shrink-0 flex items-center gap-1.5 text-lg font-bold text-indigo-600 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl md:text-2xl">🎓</span>
            <span className="hidden xs:inline text-sm md:text-base font-black tracking-tight uppercase">Brevet Master</span>
          </button>

          <div className="flex-grow flex justify-center max-w-[180px] sm:max-w-md">
            <SearchBar onSelectSubject={onSelectSubject} />
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <button 
              onClick={onOpenReminders}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-95"
              title="Mes rappels"
            >
              <span className="text-base md:text-lg">🔔</span>
            </button>
            
            <nav className="hidden md:flex gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
              <button onClick={onGoHome} className="hover:text-indigo-600">Accueil</button>
              <button onClick={onGoHome} className="border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-xl text-indigo-700 hover:bg-indigo-100 transition-colors">Guide</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full p-3 md:p-6 py-4 md:py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 md:py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-800 pb-8 mb-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-lg mb-2">
                <span>🎓</span> Brevet Master
              </div>
              <p className="text-xs md:text-sm max-w-xs opacity-60">Ta plateforme d'IA pour réviser le Brevet intelligemment.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={handleReportBug}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
              >
                <span>🪲</span> Signaler un bug
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <button 
              onClick={handleVersionClick}
              className="text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors cursor-default"
            >
              © {new Date().getFullYear()} Brevet Master IA
            </button>
            <div className="flex gap-4 text-[9px] font-black uppercase tracking-[0.2em]">
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Service OK
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
