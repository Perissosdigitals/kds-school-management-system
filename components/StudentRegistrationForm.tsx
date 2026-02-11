import React, { useState, useEffect } from 'react';
import type { Student, SchoolClass } from '../types';
import { StudentsService } from '../services/api/students.service';
import { ClassesService } from '../services/api/classes.service';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';

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
  const [availableGradeLevels, setAvailableGradeLevels] = useState<string[]>([]);

  // Charger toutes les classes au démarrage
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await ClassesService.getClasses({ limit: 100 });
        setAllClasses(response.data);

        // Extraire les niveaux scolaires uniques des classes disponibles
        const uniqueLevels = Array.from(new Set(response.data.map(cls => cls.level)));
        setAvailableGradeLevels(uniqueLevels.sort());
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
    <Card className="max-w-3xl mx-auto" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Inscription d'un Nouvel Élève</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
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
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b">Informations Personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom *"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              placeholder="Ex: Jean"
            />
            <Input
              label="Nom de famille *"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              placeholder="Ex: Kouassi"
            />
            <Input
              label="Date de naissance *"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Lieu de naissance"
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleInputChange}
              placeholder="Ex: Abidjan"
            />
            <Select
              label="Sexe"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner...' },
                { value: 'M', label: 'Masculin' },
                { value: 'F', label: 'Féminin' }
              ]}
            />
            <Input
              label="Nationalité"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              placeholder="Ex: Ivoirienne"
            />
          </div>
        </section>

        {/* Contact et Adresse */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b">Contact et Adresse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Adresse"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ex: Cocody, Rue des Jardins"
              containerClassName="md:col-span-2"
            />
            <Input
              label="Téléphone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ex: +225 07 00 00 00"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Ex: jean.kouassi@exemple.com"
            />
          </div>
        </section>

        {/* Informations Scolaires */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b">Informations Scolaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Niveau scolaire *"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              required
              options={[
                { value: '', label: 'Sélectionner...' },
                ...availableGradeLevels.map(level => ({
                  value: level,
                  label: level
                }))
              ]}
            />

            <Select
              label={`Classe ${formData.gradeLevel && availableClasses.length > 0 ? '*' : ''}`}
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              disabled={!formData.gradeLevel || availableClasses.length === 0}
              options={[
                {
                  value: '',
                  label: !formData.gradeLevel
                    ? 'Sélectionnez d\'abord un niveau'
                    : availableClasses.length === 0
                      ? 'Aucune classe disponible'
                      : 'Sélectionner une classe...'
                },
                ...availableClasses.map(cls => ({
                  value: cls.id,
                  label: `${cls.name} ${cls.teacher?.firstName ? `(Prof. ${cls.teacher.firstName} ${cls.teacher.lastName})` : ''}`
                }))
              ]}
            />

            <Input
              label="Date d'inscription"
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={handleInputChange}
            />
            <Input
              label="Établissement antérieur"
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleInputChange}
              placeholder="Ex: École de la Paix"
              containerClassName="md:col-span-2"
            />
          </div>
        </section>

        {/* Contact d'Urgence et Santé */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b">Contact d'Urgence et Santé</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact d'urgence"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              placeholder="Nom du parent ou tuteur"
            />
            <Input
              label="Téléphone urgence"
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
              placeholder="Ex: +225 01 00 00 00"
            />
            <Input
              label="Informations médicales"
              name="medicalInfo"
              value={formData.medicalInfo}
              onChange={handleInputChange}
              placeholder="Allergies, groupe sanguin, etc."
              containerClassName="md:col-span-2"
            />
          </div>
        </section>

        {/* Boutons d'action */}
        <div className="flex gap-3 justify-end pt-6 border-t">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="px-8"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            icon="bxs-plus-circle"
            className="px-8"
          >
            Enregistrer l'élève
          </Button>
        </div>
      </form>
    </Card>
  );
};
