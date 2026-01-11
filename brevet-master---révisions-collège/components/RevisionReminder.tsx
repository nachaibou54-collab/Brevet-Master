
import React from 'react';
import { RevisionSession, SubjectInfo } from '../types';
import { SUBJECTS } from '../constants';

interface RevisionReminderProps {
  sessions: RevisionSession[];
  onSelectSubject: (subject: SubjectInfo, topic?: string) => void;
}

export const RevisionReminder: React.FC<RevisionReminderProps> = ({ sessions, onSelectSubject }) => {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Analyse profonde des chapitres par matière
  const chapterAnalysis = SUBJECTS.flatMap(subject => {
    return subject.topics.map(topic => {
      const topicSessions = sessions.filter(s => s.subject === subject.id && s.topic === topic);
      const lastSessionTime = topicSessions.length > 0 
        ? Math.max(...topicSessions.map(s => s.timestamp))
        : 0;
      
      return {
        subject,
        topic,
        lastSessionTime,
        daysSince: lastSessionTime === 0 ? Infinity : (now - lastSessionTime) / (24 * 60 * 60 * 1000)
      };
    });
  });

  // Filtrer les chapitres prioritaires (> 7 jours ou jamais faits)
  const priorityChapters = chapterAnalysis
    .filter(c => c.lastSessionTime === 0 || (now - c.lastSessionTime) > SEVEN_DAYS_MS)
    .sort((a, b) => b.daysSince - a.daysSince);

  if (priorityChapters.length === 0) return null;

  const topPick = priorityChapters[0];
  const isCritical = topPick.daysSince > 14 && topPick.daysSince !== Infinity;
  const isNeverDone = topPick.daysSince === Infinity;

  return (
    <div className={`border rounded-[2.5rem] p-6 mb-8 animate-in slide-in-from-top-4 duration-500 shadow-sm relative overflow-hidden group transition-all ${
      isCritical ? 'bg-indigo-900 text-white border-indigo-800 shadow-indigo-100' : 
      isNeverDone ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
      'bg-amber-50 text-amber-900 border-amber-200'
    }`}>
      <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl opacity-20 transition-transform duration-700 group-hover:scale-150 ${
        isCritical ? 'bg-white' : isNeverDone ? 'bg-emerald-400' : 'bg-amber-400'
      }`}></div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl shadow-md flex items-center justify-center text-3xl animate-bounce ${
          isCritical ? 'bg-indigo-800 border border-indigo-700' : 
          isNeverDone ? 'bg-white border border-emerald-100' :
          'bg-white border border-amber-100'
        }`}>
          {isCritical ? '❄️' : isNeverDone ? '🆕' : '🔔'}
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
              isCritical ? 'bg-red-500 text-white' : 
              isNeverDone ? 'bg-emerald-200 text-emerald-700' :
              'bg-amber-200 text-amber-700'
            }`}>
              {isCritical ? 'Alerte Oubli' : isNeverDone ? 'Nouveau Chapitre' : 'Rappel 7 Jours'}
            </span>
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{topPick.subject.id}</span>
          </div>
          <h4 className="font-black text-xl mb-1 leading-tight">
            {isNeverDone ? `Découvre : ${topPick.topic}` : `Reprends : ${topPick.topic}`}
          </h4>
          <p className={`text-sm font-medium opacity-80 leading-relaxed max-w-lg`}>
            {isNeverDone 
              ? `Ce chapitre est au programme du Brevet. Teste tes connaissances avant qu'il ne soit trop tard !`
              : `Ta dernière révision date d'il y a ${Math.floor(topPick.daysSince)} jours. Ton cerveau commence à oublier les détails !`}
          </p>
        </div>

        <button 
          onClick={() => onSelectSubject(topPick.subject, topPick.topic)}
          className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center gap-3 ${
            isCritical ? 'bg-white text-indigo-900 hover:bg-indigo-50' : 
            isNeverDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
            'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          <span>S'y remettre</span>
          <span className="text-lg">🚀</span>
        </button>
      </div>
    </div>
  );
};
