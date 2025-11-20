import React, { useState } from 'react';
import type { Incident, IncidentSeverity, IncidentStatus, Student, Teacher } from '../../types';

interface IncidentFormProps {
  incident?: Incident;
  students: Student[];
  teachers: Teacher[];
  onSave: (incident: Partial<Incident>) => void;
  onCancel: () => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ incident, students, teachers, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Incident>>({
    studentId: incident?.studentId || '',
    date: incident?.date || new Date().toISOString().split('T')[0],
    time: incident?.time || new Date().toTimeString().slice(0, 5),
    location: incident?.location || '',
    type: incident?.type || '',
    description: incident?.description || '',
    severity: incident?.severity || 'Mineur',
    reportedById: incident?.reportedById || '',
    witnessIds: incident?.witnessIds || [],
    actionsTaken: incident?.actionsTaken || '',
    status: incident?.status || 'Signalé'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const severities: IncidentSeverity[] = ['Mineur', 'Modéré', 'Grave', 'Très grave'];
  const statuses: IncidentStatus[] = ['Signalé', 'En traitement', 'Résolu', 'Clos'];
  const incidentTypes = [
    'Comportement inapproprié',
    'Violence physique',
    'Violence verbale',
    'Harcèlement',
    'Retard répété',
    'Absence injustifiée',
    'Non-respect du règlement',
    'Dégradation du matériel',
    'Autre'
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId) newErrors.studentId = 'L\'élève est obligatoire';
    if (!formData.date) newErrors.date = 'La date est obligatoire';
    if (!formData.time) newErrors.time = 'L\'heure est obligatoire';
    if (!formData.location?.trim()) newErrors.location = 'Le lieu est obligatoire';
    if (!formData.type) newErrors.type = 'Le type d\'incident est obligatoire';
    if (!formData.description?.trim()) newErrors.description = 'La description est obligatoire';
    if (!formData.reportedById) newErrors.reportedById = 'Le rapporteur est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const toggleWitness = (teacherId: string) => {
    const current = formData.witnessIds || [];
    if (current.includes(teacherId)) {
      setFormData({ ...formData, witnessIds: current.filter(id => id !== teacherId) });
    } else {
      setFormData({ ...formData, witnessIds: [...current, teacherId] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Élève concerné */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Élève concerné *
          </label>
          <select
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.studentId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionnez un élève</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} - {student.className}
              </option>
            ))}
          </select>
          {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
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

        {/* Heure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heure *
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
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
            placeholder="Ex: Cour de récréation"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Type d'incident */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'incident *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionnez un type</option>
            {incidentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
        </div>

        {/* Gravité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gravité *
          </label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {severities.map(sev => (
              <option key={sev} value={sev}>{sev}</option>
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Rapporté par */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rapporté par *
          </label>
          <select
            value={formData.reportedById}
            onChange={(e) => setFormData({ ...formData, reportedById: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.reportedById ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionnez un enseignant</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
          {errors.reportedById && <p className="text-red-500 text-xs mt-1">{errors.reportedById}</p>}
        </div>

        {/* Témoins */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Témoins
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
            {teachers.map(teacher => (
              <label key={teacher.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.witnessIds || []).includes(teacher.id)}
                  onChange={() => toggleWitness(teacher.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{teacher.firstName} {teacher.lastName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description détaillée *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Décrivez l'incident en détail..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Actions prises */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actions prises
          </label>
          <textarea
            value={formData.actionsTaken}
            onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Mesures immédiates prises, sanctions appliquées..."
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
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <i className='bx bx-error'></i>
          {incident ? 'Mettre à jour' : 'Signaler l\'incident'}
        </button>
      </div>
    </form>
  );
};
