import React, { useState } from 'react';
import type { Announcement } from '../../types';

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSave: (announcement: Partial<Announcement>) => void;
  onCancel: () => void;
}

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ announcement, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: announcement?.title || '',
    content: announcement?.content || '',
    category: announcement?.category || 'Général',
    priority: announcement?.priority || 'Normal',
    targetAudience: announcement?.targetAudience || [],
    publishDate: announcement?.publishDate || new Date().toISOString().split('T')[0],
    expiryDate: announcement?.expiryDate || '',
    attachments: announcement?.attachments || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = ['Général', 'Urgent', 'Événement', 'Académique', 'Administratif'];
  const priorities = ['Bas', 'Normal', 'Élevé', 'Urgent'];
  const audiences = ['Élèves', 'Parents', 'Enseignants', 'Personnel', 'Tout le monde'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!formData.content?.trim()) newErrors.content = 'Le contenu est obligatoire';
    if (!formData.publishDate) newErrors.publishDate = 'La date de publication est obligatoire';
    if (formData.targetAudience?.length === 0) newErrors.targetAudience = 'Sélectionnez au moins un public cible';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const toggleAudience = (audience: string) => {
    const current = formData.targetAudience || [];
    if (current.includes(audience)) {
      setFormData({ ...formData, targetAudience: current.filter(a => a !== audience) });
    } else {
      setFormData({ ...formData, targetAudience: [...current, audience] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de l'annonce *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Réunion de rentrée"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priorité *
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {priorities.map(prio => (
              <option key={prio} value={prio}>{prio}</option>
            ))}
          </select>
        </div>

        {/* Date de publication */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de publication *
          </label>
          <input
            type="date"
            value={formData.publishDate}
            onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.publishDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.publishDate && <p className="text-red-500 text-xs mt-1">{errors.publishDate}</p>}
        </div>

        {/* Date d'expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'expiration (optionnelle)
          </label>
          <input
            type="date"
            value={formData.expiryDate || ''}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">L'annonce sera automatiquement masquée après cette date</p>
        </div>

        {/* Public cible */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public cible *
          </label>
          <div className="flex flex-wrap gap-3">
            {audiences.map(audience => (
              <label key={audience} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.targetAudience || []).includes(audience)}
                  onChange={() => toggleAudience(audience)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{audience}</span>
              </label>
            ))}
          </div>
          {errors.targetAudience && <p className="text-red-500 text-xs mt-1">{errors.targetAudience}</p>}
        </div>

        {/* Contenu */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu de l'annonce *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Rédigez le contenu de votre annonce..."
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
        </div>

        {/* Pièces jointes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pièces jointes
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <i className='bx bx-cloud-upload text-4xl text-gray-400 mb-2'></i>
            <p className="text-sm text-gray-600">Cliquez pour ajouter des fichiers ou glissez-les ici</p>
            <p className="text-xs text-gray-500 mt-1">PDF, Images (max 10 MB)</p>
          </div>
          {formData.attachments && formData.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <i className='bx bx-file'></i>
                  <span>{file}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aperçu du badge de priorité */}
      {formData.priority && formData.priority !== 'Normal' && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Aperçu du badge de priorité :</p>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            formData.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
            formData.priority === 'Élevé' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {formData.priority}
          </span>
        </div>
      )}

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
          <i className='bx bx-bullhorn'></i>
          {announcement ? 'Mettre à jour' : 'Publier l\'annonce'}
        </button>
      </div>
    </form>
  );
};
