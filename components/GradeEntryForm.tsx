import React, { useState } from 'react';
import type { Grade } from '../types';
import { GradesService } from '../services/api/grades.service';

interface GradeEntryFormProps {
  studentId: string;
  onSuccess: (grade: Grade) => void;
  onCancel: () => void;
}

export const GradeEntryForm: React.FC<GradeEntryFormProps> = ({ studentId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    evaluationId: '',
    score: '',
    comments: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseFloat(value) || 0 : value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.evaluationId || formData.score === '') {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('GradeEntryForm: Enregistrement de la note...', formData);
      const newGrade = await GradesService.recordGrade({
        studentId: studentId,
        evaluationId: formData.evaluationId,
        score: formData.score,
        comments: formData.comments,
      } as any);
      setSuccessMessage('Note enregistrée avec succès!');
      setTimeout(() => {
        onSuccess(newGrade);
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError('Erreur lors de l\'enregistrement de la note. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Enregistrer une note</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Évaluation *</label>
          <select
            name="evaluationId"
            value={formData.evaluationId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner une évaluation...</option>
            <option value="eval1">Évaluation 1</option>
            <option value="eval2">Évaluation 2</option>
            <option value="eval3">Évaluation 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (sur 20) *</label>
          <input
            type="number"
            name="score"
            value={formData.score}
            onChange={handleInputChange}
            min="0"
            max="20"
            step="0.5"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Observations ou commentaires..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <i className='bx bx-loader-alt animate-spin'></i>
                Enregistrement...
              </>
            ) : (
              <>
                <i className='bx bxs-plus-circle'></i>
                Enregistrer la note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
