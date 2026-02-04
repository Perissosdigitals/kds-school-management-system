import React, { useState, useRef, useCallback } from 'react';
import type { ImportBatch, ImportDataType } from '../../types';

interface ImportBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dataType: ImportDataType, file: File) => Promise<void>;
}

export const ImportBatchModal: React.FC<ImportBatchModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<ImportDataType>('Liste des Classes');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  }, []);

  const handleClose = useCallback(() => {
    setFile(null);
    setError('');
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onSubmit(dataType, file);
      handleClose();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la soumission.");
      setIsLoading(false);
    }
  }, [file, dataType, onSubmit, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Nouvel Import de Données</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="data-type" className="block text-sm font-medium text-slate-700 mb-1">Type de données à importer</label>
            <select
              id="data-type"
              value={dataType}
              onChange={(e) => setDataType(e.target.value as ImportDataType)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="Liste des Classes">Liste des Classes</option>
              <option value="Liste des Élèves">Liste des Élèves</option>
              <option value="Liste des Professeurs">Liste des Professeurs</option>
              <option value="Saisie des Notes">Saisie des Notes</option>
              <option value="Transactions Financières">Transactions Financières</option>
              <option value="État de l'Inventaire">État de l'Inventaire</option>
              <option value="Liste des Utilisateurs">Liste des Utilisateurs</option>
            </select>
          </div>
          <div>
            <label htmlFor="csv-file-input" className="block text-sm font-medium text-slate-700 mb-1">Fichier CSV</label>
            <input
              ref={fileInputRef}
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Le fichier doit contenir les en-têtes corrects pour le type de données sélectionné.</p>
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={handleClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={isLoading || !file} className="px-6 py-2 rounded-lg text-white bg-blue-700 hover:bg-blue-800 font-semibold transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2">
            {isLoading ? <><i className="bx bx-loader-alt animate-spin"></i> Soumission...</> : 'Soumettre pour Approbation'}
          </button>
        </div>
      </div>
    </div>
  );
};