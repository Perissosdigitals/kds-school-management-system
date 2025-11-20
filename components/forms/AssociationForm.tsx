import React, { useState } from 'react';
import type { Association, AssociationType, AssociationStatus, Teacher, Student } from '../../types';

interface AssociationFormProps {
  association?: Association;
  teachers: Teacher[];
  students?: Student[];
  onSave: (association: Partial<Association>) => void;
  onCancel: () => void;
}

export const AssociationForm: React.FC<AssociationFormProps> = ({ association, teachers, students = [], onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Association>>({
    name: association?.name || '',
    type: association?.type || 'Club étudiant',
    description: association?.description || '',
    presidentId: association?.presidentId || '',
    memberIds: association?.memberIds || [],
    advisorId: association?.advisorId || '',
    foundedDate: association?.foundedDate || '',
    budget: association?.budget || undefined,
    objectives: association?.objectives || '',
    activities: association?.activities || [],
    status: association?.status || 'Active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const types: AssociationType[] = ['Club étudiant', 'Association parents', 'Partenariat ONG', 'Autre'];
  const statuses: AssociationStatus[] = ['Active', 'Inactive', 'En création'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!formData.description?.trim()) newErrors.description = 'La description est obligatoire';
    if (!formData.objectives?.trim()) newErrors.objectives = 'Les objectifs sont obligatoires';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const toggleMember = (id: string) => {
    const current = formData.memberIds || [];
    if (current.includes(id)) {
      setFormData({ ...formData, memberIds: current.filter(memberId => memberId !== id) });
    } else {
      setFormData({ ...formData, memberIds: [...current, id] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'association *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Club d'échecs"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as AssociationType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {types.map(type => (
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as AssociationStatus })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Président */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Président
          </label>
          <select
            value={formData.presidentId}
            onChange={(e) => setFormData({ ...formData, presidentId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucun</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Conseiller/Référent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conseiller/Référent
          </label>
          <select
            value={formData.advisorId}
            onChange={(e) => setFormData({ ...formData, advisorId: e.target.value })}
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

        {/* Date de fondation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de fondation
          </label>
          <input
            type="date"
            value={formData.foundedDate || ''}
            onChange={(e) => setFormData({ ...formData, foundedDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget annuel (FCFA)
          </label>
          <input
            type="number"
            min="0"
            value={formData.budget || ''}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Membres */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membres
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
            {students.length > 0 ? (
              students.map(student => (
                <label key={student.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.memberIds || []).includes(student.id)}
                    onChange={() => toggleMember(student.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{student.firstName} {student.lastName} - {student.className}</span>
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-sm py-2">Aucun élève disponible</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(formData.memberIds || []).length} membre(s) sélectionné(s)
          </p>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Décrivez l'association..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Objectifs */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objectifs *
          </label>
          <textarea
            value={formData.objectives}
            onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.objectives ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Quels sont les objectifs de cette association?"
          />
          {errors.objectives && <p className="text-red-500 text-xs mt-1">{errors.objectives}</p>}
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
          <i className='bx bx-group'></i>
          {association ? 'Mettre à jour' : 'Créer l\'association'}
        </button>
      </div>
    </form>
  );
};
