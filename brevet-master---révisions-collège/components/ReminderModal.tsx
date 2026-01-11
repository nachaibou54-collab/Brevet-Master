
import React, { useState } from 'react';
import { Reminder, ReminderFrequency, SubjectInfo } from '../types';

interface ReminderModalProps {
  subject: SubjectInfo;
  topic?: string;
  onClose: () => void;
  onSave: (reminder: Reminder) => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ subject, topic, onClose, onSave }) => {
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Lundi par défaut
  const [time, setTime] = useState('17:00');

  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const handleSave = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      subjectId: subject.id,
      topic: topic,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      time,
      isActive: true,
      createdAt: Date.now()
    };
    onSave(newReminder);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-white/30">
            🔔
          </div>
          <h3 className="text-xl font-black mb-1">Planifier un Rappel</h3>
          <p className="text-indigo-100 text-sm">Organise tes révisions de {topic ? 'ce chapitre' : 'cette matière'}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fréquence</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFrequency('daily')}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${frequency === 'daily' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
              >
                Quotidien
              </button>
              <button
                onClick={() => setFrequency('weekly')}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${frequency === 'weekly' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
              >
                Hebdo
              </button>
            </div>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quel jour ?</label>
              <select 
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {days.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">À quelle heure ?</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-2xl font-black text-center text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Enregistrer l'alerte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
