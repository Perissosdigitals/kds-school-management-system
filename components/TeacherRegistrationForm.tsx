import React, { useState } from 'react';
import type { Teacher } from '../types';
import { TeachersService } from '../services/api/teachers.service';

interface TeacherRegistrationFormProps {
  onSuccess?: (teacher: Teacher) => void;
  onCancel?: () => void;
}

export const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    specialization: '',
    address: '',
    emergencyContact: '',
    hireDate: new Date().toISOString().split('T')[0],
    qualifications: '',
    status: 'Actif'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 2:
        return !!(formData.subject);
      case 3:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      setError('Veuillez remplir tous les champs obligatoires.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📝 TeacherRegistrationForm: Soumission du formulaire...', formData);
      const newTeacher = await TeachersService.createTeacher(formData as Omit<Teacher, 'id'>);
      console.log('✅ TeacherRegistrationForm: Enseignant créé avec succès:', newTeacher);
      alert('✅ Enseignant inscrit avec succès!');
      onSuccess?.(newTeacher);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        specialization: '',
        address: '',
        emergencyContact: '',
        hireDate: new Date().toISOString().split('T')[0],
        qualifications: '',
        status: 'Actif'
      });
      setCurrentStep(1);
    } catch (err: any) {
      console.error('❌ TeacherRegistrationForm: ERREUR lors de la création:', err);
      
      // Message d'erreur détaillé pour debugging
      let errorMessage = 'Erreur lors de l\'inscription de l\'enseignant.';
      
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
            currentStep === step ? 'bg-blue-600 text-white' :
            currentStep > step ? 'bg-green-500 text-white' :
            'bg-gray-300 text-gray-600'
          }`}>
            {currentStep > step ? '✓' : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Inscription d'un Nouveau Professeur</h2>
        <p className="text-gray-500 text-center">Étape {currentStep} sur 3</p>
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape 1: Informations Personnelles */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b">Informations Personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de famille <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="jean.dupont@ksp.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="06 00 00 00 00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Complète</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Rue de l'École, Ville"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'Urgence</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom et téléphone du contact d'urgence"
                />
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Informations Professionnelles */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b">Informations Professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matière Principale <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Mathématiques"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisation</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Algèbre, Géométrie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'Embauche</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3: Qualifications */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 pb-2 border-b">Qualifications et Diplômes</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diplômes et Certifications
              </label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Listez les diplômes, certifications et formations pertinentes..."
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <i className='bx bx-left-arrow-alt'></i>
                Précédent
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Suivant
                <i className='bx bx-right-arrow-alt'></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <i className='bx bx-loader-alt bx-spin'></i>
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    <i className='bx bxs-check-circle'></i>
                    Inscrire le Professeur
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
