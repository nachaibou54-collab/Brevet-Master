
import React from 'react';
import { Reminder } from '../types';
import { SUBJECTS } from '../constants';
import { notificationService } from '../utils/notificationService';

interface ReminderCenterProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const ReminderCenter: React.FC<ReminderCenterProps> = ({ reminders, onDelete, onBack }) => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const handleTestNotification = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      notificationService.sendInstantNotification(
        "🚀 Test réussi !",
        "Tes notifications Brevet Master sont bien configurées. À toi le diplôme !"
      );
    } else {
      alert("Les notifications sont bloquées dans ton navigateur.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-indigo-600 font-black flex items-center gap-2 hover:opacity-80 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>
        <h2 className="text-2xl font-black text-slate-900">Mes Alertes Révision</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Vérifier la configuration</h3>
            <p className="text-xs text-slate-500">Assure-toi que les alertes fonctionnent.</p>
          </div>
        </div>
        <button 
          onClick={handleTestNotification}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Envoyer un test
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun rappel planifié</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Planifie des rappels sur tes chapitres préférés pour ne jamais oublier de réviser !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Rappels actifs ({reminders.length})</span>
          </div>
          {reminders.map((reminder) => {
            const subject = SUBJECTS.find(s => s.id === reminder.subjectId);
            return (
              <div key={reminder.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${subject?.color || 'bg-slate-500'} flex items-center justify-center text-3xl text-white shadow-md group-hover:scale-105 transition-transform`}>
                    {subject?.icon || '📚'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {reminder.topic || reminder.subjectId}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                        {reminder.frequency === 'daily' ? 'Chaque jour' : `Chaque ${days[reminder.dayOfWeek || 0]}`}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-wider">
                        {reminder.time}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => onDelete(reminder.id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Supprimer le rappel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
        <div className="flex gap-4">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-bold text-amber-800 text-sm mb-1">Comment ça marche ?</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Pour que les alertes fonctionnent même quand l'application est fermée, nous te conseillons d'<strong>installer l'application</strong> sur ton écran d'accueil (via le bouton "Ajouter à l'écran d'accueil" de ton navigateur).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
