
import React from 'react';
import { RevisionSession, SubjectInfo } from '../types';
import { SUBJECTS } from '../constants';

interface RecentSessionsProps {
  sessions: RevisionSession[];
  onRetry: (topic: string, subject: SubjectInfo) => void;
  onClear: () => void;
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions, onRetry, onClear }) => {
  if (sessions.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕒</span>
          <h3 className="text-xl font-bold text-slate-800">Mes Sessions Récentes</h3>
        </div>
        <button 
          onClick={onClear}
          className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Effacer tout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => {
          const subjectObj = SUBJECTS.find(s => s.id === session.subject);
          const percentage = (session.score / session.total) * 100;
          
          return (
            <div 
              key={session.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between group hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform`}>
                  {session.subjectIcon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{session.topic}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{session.subject} • {session.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-lg font-black ${percentage >= 80 ? 'text-emerald-500' : percentage >= 50 ? 'text-indigo-500' : 'text-amber-500'}`}>
                    {session.score}<span className="text-xs text-slate-300">/{session.total}</span>
                  </div>
                </div>
                {subjectObj && (
                  <button 
                    onClick={() => onRetry(session.topic, subjectObj)}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
                    title="Réessayer ce quiz"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
