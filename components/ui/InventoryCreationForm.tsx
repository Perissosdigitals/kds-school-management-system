import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { InventoryService } from '../../services/api/inventory.service';

interface InventoryCreationFormProps {
  onSuccess?: (item: InventoryItem) => void;
  onCancel?: () => void;
}

export const InventoryCreationForm: React.FC<InventoryCreationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fourniture Scolaire' as 'Uniforme' | 'Fourniture Scolaire' | 'Matériel Pédagogique' | 'Autre',
    quantity: '',
    unit: 'pièces',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value ? parseInt(value) : '') : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name || !formData.category || !formData.quantity) {
        throw new Error('Les champs Nom, Catégorie et Quantité sont obligatoires');
      }

      const payload = {
        name: formData.name,
        category: formData.category,
        quantity: typeof formData.quantity === 'string' ? parseInt(formData.quantity) : formData.quantity,
        unit: formData.unit,
        stockStatus: 'En Stock' as const,
        lastUpdated: new Date().toISOString(),
      };

      const result = await InventoryService.createInventoryItem(payload);
      setSuccess('Article créé avec succès');
      setFormData({
        name: '',
        category: 'Fourniture Scolaire',
        quantity: '',
        unit: 'pièces',
      });
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Ajouter un nouvel article</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'article *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="ex: Bureau en bois"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="Uniforme">Uniforme</option>
              <option value="Fourniture Scolaire">Fourniture Scolaire</option>
              <option value="Matériel Pédagogique">Matériel Pédagogique</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unité
          </label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="ex: pièces, boîtes"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Création...' : 'Ajouter l\'article'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 disabled:bg-gray-200 font-medium"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
