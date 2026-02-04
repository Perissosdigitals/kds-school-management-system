import React, { useState } from 'react';
import type { Teacher, SchoolClass } from '../types';
import { TeachersService } from '../services/api/teachers.service';
import { ClassesService } from '../services/api/classes.service';

interface TeacherEditFormProps {
  teacher: Teacher;
  onSave: (updatedTeacher: Teacher) => void;
  onCancel: () => void;
}

export const TeacherEditForm: React.FC<TeacherEditFormProps> = ({ teacher, onSave, onCancel }) => {
  const [formData, setFormData] = useState(teacher);
  const [isLoading, setIsLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
    teacher.classes?.map(c => c.id) || []
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await ClassesService.getClasses();
        setAvailableClasses(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des classes:', err);
      }
    };
    fetchClasses();
  }, []);

  const isCreateMode = !teacher.id || teacher.id === '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isCreateMode) {
        console.log('TeacherEditForm: Création d\'un nouvel enseignant...', formData);
        const newTeacher = await TeachersService.createTeacher({
          ...formData,
          classIds: selectedClassIds
        });
        setSuccessMessage('Enseignant créé avec succès!');
        setTimeout(() => {
          onSave(newTeacher);
        }, 1500);
      } else {
        console.log('TeacherEditForm: Mise à jour de l\'enseignant...', formData);
        const updatedTeacher = await TeachersService.updateTeacher(teacher.id, {
          ...formData,
          classIds: selectedClassIds
        });
        setSuccessMessage('Enseignant mis à jour avec succès!');
        setTimeout(() => {
          onSave(updatedTeacher);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      const apiErrorMessage = err.response?.data?.message;
      const displayMessage = Array.isArray(apiErrorMessage)
        ? apiErrorMessage.join(', ')
        : apiErrorMessage || `Erreur lors de ${isCreateMode ? 'la création' : 'la mise à jour'} de l'enseignant. Veuillez réessayer.`;
      setError(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {isCreateMode ? 'Créer un nouvel enseignant' : 'Modifier l\'enseignant'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b">Informations Personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de famille</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b">Contact et Adresse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adresse complète"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'Urgence</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom et téléphone"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b">Informations Professionnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière Principale</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Mathématiques"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'Embauche</label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisation</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Algèbre, Géométrie"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications et Diplômes</label>
              <textarea
                name="qualifications"
                value={formData.qualifications || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Listez les diplômes et certifications..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Classes Assignées</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-lg bg-gray-50">
                {availableClasses.map(cls => (
                  <label key={cls.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(cls.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClassIds(prev => [...prev, cls.id]);
                        } else {
                          setSelectedClassIds(prev => prev.filter(id => id !== cls.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cls.name} ({cls.level})</span>
                  </label>
                ))}
                {availableClasses.length === 0 && (
                  <p className="text-sm text-gray-500 italic pb-2">Aucune classe disponible</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 italic">
                Cochez les classes dont cet enseignant est le professeur principal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <i className='bx bx-loader-alt animate-spin'></i>
                Enregistrement...
              </>
            ) : (
              <>
                <i className='bx bxs-save'></i>
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
