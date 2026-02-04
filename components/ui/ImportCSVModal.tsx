import React, { useState, useRef, useCallback } from 'react';
import { parseCSV } from '../../utils/csvImport';

interface ImportCSVModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: T[]) => void;
  title: string;
  expectedHeaders: string[];
}

const ImportCSVModalComponent = <T extends Record<string, any>>({ isOpen, onClose, onImport, title, expectedHeaders }: ImportCSVModalProps<T>) => {
  const [file, setFile] = useState<File | null>(null);
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

  const handleImportClick = useCallback(() => {
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV.");
      return;
    }
    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV<T>(text);

        if (data.length > 0) {
          const actualHeaders = Object.keys(data[0]);
          const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));
          if (missingHeaders.length > 0) {
            throw new Error(`En-têtes manquants ou incorrects. Requis : ${missingHeaders.join(', ')}`);
          }
        } else {
          throw new Error("Le fichier CSV ne contient aucune donnée à importer.");
        }

        onImport(data);
        handleClose();
      } catch (e: any) {
        setError(e.message || "Erreur lors de l'analyse du fichier CSV.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier.");
      setIsLoading(false);
    };
    reader.readAsText(file);
  }, [file, onImport, handleClose, expectedHeaders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Sélectionnez un fichier CSV à importer. Assurez-vous que les en-têtes de colonnes correspondent exactement au format attendu.
        </p>
        <div className="font-mono text-xs bg-slate-100 p-3 rounded mb-4 text-slate-600 overflow-x-auto">
          <strong className="block mb-1">En-têtes attendus :</strong> {expectedHeaders.join(', ')}
        </div>

        <div>
          <label htmlFor="csv-file-input" className="block text-sm font-medium text-slate-700 mb-2">Fichier CSV</label>
          <input
            ref={fileInputRef}
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={handleClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors">
            Annuler
          </button>
          <button onClick={handleImportClick} disabled={isLoading || !file} className="px-6 py-2 rounded-lg text-white bg-blue-700 hover:bg-blue-800 font-semibold transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2">
            {isLoading ? <><i className="bx bx-loader-alt animate-spin"></i> Traitement...</> : 'Importer les Données'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ImportCSVModal = React.memo(ImportCSVModalComponent) as typeof ImportCSVModalComponent;