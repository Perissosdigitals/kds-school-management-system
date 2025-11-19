import React, { useState } from 'react';
import { TimetableSession } from '../../types';

interface TimetableEditFormProps {
  session?: TimetableSession;
  onSuccess?: (session: TimetableSession) => void;
  onCancel?: () => void;
}

export const TimetableEditForm: React.FC<TimetableEditFormProps> = ({
  session,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState(session || {
    id: '',
    title: '',
    day: 'Lundi' as const,
    startTime: '08:00',
    endTime: '09:00',
    color: 'blue' as const,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.title || !formData.startTime || !formData.endTime) {
        throw new Error('Les champs Titre, Heure de début et Heure de fin sont obligatoires');
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
        throw new Error('Format d\'heure invalide (HH:MM)');
      }

      // Validate start time is before end time
      if (formData.startTime >= formData.endTime) {
        throw new Error('L\'heure de fin doit être après l\'heure de début');
      }

      // If no id, generate one
      const updatedSession: TimetableSession = {
        ...formData,
        id: formData.id || `session-${Date.now()}`,
      };

      setSuccess('Session d\'horaire mise à jour avec succès');
      onSuccess?.(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        {session ? 'Modifier la session' : 'Ajouter une session'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre/Cours *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="ex: Mathématiques"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jour *
            </label>
            <select
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="Lundi">Lundi</option>
              <option value="Mardi">Mardi</option>
              <option value="Mercredi">Mercredi</option>
              <option value="Jeudi">Jeudi</option>
              <option value="Vendredi">Vendredi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="blue">Bleu</option>
              <option value="green">Vert</option>
              <option value="yellow">Jaune</option>
              <option value="purple">Violet</option>
              <option value="gray">Gris</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de début (HH:MM) *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de fin (HH:MM) *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Mise à jour...' : (session ? 'Mettre à jour' : 'Ajouter')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 disabled:bg-gray-200 font-medium"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
