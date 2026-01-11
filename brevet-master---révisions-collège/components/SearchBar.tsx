
import React, { useState, useEffect, useRef } from 'react';
import { SubjectInfo } from '../types';
import { SUBJECTS } from '../constants';

interface SearchBarProps {
  onSelectSubject: (subject: SubjectInfo) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectSubject }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSubjects = query.length > 1 
    ? SUBJECTS.filter(s => s.id.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredTopics = query.length > 1 
    ? SUBJECTS.flatMap(s => 
        s.topics
          .filter(t => t.toLowerCase().includes(query.toLowerCase()))
          .map(t => ({ topic: t, subject: s }))
      )
    : [];

  const handleResultClick = (subject: SubjectInfo) => {
    onSelectSubject(subject);
    setQuery('');
    setIsOpen(false);
  };

  /**
   * Retourne une version "douce" de la couleur de fond (ex: bg-blue-500 -> bg-blue-50).
   * Ajoute une bordure légère de la même teinte pour la visibilité.
   */
  const getSoftBgClass = (colorClass: string) => {
    // Mapping direct pour un contrôle total des teintes douces
    const map: Record<string, string> = {
      'bg-blue-500': 'bg-blue-50/80 border-blue-100',
      'bg-red-500': 'bg-red-50/80 border-red-100',
      'bg-amber-500': 'bg-amber-50/80 border-amber-100',
      'bg-emerald-500': 'bg-emerald-50/80 border-emerald-100',
    };
    return map[colorClass] || 'bg-slate-50 border-slate-100';
  };

  /**
   * Retourne la couleur de texte correspondante pour les étiquettes.
   */
  const getSoftTextClass = (colorClass: string) => {
    const map: Record<string, string> = {
      'bg-blue-500': 'text-blue-600',
      'bg-red-500': 'text-red-600',
      'bg-amber-500': 'text-amber-600',
      'bg-emerald-500': 'text-emerald-600',
    };
    return map[colorClass] || 'text-slate-600';
  };

  return (
    <div className="relative flex-grow max-w-md mx-4" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className="text-slate-400 text-sm">🔍</span>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 sm:text-sm transition-all font-medium"
          placeholder="Rechercher un chapitre (ex: Thalès...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (filteredSubjects.length > 0 || filteredTopics.length > 0) && (
        <div className="absolute z-[100] mt-3 w-full bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden max-h-[70vh] overflow-y-auto animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 backdrop-blur-sm">
          
          {filteredSubjects.length > 0 && (
            <div className="p-3">
              <div className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                Matières
              </div>
              <div className="space-y-1">
                {filteredSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleResultClick(s)}
                    className="w-full text-left px-3 py-3 rounded-2xl hover:bg-slate-50 flex items-center gap-4 transition-all group"
                  >
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-2xl shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3 ${getSoftBgClass(s.color)}`}>
                      {s.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{s.id}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Accéder à la matière</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredTopics.length > 0 && (
            <div className={`p-3 ${filteredSubjects.length > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                Chapitres ({filteredTopics.length})
              </div>
              <div className="space-y-1">
                {filteredTopics.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleResultClick(item.subject)}
                    className="w-full text-left px-3 py-3 rounded-2xl hover:bg-slate-50 transition-all group flex items-start gap-4"
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center text-lg shadow-sm transition-all group-hover:bg-white ${getSoftBgClass(item.subject.color)}`}>
                      {item.subject.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 group-hover:text-indigo-600 leading-tight transition-colors truncate">{item.topic}</div>
                      <div className={`text-[10px] font-black uppercase tracking-wider mt-1 ${getSoftTextClass(item.subject.color)}`}>
                        {item.subject.id}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 self-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-4 bg-slate-50 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appuie sur Entrée pour valider</p>
          </div>
        </div>
      )}
    </div>
  );
};
