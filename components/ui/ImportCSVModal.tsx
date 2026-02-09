import React, { useState, useRef, useCallback } from 'react';
import { parseCSV } from '../../utils/csvImport';
import { Modal } from './Modal';

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed">
          Sélectionnez un fichier CSV à importer. Assurez-vous que les en-têtes de colonnes correspondent exactement au format attendu.
        </p>

        <div className="font-mono text-[11px] bg-slate-900 text-slate-300 p-4 rounded-xl shadow-inner border border-white/10">
          <strong className="block mb-2 text-emerald-400 uppercase tracking-widest text-[10px]">En-têtes attendus</strong>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {expectedHeaders.map(h => (
              <span key={h} className="opacity-80">• {h}</span>
            ))}
          </div>
        </div>

        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
          <label htmlFor="csv-file-input" className="block text-sm font-bold text-slate-700 mb-3 group-hover:text-emerald-700">Fichier CSV</label>
          <input
            ref={fileInputRef}
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all cursor-pointer"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex gap-3 items-center">
            <i className='bx bx-error-circle text-xl'></i>
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleImportClick}
            disabled={isLoading || !file}
            className="px-6 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <><i className="bx bx-loader-alt animate-spin"></i> Traitement...</> : 'Importer les Données'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const ImportCSVModal = React.memo(ImportCSVModalComponent) as typeof ImportCSVModalComponent;