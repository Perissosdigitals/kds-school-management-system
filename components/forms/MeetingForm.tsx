import React, { useState } from 'react';
import type { Meeting, MeetingType, MeetingStatus, Teacher, Student } from '../../types';

interface MeetingFormProps {
  meeting?: Meeting;
  teachers: Teacher[];
  students?: Student[];
  onSave: (meeting: Partial<Meeting>) => void;
  onCancel: () => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ meeting, teachers, students = [], onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Meeting>>({
    title: meeting?.title || '',
    type: meeting?.type || 'Conseil de classe',
    description: meeting?.description || '',
    date: meeting?.date || '',
    startTime: meeting?.startTime || '',
    endTime: meeting?.endTime || '',
    location: meeting?.location || '',
    organizerId: meeting?.organizerId || '',
    inviteeIds: meeting?.inviteeIds || [],
    agenda: meeting?.agenda || '',
    status: meeting?.status || 'Planifiée'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const meetingTypes: MeetingType[] = ['Conseil de classe', 'Parents-Professeurs', 'Réunion pédagogique', 'Assemblée générale', 'Autre'];
  const statuses: MeetingStatus[] = ['Planifiée', 'En cours', 'Terminée', 'Annulée', 'Reportée'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!formData.date) newErrors.date = 'La date est obligatoire';
    if (!formData.startTime) newErrors.startTime = 'L\'heure de début est obligatoire';
    if (!formData.location?.trim()) newErrors.location = 'Le lieu est obligatoire';
    if (!formData.organizerId) newErrors.organizerId = 'L\'organisateur est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const toggleInvitee = (id: string) => {
    const current = formData.inviteeIds || [];
    if (current.includes(id)) {
      setFormData({ ...formData, inviteeIds: current.filter(invId => invId !== id) });
    } else {
      setFormData({ ...formData, inviteeIds: [...current, id] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la réunion *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Conseil de classe CM2-A"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de réunion *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as MeetingType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {meetingTypes.map(type => (
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as MeetingStatus })}
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
            placeholder="Ex: Salle des professeurs"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Organisateur */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organisateur *
          </label>
          <select
            value={formData.organizerId}
            onChange={(e) => setFormData({ ...formData, organizerId: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.organizerId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionnez un organisateur</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
          {errors.organizerId && <p className="text-red-500 text-xs mt-1">{errors.organizerId}</p>}
        </div>

        {/* Participants invités */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Participants invités
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
            {teachers.map(teacher => (
              <label key={teacher.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.inviteeIds || []).includes(teacher.id)}
                  onChange={() => toggleInvitee(teacher.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{teacher.firstName} {teacher.lastName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ordre du jour */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordre du jour
          </label>
          <textarea
            value={formData.agenda}
            onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Points à aborder lors de la réunion..."
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Informations complémentaires..."
          />
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
          <i className='bx bx-calendar-check'></i>
          {meeting ? 'Mettre à jour' : 'Planifier la réunion'}
        </button>
      </div>
    </form>
  );
};
