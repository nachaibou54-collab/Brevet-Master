
import React, { useState, useEffect, useRef } from 'react';
import { Subject, QuizQuestion, SubjectInfo, LastQuizScore, RevisionSession, Reminder } from './types';
import { SUBJECTS } from './constants';
import { generateQuiz, generateSummaryStream } from './geminiService';
import { Layout } from './components/Layout';
import { QuizView } from './components/QuizView';
import { RevisionView } from './components/RevisionView';
import { BrevetGuide } from './components/BrevetGuide';
import { RecentSessions } from './components/RecentSessions';
import { RevisionReminder } from './components/RevisionReminder';
import { ReminderModal } from './components/ReminderModal';
import { ReminderCenter } from './components/ReminderCenter';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { errorTracker } from './utils/errorTracker';
import { notificationService } from './utils/notificationService';

type View = 'HOME' | 'TOPICS' | 'QUIZ' | 'REVISION' | 'SCORE' | 'REMINDERS' | 'LOADING_QUIZ';

interface TopicStats {
  bestScore: number;
  lastScore: number;
  totalQuestions: number;
  attempts: number;
}

const ficheCache: Record<string, string> = {};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [revisionContent, setRevisionContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [score, setScore] = useState(0);
  const [recentSessions, setRecentSessions] = useState<RevisionSession[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [topicStats, setTopicStats] = useState<Record<string, TopicStats>>({});
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [modalTopic, setModalTopic] = useState<string | undefined>();
  
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCache = localStorage.getItem('brevet_master_fiche_cache');
    if (savedCache) { try { Object.assign(ficheCache, JSON.parse(savedCache)); } catch (e) {} }
    
    const savedSessions = localStorage.getItem('brevet_master_sessions');
    if (savedSessions) { try { setRecentSessions(JSON.parse(savedSessions)); } catch (e) {} }
    
    const savedRemindersString = localStorage.getItem('brevet_master_reminders');
    if (savedRemindersString) { try { setReminders(JSON.parse(savedRemindersString)); } catch (e) {} }

    const savedStats = localStorage.getItem('brevet_master_topic_stats');
    if (savedStats) { try { setTopicStats(JSON.parse(savedStats)); } catch (e) {} }
  }, []);

  useEffect(() => {
    if (reminders.length > 0) notificationService.startMonitoring(reminders);
  }, [reminders]);

  const handleSelectSubject = (subject: SubjectInfo, topic?: string) => {
    setSelectedSubject(subject);
    if (topic) {
      startQuiz(topic, subject);
    } else {
      setCurrentView('TOPICS');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startQuiz = async (topic: string, subjectOverride?: SubjectInfo) => {
    const subjectToUse = subjectOverride || selectedSubject;
    if (!subjectToUse) return;
    
    setSelectedTopic(topic);
    if (!selectedSubject) setSelectedSubject(subjectToUse);
    setCurrentView('LOADING_QUIZ');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const q = await generateQuiz(subjectToUse.id, topic);
      setQuizQuestions(q);
      setTimeout(() => {
        setCurrentView('QUIZ');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    } catch (e) {
      alert("Erreur lors de la génération du quiz.");
      setCurrentView('TOPICS');
    }
  };

  const startRevision = async (topic: string) => {
    if (!selectedSubject) return;
    setSelectedTopic(topic);
    const cacheKey = `${selectedSubject.id}-${topic}`;
    if (ficheCache[cacheKey]) {
      setRevisionContent(ficheCache[cacheKey]);
      setIsStreaming(false);
      setCurrentView('REVISION');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setRevisionContent('');
    setIsStreaming(true);
    setCurrentView('REVISION');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      let fullText = '';
      const stream = generateSummaryStream(selectedSubject.id, topic);
      for await (const chunk of stream) {
        fullText += chunk;
        setRevisionContent(fullText);
      }
      ficheCache[cacheKey] = fullText;
      localStorage.setItem('brevet_master_fiche_cache', JSON.stringify(ficheCache));
      setIsStreaming(false);
    } catch (e) {
      errorTracker.captureError(e instanceof Error ? e : new Error('Erreur Streaming Fiche'), { topic });
      alert("Une erreur est survenue.");
      setCurrentView('TOPICS');
    }
  };

  const handleSaveReminder = async (reminder: Reminder) => {
    const success = await notificationService.scheduleReminder(reminder);
    if (success) {
      const updated = [...reminders, reminder];
      setReminders(updated);
      localStorage.setItem('brevet_master_reminders', JSON.stringify(updated));
      setShowReminderModal(false);
    }
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('brevet_master_reminders', JSON.stringify(updated));
  };

  const handleFinishQuiz = (finalScore: number) => {
    setScore(finalScore);
    setCurrentView('SCORE');
    
    const subjectId = selectedSubject?.id || '';
    const topicKey = `${subjectId}:${selectedTopic}`;
    const totalQ = quizQuestions.length;

    // Mise à jour des stats par chapitre
    const currentStats = topicStats[topicKey] || { bestScore: 0, lastScore: 0, totalQuestions: totalQ, attempts: 0 };
    const newStats: TopicStats = {
      bestScore: Math.max(currentStats.bestScore, finalScore),
      lastScore: finalScore,
      totalQuestions: totalQ,
      attempts: currentStats.attempts + 1
    };
    
    const updatedTopicStats = { ...topicStats, [topicKey]: newStats };
    setTopicStats(updatedTopicStats);
    localStorage.setItem('brevet_master_topic_stats', JSON.stringify(updatedTopicStats));

    const newScore: LastQuizScore = {
      subject: subjectId,
      subjectIcon: selectedSubject?.icon || '',
      topic: selectedTopic,
      score: finalScore,
      total: totalQ,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    };
    
    const newSession: RevisionSession = {
      id: Date.now().toString(),
      ...newScore,
      timestamp: Date.now()
    };
    
    localStorage.setItem('brevet_master_last_score', JSON.stringify(newScore));
    const updatedSessions = [newSession, ...recentSessions].slice(0, 10);
    setRecentSessions(updatedSessions);
    localStorage.setItem('brevet_master_sessions', JSON.stringify(updatedSessions));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setCurrentView('HOME');
    setSelectedSubject(null);
    setSelectedTopic('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getGlobalAverage = () => {
    if (recentSessions.length === 0) return 0;
    const sum = recentSessions.reduce((acc, s) => acc + (s.score / s.total), 0);
    return Math.round((sum / recentSessions.length) * 100);
  };

  const getSubjectWeight = (id: Subject) => {
    switch(id) {
      case Subject.MATHS: return { pts: 120, pct: 15 };
      case Subject.FRENCH: return { pts: 120, pct: 15 };
      case Subject.HISTORY_GEO: return { pts: 60, pct: 7.5 };
      case Subject.SCIENCES: return { pts: 60, pct: 7.5 };
      default: return { pts: 0, pct: 0 };
    }
  };

  return (
    <Layout 
      onGoHome={goHome} 
      onSelectSubject={handleSelectSubject} 
      onOpenReminders={() => setCurrentView('REMINDERS')}
      onOpenDiagnostic={() => setShowDiagnostic(true)}
    >
      {showDiagnostic && <DiagnosticPanel onClose={() => setShowDiagnostic(false)} />}

      {showReminderModal && selectedSubject && (
        <ReminderModal 
          subject={selectedSubject} 
          topic={modalTopic}
          onClose={() => setShowReminderModal(false)}
          onSave={handleSaveReminder}
        />
      )}

      {currentView === 'LOADING_QUIZ' && (
        <div className="max-w-xl mx-auto py-20 text-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative inline-block">
             <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border-4 border-indigo-100 animate-pulse">
               🧠
             </div>
             <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg border-4 border-indigo-500 flex items-center justify-center text-xl animate-spin">
               ⚙️
             </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Génération Turbo...</h2>
            <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
              L'IA synthétise le chapitre <span className="text-indigo-600">"{selectedTopic}"</span>. Un instant !
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-3">
             <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-indigo-600 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse italic">
               {['Analyse du programme 2025...', 'Rédaction des questions...', 'Vérification des corrigés...'][Math.floor(Date.now()/2000)%3]}
             </p>
          </div>
          
          <style>{`
            @keyframes progress {
              0% { width: 5%; transform: translateX(0); }
              50% { width: 90%; transform: translateX(5%); }
              100% { width: 5%; transform: translateX(1000%); }
            }
          `}</style>
        </div>
      )}

      {currentView === 'HOME' && (
        <div className="space-y-10">
          <section className="text-center py-6 md:py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-[10px] uppercase tracking-widest mb-4">
              🎓 Brevet 2025
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Prêt pour le <span className="text-indigo-600">succès</span> ?
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
              Ton assistant IA analyse tes progrès pour te proposer les meilleures révisions au bon moment.
            </p>
          </section>

          <RevisionReminder sessions={recentSessions} onSelectSubject={handleSelectSubject} />

          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">📚</span>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tes Matières</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SUBJECTS.map((s) => {
                const weight = getSubjectWeight(s.id);
                return (
                  <div key={s.id} className="group relative bg-white border border-slate-100 rounded-[2rem] p-5 text-left hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                    <button onClick={() => handleSelectSubject(s)} className="w-full text-left">
                      <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:rotate-6 transition-all`}>
                        {s.icon}
                      </div>
                      <h3 className="text-sm font-black text-slate-800 mb-1">{s.id}</h3>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{s.topics.length} chapitres</p>
                      <div className="mt-6 pt-4 border-t border-slate-50">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Poids</span>
                          <span className="text-[9px] font-black text-indigo-600">{weight.pts} pts</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${weight.pct * 3}%` }}></div>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => { setSelectedSubject(s); setModalTopic(undefined); setShowReminderModal(true); }} className="w-full py-2.5 mt-4 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Alerte 🔔</button>
                  </div>
                );
              })}
            </div>
          </section>

          <RecentSessions sessions={recentSessions} onRetry={startQuiz} onClear={() => { if(confirm("Tout effacer ?")) { setRecentSessions([]); localStorage.removeItem('brevet_master_sessions'); } }} />
          <div ref={guideRef} className="pt-8"><BrevetGuide /></div>
        </div>
      )}

      {currentView === 'TOPICS' && selectedSubject && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button onClick={goHome} className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-2"><span>←</span> Retour</button>
          <div className="flex items-center gap-4 mb-10">
            <div className={`w-14 h-14 rounded-2xl ${selectedSubject.color} flex items-center justify-center text-3xl shadow-xl shadow-indigo-100`}>{selectedSubject.icon}</div>
            <h2 className="text-2xl font-black text-slate-900">{selectedSubject.id}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedSubject.topics.map((topic, i) => {
              const stats = topicStats[`${selectedSubject.id}:${topic}`];
              const bestPct = stats ? Math.round((stats.bestScore / stats.totalQuestions) * 100) : null;
              
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-[1.5rem] p-5 hover:border-indigo-300 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-slate-800 leading-tight pr-4 group-hover:text-indigo-600 transition-colors">{topic}</h3>
                      {bestPct !== null && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${bestPct >= 80 ? 'bg-emerald-100 text-emerald-700' : bestPct >= 50 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                          Record : {bestPct}% {bestPct >= 80 ? '🏆' : ''}
                        </span>
                      )}
                    </div>
                    <button onClick={() => { setModalTopic(topic); setShowReminderModal(true); }} className="text-slate-200 hover:text-amber-500 transition-colors">🔔</button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startQuiz(topic)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Quiz IA</button>
                    <button onClick={() => startRevision(topic)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Fiche</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentView === 'REMINDERS' && <ReminderCenter reminders={reminders} onDelete={handleDeleteReminder} onBack={goHome} />}
      {currentView === 'QUIZ' && selectedSubject && <QuizView subject={selectedSubject.id} topic={selectedTopic} questions={quizQuestions} onFinish={handleFinishQuiz} onCancel={() => setCurrentView('TOPICS')} />}
      {currentView === 'REVISION' && selectedSubject && <RevisionView subject={selectedSubject.id} topic={selectedTopic} content={revisionContent} isStreaming={isStreaming} onBack={() => setCurrentView('TOPICS')} />}
      {currentView === 'SCORE' && (
        <div className="max-w-md mx-auto space-y-6 animate-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 md:p-10 text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600 -skew-y-3 -mt-10"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-xl border-4 border-indigo-50">
                {score / quizQuestions.length >= 0.8 ? '🏆' : score / quizQuestions.length >= 0.5 ? '💪' : '📚'}
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-1">Score Final</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">{selectedTopic}</p>
              
              <div className="bg-slate-900 text-white px-8 py-6 rounded-3xl mb-8 shadow-2xl inline-block">
                <div className="text-6xl font-black leading-none">{score}<span className="text-2xl opacity-40 ml-1">/{quizQuestions.length}</span></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">Réponses correctes</div>
              </div>

              {/* Stats comparatives */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Record Chapitre</span>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl font-black text-slate-800">
                      {topicStats[`${selectedSubject?.id}:${selectedTopic}`]?.bestScore || score}
                    </span>
                    <span className="text-xs text-slate-300 font-bold">/{quizQuestions.length}</span>
                  </div>
                  {score >= (topicStats[`${selectedSubject?.id}:${selectedTopic}`]?.bestScore || 0) && (
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Nouveau Record ! 🔥</span>
                  )}
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Moyenne Globale</span>
                  <div className="text-xl font-black text-indigo-600">
                    {getGlobalAverage()}%
                  </div>
                  <span className="text-[8px] font-black text-indigo-300 uppercase">Toutes matières</span>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => startQuiz(selectedTopic)} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">Réessayer</button>
                <button onClick={() => setCurrentView('TOPICS')} className="w-full bg-slate-50 text-slate-400 font-bold py-5 rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-100 transition-all">Retour aux chapitres</button>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-center">
             <p className="text-xs text-amber-800 font-medium italic">
               "L'erreur est le premier pas vers la réussite. Relis la fiche de ce chapitre pour booster ton prochain score !"
             </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
