
import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, Subject } from '../types';
import { errorTracker } from '../utils/errorTracker';

interface QuizViewProps {
  subject: Subject;
  topic: string;
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
  onCancel: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ subject, topic, questions, onFinish, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [tentativeIdx, setTentativeIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    errorTracker.addBreadcrumb('quiz', `Question ${currentIdx + 1} affichée`, { topic });
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceFeedback(`Entendu : "${transcript}"`);
        processVoiceInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setVoiceFeedback('Erreur vocale.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentIdx, topic]);

  const toggleVoice = () => {
    if (isAnswered || tentativeIdx !== null) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setVoiceFeedback('Écoute...');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const processVoiceInput = (text: string) => {
    const optionsMap: Record<string, number> = {
      'a': 0, 'la a': 0, '1': 0, 'b': 1, 'la b': 1, '2': 1, 'c': 2, 'la c': 2, '3': 2, 'd': 3, 'la d': 3, '4': 3
    };

    let matchFound = false;
    for (const key in optionsMap) {
      if (text.includes(key)) {
        highlightAndSubmit(optionsMap[key]);
        matchFound = true;
        break;
      }
    }
    if (!matchFound) setVoiceFeedback('Réessaie (A, B, C...)');
  };

  const highlightAndSubmit = (idx: number) => {
    if (isAnswered || tentativeIdx !== null) return;
    setTentativeIdx(idx);
    setTimeout(() => {
        handleAnswer(idx);
        setTentativeIdx(null);
    }, 600);
  };

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    const isCorrect = idx === questions[currentIdx].correctAnswer;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setTentativeIdx(null);
      setIsAnswered(false);
      setVoiceFeedback('');
    } else {
      onFinish(score);
    }
  };

  const currentQ = questions[currentIdx];
  const isCorrectChoice = selectedAnswer === currentQ.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="flex h-1.5 w-full bg-slate-100">
        {questions.map((_, idx) => (
          <div key={idx} className={`flex-1 transition-all duration-500 ${idx < currentIdx ? 'bg-emerald-500' : idx === currentIdx ? 'bg-indigo-600' : 'bg-slate-100'}`} />
        ))}
      </div>

      <div className="p-5 md:p-8 relative">
        {/* Feedback Visuel Immédiat */}
        {isAnswered && (
          <div className={`absolute top-4 right-8 z-10 animate-in zoom-in-50 duration-300 flex items-center gap-2 px-4 py-2 rounded-full border-2 font-black text-[10px] uppercase tracking-[0.15em] shadow-lg ${isCorrectChoice ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}`}>
             <span>{isCorrectChoice ? '✅ Excellent !' : '❌ Dommage...'}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{subject}</span>
            <h2 className="text-lg font-black text-slate-800">Question {currentIdx + 1}/{questions.length}</h2>
          </div>
          <div className="flex gap-2">
            {!isAnswered && (
              <button onClick={toggleVoice} className={`p-2 rounded-xl transition-all font-bold text-[10px] ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                🎤 {isListening ? '...' : 'Voix'}
              </button>
            )}
            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-red-500 transition-all">✕</button>
          </div>
        </div>

        {voiceFeedback && (
          <div className="mb-4 text-[10px] font-bold text-indigo-600 bg-indigo-50 p-2 rounded-lg text-center">{voiceFeedback}</div>
        )}

        <div className="mb-8">
          <h3 className="text-base md:text-xl font-bold text-slate-900 leading-tight">{currentQ.question}</h3>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 relative overflow-hidden ";
            const isCorrect = idx === currentQ.correctAnswer;
            const isSelected = idx === selectedAnswer;
            const isTentative = idx === tentativeIdx;

            if (!isAnswered) {
              buttonClass += isTentative ? "border-indigo-600 bg-indigo-50 shadow-md" : "border-slate-100 hover:border-indigo-200 text-slate-700 active:scale-[0.98]";
            } else {
              if (isCorrect) {
                buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900 ring-4 ring-emerald-500/10 scale-[1.02] shadow-xl z-10 animate-pulse";
              } else if (isSelected) {
                buttonClass += "border-red-400 bg-red-50 text-red-900 opacity-90";
              } else {
                buttonClass += "border-slate-50 text-slate-300 opacity-40 grayscale";
              }
            }

            return (
              <button key={idx} disabled={isAnswered || tentativeIdx !== null} onClick={() => handleAnswer(idx)} className={buttonClass}>
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${isAnswered && isCorrect ? 'bg-emerald-500 text-white shadow-lg' : isAnswered && isSelected ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {isAnswered && isCorrect ? '✓' : isAnswered && isSelected ? '✕' : String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-semibold flex-grow">{option}</span>
                
                {isAnswered && isCorrect && (
                  <div className="absolute right-4 animate-in slide-in-from-right-2">
                    <span className="text-xl">✨</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 p-6 bg-slate-900 text-white rounded-[2rem] animate-in slide-in-from-bottom-4 duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📖</span>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Explication pédagogique</p>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90 mb-8 italic border-l-4 border-indigo-600 pl-4 py-1">
                "{currentQ.explanation}"
              </p>
              <button onClick={handleNext} className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all active:scale-[0.97] shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-3 group">
                <span>{currentIdx === questions.length - 1 ? "Voir mon résultat final" : "Question suivante"}</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
