
import React, { useState, useMemo } from 'react';

interface Exam {
  id: string;
  name: string;
  icon: string;
  points: number;
  duration: string;
  noteSur: number;
  category: string;
  content: string[];
  details: string;
  tips: string[];
}

export const BrevetGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('summary');

  const finalExams: Exam[] = [
    { 
      id: 'français',
      name: 'Français', 
      icon: '📚',
      points: 120, 
      duration: '3h00', 
      noteSur: 20, 
      category: 'Français',
      content: [
        'Compréhension et compétences linguistiques (1h10)',
        'Dictée (20 min)',
        'Rédaction (1h30)'
      ],
      details: 'Grammaire, analyse de texte, orthographe et expression écrite.',
      tips: [
        'Relisez votre dictée au moins 3 fois.',
        'Prévoyez 15 minutes pour le plan de rédaction.',
        'Utilisez des connecteurs logiques.'
      ]
    },
    { 
      id: 'maths',
      name: 'Mathématiques', 
      icon: '📐',
      points: 120, 
      duration: '2h00', 
      noteSur: 20, 
      category: 'Maths',
      content: [
        'Automatismes (20 min - SANS CALCULATRICE)',
        'Exercices et problèmes (1h40) - Avec calculatrice'
      ],
      details: 'Nombres, calculs, géométrie, fonctions et algorithmique.',
      tips: [
        'Préparez bien l\'épreuve d\'automatismes.',
        'Justifiez systématiquement par une propriété.',
        'Vérifiez la vraisemblance de vos résultats.'
      ]
    },
    { 
      id: 'oral',
      name: 'Épreuve Orale', 
      icon: '🎤',
      points: 120, 
      duration: '15 min', 
      noteSur: 20, 
      category: 'Oral',
      content: [
        'Exposé (5 min)',
        'Entretien avec le jury (10 min)'
      ],
      details: 'Soutenance d\'un projet mené au cours du cycle 4.',
      tips: [
        'Maintenez un contact visuel.',
        'Structurez : Intro, Développement, Bilan.',
        'Soyez dynamique.'
      ]
    },
    { 
      id: 'hgemc',
      name: 'Hist-Géo & EMC', 
      icon: '🌍',
      points: 60, 
      duration: '2h00', 
      noteSur: 20, 
      category: 'Histoire-Géo & EMC',
      content: [
        'Analyse de documents',
        'Repères temporels et spatiaux',
        'EMC'
      ],
      details: 'Enjeux du monde contemporain et principes républicains.',
      tips: [
        'Apprenez vos repères par cœur.',
        'Citez précisément les documents.',
        'Maîtrisez le vocabulaire.'
      ]
    },
    { 
      id: 'sciences',
      name: 'Sciences', 
      icon: '🧪',
      points: 60, 
      duration: '1h00', 
      noteSur: 20, 
      category: 'Sciences',
      content: [
        'Physique-Chimie (30 min)',
        'SVT ou Technologie (30 min)'
      ],
      details: 'Deux disciplines tirées au sort parmi Physique-Chimie, SVT et Technologie.',
      tips: [
        'Gérez vos 30 minutes par matière.',
        'Soignez les schémas légendés.',
        'Répondez à toutes les questions.'
      ]
    },
  ];

  const currentExam = useMemo(() => 
    finalExams.find(e => e.id === activeTab)
  , [activeTab]);

  const mentions = [
    { label: 'Admis', score: 400, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'Assez Bien', score: 480, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Bien', score: 560, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Très Bien', score: 640, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Félicitations', score: 720, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200' },
  ];

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl transition-all">
      <div className="bg-slate-900 p-6 md:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-red-500 rounded text-[9px] font-black uppercase tracking-widest mb-2">
              Réforme 2025
            </div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tight">Guide Stratégique du Brevet</h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-center border border-white/10">
            <span className="text-[9px] uppercase font-black tracking-widest opacity-50 block">Objectif</span>
            <span className="text-xl md:text-2xl font-black text-indigo-400">800 pts</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[550px]">
        <aside className="w-full lg:w-72 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 p-4 md:p-6 overflow-x-auto no-scrollbar">
          <div className="flex lg:flex-col gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-shrink-0 flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs md:text-sm transition-all border-2 text-left ${
                activeTab === 'summary'
                  ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg'
                  : 'bg-white border-transparent text-slate-500 hover:border-slate-200'
              }`}
            >
              <span className="text-xl">📊</span>
              <span className="flex-1 uppercase tracking-wider">Synthèse 800 pts</span>
            </button>
            <div className="hidden lg:block my-4 px-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Épreuves</span></div>
            {finalExams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => setActiveTab(exam.id)}
                className={`flex-shrink-0 flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-xs md:text-sm transition-all border-2 text-left ${
                  activeTab === exam.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-transparent text-slate-500 hover:border-slate-200'
                }`}
              >
                <span className="text-lg">{exam.icon}</span>
                <span className="flex-1">{exam.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 bg-white">
          {activeTab === 'summary' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">Répartition des Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contrôle Continu</span>
                      <span className="text-3xl font-black text-slate-800">320 <span className="text-sm opacity-30">pts</span></span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">📋</div>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Épreuves Finales</span>
                      <span className="text-3xl font-black text-indigo-600">480 <span className="text-sm opacity-30">pts</span></span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">✍️</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6">Barème des Mentions</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {mentions.map((m) => (
                    <div key={m.label} className={`${m.bg} p-4 rounded-3xl border border-slate-200/60 text-center shadow-sm hover:scale-105 transition-transform flex flex-col justify-center relative overflow-hidden`}>
                      {m.label === 'Félicitations' && (
                        <div className="absolute top-2 right-2 bg-amber-400 text-white text-[7px] font-black px-2 py-0.5 rounded-lg shadow-sm uppercase tracking-tighter">Elite</div>
                      )}
                      <span className={`block text-[8px] font-black uppercase tracking-widest mb-1 opacity-70`}>{m.label}</span>
                      <span className={`text-xl font-black ${m.color}`}>{m.score}</span>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase mt-1">points min</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : currentExam ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
              <div className="flex items-center gap-5 pb-8 border-b border-slate-100">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl">
                  {currentExam.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{currentExam.name}</h3>
                  <div className="flex gap-2">
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black">⏳ {currentExam.duration}</span>
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">🏆 {currentExam.points} pts</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Déroulement
                  </h4>
                  <div className="space-y-2">
                    {currentExam.content.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl text-xs font-bold text-slate-700 border border-slate-100 flex items-center gap-3">
                        <span className="text-indigo-600 font-black">0{idx + 1}</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4">Conseils Stratégiques</h4>
                  <ul className="space-y-3">
                    {currentExam.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                        <span className="text-indigo-400 flex-shrink-0">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};
