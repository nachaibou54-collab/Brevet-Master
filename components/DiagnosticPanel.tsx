
import React from 'react';
import { errorTracker } from '../utils/errorTracker';

interface DiagnosticPanelProps {
  onClose: () => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ onClose }) => {
  const logs = errorTracker.getRecentLogs();

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
      <header className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-black flex items-center gap-2">
            <span className="text-indigo-400">⚡</span> Console de Diagnostic
          </h2>
          <p className="text-slate-400 text-xs mt-1">Outil réservé au support technique et au débogage</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => errorTracker.downloadReport()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
          >
            <span>📥 Télécharger</span>
          </button>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="text-4xl mb-4">🛡️</div>
            <p className="font-bold">Aucune erreur critique détectée.</p>
            <p className="text-sm">Ton application tourne comme un charme !</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-red-500/10 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded">ERROR</span>
                  <span className="text-slate-300 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="text-slate-500 text-[10px] font-mono">{log.id}</span>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-white font-bold font-mono text-sm leading-relaxed">{log.message}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                    <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">Système</span>
                    <span className="text-xs text-slate-300 font-mono truncate block">{log.screen} | {log.online ? 'En ligne' : 'Hors ligne'}</span>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                    <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">Mémoire</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {log.stats.memory ? `${Math.round(log.stats.memory.usedJSHeapSize / 1048576)}MB` : 'N/A'}
                    </span>
                  </div>
                </div>

                <details className="group">
                  <summary className="text-xs text-indigo-400 font-bold cursor-pointer hover:text-indigo-300 transition-colors list-none flex items-center gap-2">
                    <span className="group-open:rotate-90 transition-transform">▶</span> Voir la trace (Stack)
                  </summary>
                  <pre className="mt-4 p-4 bg-slate-900 rounded-xl text-[10px] text-slate-400 font-mono overflow-x-auto whitespace-pre">
                    {log.stack}
                  </pre>
                </details>

                <details className="group">
                  <summary className="text-xs text-emerald-400 font-bold cursor-pointer hover:text-emerald-300 transition-colors list-none flex items-center gap-2">
                    <span className="group-open:rotate-90 transition-transform">▶</span> Voir le fil d'Ariane (Breadcrumbs)
                  </summary>
                  <div className="mt-4 space-y-2">
                    {log.breadcrumbs.slice(-15).map((b, idx) => (
                      <div key={idx} className="flex gap-3 text-[10px] font-mono p-2 rounded bg-slate-900/30 border border-slate-700/30">
                        <span className="text-slate-500">[{new Date(b.timestamp).toLocaleTimeString()}]</span>
                        <span className={`font-black ${
                          b.category === 'api' ? 'text-purple-400' : 
                          b.category === 'quiz' ? 'text-indigo-400' : 'text-slate-300'
                        }`}>{b.category.toUpperCase()}</span>
                        <span className="text-slate-400">{b.message}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ))
        )}
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};
