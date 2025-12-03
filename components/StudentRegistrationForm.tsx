import React, { useState, useEffect } from 'react';
import type { Student, SchoolClass } from '../types';
import { StudentsService } from '../services/api/students.service';
import { ClassesService } from '../services/api/classes.service';

interface StudentRegistrationFormProps {
  onSuccess: (newStudent: Student) => void;
  onCancel: () => void;
  prefilledClassId?: string;
  prefilledGradeLevel?: string;
}

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({ 
  onSuccess, 
  onCancel,
  prefilledClassId,
  prefilledGradeLevel
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    birthPlace: '',
    gender: '',
    nationality: '',
    address: '',
    phone: '',
    email: '',
    gradeLevel: prefilledGradeLevel || '',
    classId: prefilledClassId || '', // Pré-rempli avec la classe courante
    registrationDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalInfo: '',
    status: 'En attente',
  });

  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);

  // Charger toutes les classes au démarrage
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await ClassesService.getClasses({ limit: 100 });
        setAllClasses(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des classes", err);
      }
    };
    fetchClasses();
  }, []);

  // Initialiser les classes disponibles au chargement si gradeLevel est préfillé
  useEffect(() => {
    if (prefilledGradeLevel && allClasses.length > 0) {
      const filtered = allClasses.filter(cls => cls.level === prefilledGradeLevel);
      setAvailableClasses(filtered);
    }
  }, [prefilledGradeLevel, allClasses]);

  // Filtrer les classes disponibles selon le niveau scolaire sélectionné
  useEffect(() => {
    if (formData.gradeLevel && allClasses.length > 0) {
      const filtered = allClasses.filter(cls => cls.level === formData.gradeLevel);
      setAvailableClasses(filtered);
      
      // Si une seule classe disponible, la sélectionner automatiquement
      if (filtered.length === 1) {
        setFormData(prev => ({ ...prev, classId: filtered[0].id }));
      } else if (!prefilledClassId) {
        // Réinitialiser classId si le niveau change (sauf si préfillé)
        setFormData(prev => ({ ...prev, classId: '' }));
      }
    } else {
      setAvailableClasses([]);
      if (!prefilledClassId) {
        setFormData(prev => ({ ...prev, classId: '' }));
      }
    }
  }, [formData.gradeLevel, prefilledClassId, allClasses]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('Le prénom est requis');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Le nom de famille est requis');
      return false;
    }
    if (!formData.dob) {
      setError('La date de naissance est requise');
      return false;
    }
    if (!formData.gradeLevel) {
      setError('Le niveau scolaire est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('📝 StudentRegistrationForm: Soumission du formulaire...', formData);
      const newStudent = await StudentsService.createStudent(formData as Omit<Student, 'id'>);
      console.log('✅ StudentRegistrationForm: Élève créé avec succès:', newStudent);
      
      // Message de succès enrichi avec classe et professeur
      let successMsg = `✅ ${newStudent.firstName} ${newStudent.lastName} a été enregistré(e) avec succès!`;
      if (newStudent.class) {
        successMsg += ` - Classe: ${newStudent.class.name}`;
        if (newStudent.teacher) {
          successMsg += ` (Prof. ${newStudent.teacher.firstName} ${newStudent.teacher.lastName})`;
        }
      }
      
      setSuccessMessage(successMsg);
      setTimeout(() => {
        onSuccess(newStudent);
      }, 2500);
    } catch (err: any) {
      console.error('❌ StudentRegistrationForm: ERREUR lors de la création:', err);
      
      // Message d'erreur détaillé pour debugging
      let errorMessage = 'Erreur lors de l\'enregistrement de l\'élève.';
      
      if (err.response?.data?.message) {
        errorMessage += ` Détail: ${err.response.data.message}`;
      } else if (err.response?.data?.error) {
        errorMessage += ` Détail: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage += ` Détail: ${err.message}`;
      }
      
      console.error('Message d\'erreur affiché:', errorMessage);
      setError(errorMessage + ' Vérifiez la console (F12) pour plus de détails.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Inscription d'un Nouvel Élève</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Information importante */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
        <div className="flex items-start gap-3">
          <i className='bx bx-info-circle text-blue-600 text-xl mt-0.5'></i>
          <div>
            <p className="text-sm font-semibold text-blue-900">Important</p>
            <p className="text-xs text-blue-800 mt-1">
              Sélectionnez une <span className="font-semibold">classe</span> pour assigner automatiquement un professeur à l'élève. 
              Cela permettra un suivi personnalisé et une meilleure organisation.
            </p>
          </div>
        </div>
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
        {/* Informations Personnelles */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b">Informations Personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de famille *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
              <input
                type="text"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact et Adresse */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b">Contact et Adresse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                name="address"
                value={formData.address}
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
          </div>
        </div>

        {/* Informations Scolaires */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b">Informations Scolaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau scolaire *</label>
              <select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                <option value="CP">CP</option>
                <option value="CE1">CE1</option>
                <option value="CE2">CE2</option>
                <option value="CM1">CM1</option>
                <option value="CM2">CM2</option>
                <option value="6ème">6ème</option>
                <option value="5ème">5ème</option>
                <option value="4ème">4ème</option>
                <option value="3ème">3ème</option>
              </select>
            </div>
            
            {/* Nouveau champ: Classe spécifique */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe {formData.gradeLevel && availableClasses.length > 0 ? '*' : ''}
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                disabled={!formData.gradeLevel || availableClasses.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.gradeLevel 
                    ? 'Sélectionnez d\'abord un niveau' 
                    : availableClasses.length === 0 
                    ? 'Aucune classe disponible' 
                    : 'Sélectionner une classe...'}
                </option>
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.teacher?.firstName && `(Prof. ${cls.teacher.firstName} ${cls.teacher.lastName})`}
                  </option>
                ))}
              </select>
              {formData.gradeLevel && availableClasses.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  <i className='bx bx-info-circle'></i> Aucune classe créée pour ce niveau
                </p>
              )}
              {formData.classId && availableClasses.find(c => c.id === formData.classId)?.teacher && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 flex items-center gap-1">
                    <i className='bx bx-user-circle'></i>
                    <span className="font-medium">Enseignant assigné:</span>
                    <span>
                      {availableClasses.find(c => c.id === formData.classId)?.teacher?.firstName}{' '}
                      {availableClasses.find(c => c.id === formData.classId)?.teacher?.lastName}
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Établissement antérieur</label>
              <input
                type="text"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact d'Urgence et Santé */}
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b">Contact d'Urgence et Santé</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'urgence</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone urgence</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Informations médicales</label>
              <input
                type="text"
                name="medicalInfo"
                value={formData.medicalInfo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
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
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <i className='bx bx-loader-alt animate-spin'></i>
                Enregistrement...
              </>
            ) : (
              <>
                <i className='bx bxs-plus-circle'></i>
                Enregistrer l'élève
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
