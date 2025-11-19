import React, { useState } from 'react';
import { FinancialTransaction } from '../../types';
import { FinancesService } from '../../services/api/finances.service';

interface TransactionFormProps {
  studentId?: string;
  studentName?: string;
  onSuccess?: (transaction: FinancialTransaction) => void;
  onCancel?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  studentId,
  studentName = '',
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    studentId: studentId || '',
    studentName: studentName,
    description: '',
    type: 'Paiement Scolarité' as 'Paiement Scolarité' | 'Subvention' | 'Bourse',
    amount: '',
    status: 'En attente' as 'Payé' | 'En attente',
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
      [name]: name === 'amount' ? (value ? parseFloat(value) : '') : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.amount || !formData.studentName || !formData.description) {
        throw new Error('Le montant, le nom étudiant et la description sont obligatoires');
      }

      const payload = {
        date: new Date().toISOString(),
        description: formData.description,
        studentName: formData.studentName,
        type: formData.type,
        amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount,
        status: formData.status,
      };

      await FinancesService.createTransaction(payload);
      setSuccess('Transaction créée avec succès');
      setFormData({
        studentId: studentId || '',
        studentName: studentName,
        description: '',
        type: 'Paiement Scolarité',
        amount: '',
        status: 'En attente',
      });
      onSuccess?.({
        id: 'new',
        ...payload,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Nouvelle Transaction</h2>

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
            Nom de l'étudiant *
          </label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Nom de l'étudiant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Détails de la transaction"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de transaction *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="Paiement Scolarité">Paiement Scolarité</option>
              <option value="Subvention">Subvention</option>
              <option value="Bourse">Bourse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (USD) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              disabled={loading}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="En attente">En attente</option>
            <option value="Payé">Payé</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Création...' : 'Créer la transaction'}
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

