import React, { useState } from 'react';
import type { Activity, ActivityCategory, ActivityStatus, Teacher } from '../../types';

interface ActivityFormProps {
  activity?: Activity;
  teachers: Teacher[];
  onSave: (activity: Partial<Activity>) => void;
  onCancel: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ activity, teachers, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Activity>>({
    name: activity?.name || '',
    category: activity?.category || 'Sport',
    description: activity?.description || '',
    responsibleTeacherId: activity?.responsibleTeacherId || '',
    schedule: activity?.schedule || '',
    location: activity?.location || '',
    maxParticipants: activity?.maxParticipants || undefined,
    startDate: activity?.startDate || '',
    endDate: activity?.endDate || '',
    status: activity?.status || 'Planifiée'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: ActivityCategory[] = ['Sport', 'Musique', 'Théâtre', 'Informatique', 'Arts', 'Lecture', 'Sciences', 'Langues', 'Autre'];
  const statuses: ActivityStatus[] = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!formData.description?.trim()) newErrors.description = 'La description est obligatoire';
    if (!formData.schedule?.trim()) newErrors.schedule = 'L\'horaire est obligatoire';
    if (!formData.location?.trim()) newErrors.location = 'Le lieu est obligatoire';
    if (!formData.startDate) newErrors.startDate = 'La date de début est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom de l'activité */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'activité *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Club de Football"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ActivityCategory })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Enseignant responsable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enseignant responsable
          </label>
          <select
            value={formData.responsibleTeacherId}
            onChange={(e) => setFormData({ ...formData, responsibleTeacherId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucun</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Horaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horaire *
          </label>
          <input
            type="text"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.schedule ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Mardi 15h-17h"
          />
          {errors.schedule && <p className="text-red-500 text-xs mt-1">{errors.schedule}</p>}
        </div>

        {/* Lieu */}
        <div>
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
            placeholder="Ex: Terrain de sport"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Nombre maximum de participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre maximum de participants
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxParticipants || ''}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Illimité"
          />
        </div>

        {/* Date de début */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de début *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
        </div>

        {/* Date de fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de fin (optionnelle)
          </label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
            placeholder="Décrivez l'activité, les objectifs, le contenu..."
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
          <i className='bx bx-save'></i>
          {activity ? 'Mettre à jour' : 'Créer l\'activité'}
        </button>
      </div>
    </form>
  );
};
