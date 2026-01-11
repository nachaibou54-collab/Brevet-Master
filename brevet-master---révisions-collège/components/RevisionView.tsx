
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Subject } from '../types';
import { askClarification } from '../geminiService';

interface RevisionViewProps {
  subject: Subject;
  topic: string;
  content: string;
  isStreaming: boolean;
  onBack: () => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ subject, topic, content, isStreaming, onBack }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [content, isStreaming]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsAsking(true);
    setAnswer(null);
    try {
      const result = await askClarification(subject, topic, content, question);
      setAnswer(result);
    } catch (error) {
      console.error(error);
      setAnswer("Désolé, une erreur est survenue lors de la génération de la réponse. Réessaie dans quelques instants.");
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Nettoie le contenu Markdown et remplace les caractères spéciaux.
   * Utilise les codes de caractères bruts pour garantir un rendu fluide dans ReactMarkdown sans boucher les composants HTML personnalisés.
   */
  const sanitizeContent = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\\([.#*_\-\x60[\]()])/g, '$1')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/[\\/]{2,}/g, '/')
      .trim();
  };

  const MarkdownComponents: any = {
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-black text-slate-900 mt-6 mb-10 text-center bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 shadow-sm print:bg-white print:border-slate-200">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-black text-indigo-700 mt-12 mb-6 pb-2 border-b-4 border-indigo-200 inline-block print:border-slate-300 print:text-slate-900">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-black text-slate-800 mt-8 mb-4 flex items-center gap-3">
        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-6 text-slate-700 leading-relaxed text-lg font-medium opacity-90 print:text-sm">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-4 mb-8 mt-2 list-none">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="space-y-4 mb-8 list-decimal ml-6 font-bold text-indigo-700 print:text-slate-900">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="ml-0 text-slate-700 leading-relaxed flex items-start gap-4 bg-white/50 p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-white transition-all shadow-sm print:bg-white print:border-slate-100 print:shadow-none">
        <span className="mt-2 w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 shadow-sm print:bg-slate-400"></span>
        <span className="flex-grow font-semibold text-slate-700 print:text-sm">{children}</span>
      </li>
    ),
    blockquote: ({ children }: any) => (
      <div className="my-10 bg-amber-50 border-l-8 border-amber-400 p-8 rounded-r-3xl shadow-sm italic text-amber-900 font-bold print:bg-white print:border-slate-300">
        <div className="flex gap-4 items-center">
           <span className="text-3xl flex-shrink-0">💡</span>
           <div className="print:text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    ),
    strong: ({ children }: any) => (
      <strong className="font-black text-indigo-800 bg-indigo-50/40 px-1 rounded print:bg-transparent print:text-black">{children}</strong>
    ),
    table: ({ children }: any) => (
      <div className="my-10 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[400px]">{children}</table>
        </div>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-slate-100/50 border-b border-slate-200">{children}</thead>,
    th: ({ children }: any) => <th className="p-4 font-black text-[11px] uppercase tracking-[0.15em] text-slate-500 border-r border-slate-100 last:border-r-0">{children}</th>,
    td: ({ children }: any) => <td className="p-4 border-b border-slate-50 text-sm font-bold text-slate-700 border-r border-slate-50 last:border-r-0">{children}</td>,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 print:p-0">
      <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl border border-slate-200 fiche-container print:shadow-none print:border-none">
        <div className="sticky top-[56px] md:top-[64px] z-[40] bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm no-print rounded-t-[3rem] md:rounded-t-[4rem]">
          <div className="max-w-4xl mx-auto px-6 md:px-14 py-4 flex items-center justify-between gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest transition-all hover:-translate-x-1 group"
            >
              <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> 
              <span>Retour</span>
            </button>
            
            <div className="flex gap-2">
              {!isStreaming && (
                <>
                  <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 border ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 shadow-sm'}`}
                  >
                    {copied ? 'Copié ! ✅' : '📄 Copier'}
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg flex items-center gap-2 font-black text-[10px] uppercase tracking-wider"
                  >
                    🖨️ Imprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-14 pt-8 md:pt-10 relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] no-print rounded-b-[3rem] md:rounded-b-[4rem]"></div>

          <div className="mb-14 pb-10 border-b-2 border-slate-50 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.25em] mb-6 shadow-xl shadow-indigo-200/50 print:bg-slate-200 print:text-black print:shadow-none">
              MASTER CLASSE • {subject}
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05] mb-4 print:text-4xl">{topic}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
               <span>Diplôme National du Brevet</span>
               <span className="w-1.5 h-1.5 bg-slate-200 rounded-full no-print"></span>
               <span>Réforme 2025</span>
            </div>
          </div>

          {isStreaming && !content && (
             <div className="py-24 text-center space-y-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto animate-bounce shadow-inner">
                  ✍️
                </div>
                <div className="space-y-2">
                  <p className="text-slate-800 font-black text-lg">Rédaction en cours...</p>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">L'IA prépare ton succès</p>
                </div>
             </div>
          )}

          <div className="prose prose-slate max-w-none relative z-10 select-text pb-8">
            <ReactMarkdown components={MarkdownComponents}>
              {sanitizeContent(content)}
            </ReactMarkdown>
            {isStreaming && content && <span className="streaming-indicator"></span>}
          </div>
        </div>
      </div>

      {!isStreaming && content && (
        <>
          <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-indigo-100 p-8 md:p-14 relative overflow-hidden no-print">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 opacity-40 blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 relative z-10">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-4 border-white transform -rotate-6 hover:rotate-0 transition-all duration-500">
                🚀
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Un point te semble flou ?</h3>
                <p className="text-slate-500 font-bold text-lg leading-relaxed">Ton professeur IA est là pour approfondir n'importe quel détail de la fiche.</p>
              </div>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-6 relative z-10">
              <div className="relative group">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ex: 'Explique-moi plus en détail la partie sur...' ou 'Donne-moi un autre exemple concret...'"
                  className="w-full bg-slate-50 border-4 border-slate-100 rounded-3xl p-8 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[160px] resize-none font-bold text-xl shadow-inner group-hover:border-slate-200"
                />
              </div>
              
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-6 rounded-3xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-xl"
              >
                {isAsking ? (
                  <>
                    <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Réflexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Demander une précision</span>
                    <span className="text-2xl">✨</span>
                  </>
                )}
              </button>
            </form>

            {(answer || isAsking) && (
              <div className="mt-12 p-8 md:p-12 bg-indigo-50/50 rounded-[3rem] border-2 border-indigo-100 animate-in slide-in-from-top-10 duration-700 shadow-sm relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-2 rounded-full border-2 border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-500 shadow-sm">
                   Réponse du Professeur
                </div>

                {isAsking ? (
                  <div className="flex flex-col items-center py-12 space-y-6">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s] shadow-lg shadow-indigo-200"></div>
                      <div className="w-5 h-5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s] shadow-lg shadow-indigo-200"></div>
                      <div className="w-5 h-5 bg-indigo-600 rounded-full animate-bounce shadow-lg shadow-indigo-200"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="prose prose-lg max-w-none text-slate-800 font-bold leading-relaxed text-lg">
                      <ReactMarkdown components={MarkdownComponents}>
                        {sanitizeContent(answer || '')}
                      </ReactMarkdown>
                    </div>
                    <div className="pt-8 border-t border-indigo-100 flex justify-between items-center">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest italic">Basé sur le contenu de ta fiche</p>
                      <button 
                        onClick={() => { setAnswer(null); setQuestion(''); }}
                        className="text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        <span>🗑️ Fermer l'explication</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-14 bg-slate-900 text-white rounded-[4rem] text-center relative overflow-hidden shadow-2xl border-8 border-slate-800 group no-print">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-transparent to-purple-900/60"></div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="text-6xl mb-8 animate-pulse">🎓</div>
              <h4 className="font-black text-4xl md:text-5xl mb-4 tracking-tighter italic">"Tu as le contrôle."</h4>
              <p className="text-indigo-200 mb-12 font-bold text-xl opacity-90 leading-relaxed">
                Relire c'est bien, tester c'est mieux. Vérifie immédiatement si tu as retenu l'essentiel avec le quiz IA.
              </p>
              <button 
                onClick={onBack}
                className="bg-white text-slate-900 px-16 py-7 rounded-[2.5rem] font-black text-2xl hover:bg-indigo-50 transition-all active:scale-[0.97] shadow-[0_20px_50px_rgba(255,255,255,0.2)] flex items-center justify-center gap-5 mx-auto group"
              >
                <span>🔥 Lancer le Quiz IA</span>
                <span className="text-3xl group-hover:translate-x-2 transition-transform">🎯</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
