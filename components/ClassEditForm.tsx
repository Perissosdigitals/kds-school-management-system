import React, { useState } from 'react';
import type { SchoolClass } from '../types';
import { ClassesService } from '../services/api/classes.service';

interface ClassEditFormProps {
  schoolClass: SchoolClass;
  onSave: (updatedClass: SchoolClass) => void;
  onCancel: () => void;
}

export const ClassEditForm: React.FC<ClassEditFormProps> = ({ schoolClass, onSave, onCancel }) => {
  const [formData, setFormData] = useState(schoolClass);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isCreateMode = !schoolClass.id || schoolClass.id === '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Le nom de la classe est obligatoire');
      return false;
    }
    if (!formData.level.trim()) {
      setError('Le niveau scolaire est obligatoire');
      return false;
    }
    if (formData.capacity < 1) {
      setError('La capacité doit être d\'au moins 1 élève');
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
      if (isCreateMode) {
        console.log('ClassEditForm: Création d\'une nouvelle classe...', formData);
        const newClass = await ClassesService.createClass(formData);
        setSuccessMessage('Classe créée avec succès!');
        setTimeout(() => {
          onSave(newClass);
        }, 1500);
      } else {
        console.log('ClassEditForm: Mise à jour de la classe...', formData);
        const updatedClass = await ClassesService.updateClass(schoolClass.id, formData);
        setSuccessMessage('Classe mise à jour avec succès!');
        setTimeout(() => {
          onSave(updatedClass);
        }, 1500);
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(`Erreur lors de ${isCreateMode ? 'la création' : 'la mise à jour'} de la classe. Veuillez réessayer.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-shake">
          <p className="font-bold flex items-center gap-2">
            <i className='bx bx-error-circle'></i>
            Erreur
          </p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-bounce-subtle">
          <p className="font-bold flex items-center gap-2">
            <i className='bx bx-check-circle'></i>
            Succès
          </p>
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Nom de la classe *</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ex: 6ème A, CM2 B..."
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Niveau Scolaire *</span>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
                placeholder="Ex: Primaire, Secondaire..."
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Année Académique *</span>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Capacité maximale *</span>
              <div className="relative">
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium pl-10"
                />
                <i className='bx bx-group absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg'></i>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all active:scale-95 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <i className='bx bx-loader-alt animate-spin'></i>
                Enregistrement...
              </>
            ) : (
              <>
                <i className='bx bxs-save text-lg'></i>
                Enregistrer la Classe
              </>
            )}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}} />
    </div>
  );
};

