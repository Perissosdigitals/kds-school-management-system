import React, { useState } from 'react';
import type { Event, EventType, EventStatus, Teacher } from '../../types';

interface EventFormProps {
  event?: Event;
  teachers: Teacher[];
  onSave: (event: Partial<Event>) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ event, teachers, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: event?.title || '',
    type: event?.type || 'Cérémonie',
    description: event?.description || '',
    date: event?.date || '',
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    location: event?.location || '',
    organizerIds: event?.organizerIds || [],
    targetAudience: event?.targetAudience || [],
    estimatedParticipants: event?.estimatedParticipants || undefined,
    budget: event?.budget || undefined,
    status: event?.status || 'Planifié'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const eventTypes: EventType[] = ['Cérémonie', 'Journée thématique', 'Compétition', 'Sortie pédagogique', 'Spectacle', 'Autre'];
  const statuses: EventStatus[] = ['Planifié', 'En cours', 'Terminé', 'Annulé'];
  const audiences = ['Élèves', 'Parents', 'Enseignants', 'Personnel', 'Public'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!formData.description?.trim()) newErrors.description = 'La description est obligatoire';
    if (!formData.date) newErrors.date = 'La date est obligatoire';
    if (!formData.startTime) newErrors.startTime = 'L\'heure de début est obligatoire';
    if (!formData.location?.trim()) newErrors.location = 'Le lieu est obligatoire';
    if (formData.targetAudience?.length === 0) newErrors.targetAudience = 'Sélectionnez au moins un public cible';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const toggleAudience = (audience: string) => {
    const current = formData.targetAudience || [];
    if (current.includes(audience)) {
      setFormData({ ...formData, targetAudience: current.filter(a => a !== audience) });
    } else {
      setFormData({ ...formData, targetAudience: [...current, audience] });
    }
  };

  const toggleOrganizer = (teacherId: string) => {
    const current = formData.organizerIds || [];
    if (current.includes(teacherId)) {
      setFormData({ ...formData, organizerIds: current.filter(id => id !== teacherId) });
    } else {
      setFormData({ ...formData, organizerIds: [...current, teacherId] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de l'événement *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Journée Portes Ouvertes"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'événement *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Heure de début */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heure de début *
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.startTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
        </div>

        {/* Heure de fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heure de fin (optionnelle)
          </label>
          <input
            type="time"
            value={formData.endTime || ''}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lieu */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lieu *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Cour de l'école"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Organisateurs */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organisateurs
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
            {teachers.map(teacher => (
              <label key={teacher.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.organizerIds || []).includes(teacher.id)}
                  onChange={() => toggleOrganizer(teacher.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{teacher.firstName} {teacher.lastName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Public cible */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public cible *
          </label>
          <div className="flex flex-wrap gap-3">
            {audiences.map(audience => (
              <label key={audience} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.targetAudience || []).includes(audience)}
                  onChange={() => toggleAudience(audience)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{audience}</span>
              </label>
            ))}
          </div>
          {errors.targetAudience && <p className="text-red-500 text-xs mt-1">{errors.targetAudience}</p>}
        </div>

        {/* Participants estimés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Participants estimés
          </label>
          <input
            type="number"
            min="1"
            value={formData.estimatedParticipants || ''}
            onChange={(e) => setFormData({ ...formData, estimatedParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (FCFA)
          </label>
          <input
            type="number"
            min="0"
            value={formData.budget || ''}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Décrivez l'événement, le programme, les objectifs..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className='bx bx-calendar-event'></i>
          {event ? 'Mettre à jour' : 'Créer l\'événement'}
        </button>
      </div>
    </form>
  );
};
