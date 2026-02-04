import React, { useState, useCallback } from 'react';
import type { SpecialEvent } from '../../types';

interface SpecialEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<SpecialEvent, 'id'>) => void;
  timeSlots: string[];
  daysOfWeek: string[];
}

const eventColors = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-500' },
  green: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'ring-purple-500' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-500' },
};

export const SpecialEventModal: React.FC<SpecialEventModalProps> = ({ isOpen, onClose, onSave, timeSlots, daysOfWeek }) => {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState<'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi'>('Lundi');
  const [startTime, setStartTime] = useState(timeSlots[0]);
  const [endTime, setEndTime] = useState(timeSlots[1]);
  const [color, setColor] = useState<SpecialEvent['color']>('blue');
  const [error, setError] = useState('');

  const resetForm = useCallback(() => {
    setTitle('');
    setDay('Lundi');
    setStartTime(timeSlots[0]);
    setEndTime(timeSlots[1]);
    setColor('blue');
    setError('');
  }, [timeSlots]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    if (timeSlots.indexOf(startTime) >= timeSlots.indexOf(endTime)) {
      setError('L\'heure de fin doit être après l\'heure de début.');
      return;
    }

    onSave({ title, day, startTime, endTime, color });
    handleClose();
  }, [title, day, startTime, endTime, color, onSave, handleClose, timeSlots]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Ajouter un Événement Spécial</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-slate-700">Titre de l'événement</label>
            <input type="text" id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-day" className="block text-sm font-medium text-slate-700">Jour</label>
              <select id="event-day" value={day} onChange={(e) => setDay(e.target.value as any)} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-start-time" className="block text-sm font-medium text-slate-700">Heure de début</label>
              <select id="event-start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                {timeSlots.slice(0, -1).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="event-end-time" className="block text-sm font-medium text-slate-700">Heure de fin</label>
              <select id="event-end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                {timeSlots.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Couleur</label>
            <div className="flex gap-3">
              {Object.entries(eventColors).map(([key, { bg, ring }]) => (
                <button key={key} onClick={() => setColor(key as SpecialEvent['color'])} className={`w-8 h-8 rounded-full ${bg} transition-transform transform hover:scale-110 ${color === key ? `ring-2 ring-offset-2 ${ring}` : ''}`}></button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={handleClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors">Annuler</button>
          <button onClick={handleSubmit} className="px-6 py-2 rounded-lg text-white bg-blue-700 hover:bg-blue-800 font-semibold transition-colors">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};
