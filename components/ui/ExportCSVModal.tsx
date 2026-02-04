import React, { useState, useEffect, useCallback } from 'react';

interface ExportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: (selectedHeaders: string[]) => void;
  allHeaders: string[];
  title: string;
  recordCount?: number;
}

export const ExportCSVModal: React.FC<ExportCSVModalProps> = React.memo(({ isOpen, onClose, onConfirmExport, allHeaders, title, recordCount }) => {
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(allHeaders);

  useEffect(() => {
    if (isOpen) {
      setSelectedHeaders(allHeaders);
    }
  }, [isOpen, allHeaders]);

  const handleToggleHeader = useCallback((header: string) => {
    setSelectedHeaders(prev =>
      prev.includes(header)
        ? prev.filter(h => h !== header)
        : [...prev, header]
    );
  }, []);

  const handleSelectAll = useCallback(() => setSelectedHeaders(allHeaders), [allHeaders]);
  const handleDeselectAll = useCallback(() => setSelectedHeaders([]), []);

  const handleExportClick = useCallback(() => {
    onConfirmExport(selectedHeaders);
  }, [onConfirmExport, selectedHeaders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Sélectionnez les colonnes que vous souhaitez inclure dans votre exportation CSV.
          {recordCount !== undefined && (
            <span className="block text-sm font-semibold text-blue-700 mt-1">
              {recordCount} enregistrement(s) ser{recordCount > 1 ? 'ont' : 'a'} exporté(s).
            </span>
          )}
        </p>

        <div className="flex gap-2 mb-4">
          <button onClick={handleSelectAll} className="text-sm bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full hover:bg-blue-200">
            Tout sélectionner
          </button>
          <button onClick={handleDeselectAll} className="text-sm bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full hover:bg-slate-200">
            Tout désélectionner
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-x-6 gap-y-2 border p-4 rounded-lg bg-slate-50">
          {allHeaders.map(header => (
            <div key={header} className="flex items-center">
              <input
                type="checkbox"
                id={`header-checkbox-${header}`}
                checked={selectedHeaders.includes(header)}
                onChange={() => handleToggleHeader(header)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`header-checkbox-${header}`} className="ml-2 block text-sm text-gray-900 select-none">
                {header}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors">
            Annuler
          </button>
          <button onClick={handleExportClick} disabled={selectedHeaders.length === 0 || recordCount === 0} className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 font-semibold transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2">
            <i className='bx bxs-file-export'></i>
            <span>Exporter ({selectedHeaders.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
});