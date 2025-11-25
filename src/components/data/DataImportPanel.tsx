import React, { useState } from 'react';
import { DataManagementService } from '../../services/api/data-management.service';

interface DataImportPanelProps {
  onImportSuccess?: () => void;
}

export const DataImportPanel: React.FC<DataImportPanelProps> = ({
  onImportSuccess,
}) => {
  const [dataType, setDataType] = useState<string>('grades');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file extension
      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        setError('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV (.csv)');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10 MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setValidationResult(null);
      setSuccess('');
    }
  };

  const handleValidate = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const result = await DataManagementService.validateImport(file, dataType);
      setValidationResult(result);

      if (result.errors.length === 0) {
        setSuccess(`✅ Validation réussie: ${result.validRecords} enregistrements prêts à importer`);
      } else {
        setError(`⚠️ ${result.errors.length} erreur(s) détectée(s) - Correction requise avant import`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la validation';
      setError(errorMsg);
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!validationResult) {
      setError('Veuillez d\'abord valider le fichier');
      return;
    }

    if (validationResult.errors.length > 0) {
      setError('Impossible d\'importer avec des erreurs. Corrigez le fichier et re-validez.');
      return;
    }

    const confirmed = window.confirm(
      `Confirmer l'import de ${validationResult.validRecords} enregistrement(s) ?\n\n` +
      `Type: ${dataType}\n` +
      `⚠️ Cette opération est atomique: tout ou rien.\n` +
      `En cas d'erreur, aucune donnée ne sera modifiée (rollback automatique).`
    );

    if (!confirmed) return;

    setImporting(true);
    setError('');

    try {
      let result;
      switch (dataType) {
        case 'grades':
          result = await DataManagementService.importGrades(file);
          break;
        case 'attendance':
          result = await DataManagementService.importAttendance(file);
          break;
        case 'students':
          result = await DataManagementService.importStudents(file);
          break;
        default:
          throw new Error(`Type de données non supporté: ${dataType}`);
      }

      setSuccess(
        `✅ Import réussi!\n` +
        `${result.imported} enregistrement(s) importé(s)\n` +
        `Durée: ${result.duration}ms`
      );

      // Reset form
      setFile(null);
      setValidationResult(null);
      
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'import';
      setError(
        `❌ Échec de l'import\n` +
        `${errorMsg}\n` +
        `Aucune donnée n'a été modifiée (transaction rollback).`
      );
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="data-import-panel space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">📥 Import de Données</h1>
        <p className="text-green-100">Import massif depuis Excel ou CSV</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <p className="font-medium text-blue-800">Guide d'import</p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
              <li>Formats acceptés: Excel (.xlsx, .xls), CSV (.csv)</li>
              <li>Taille max: 10 MB</li>
              <li>Validation obligatoire avant import</li>
              <li>Transaction atomique: tout ou rien (rollback automatique si erreur)</li>
              <li>Téléchargez les modèles de fichiers pour respecter le format attendu</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 whitespace-pre-line">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 whitespace-pre-line">
          <p className="font-medium">Succès</p>
          <p>{success}</p>
        </div>
      )}

      {/* Import Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration de l'import</h2>

        <div className="space-y-4">
          {/* Data Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de données <span className="text-red-500">*</span>
            </label>
            <select
              value={dataType}
              onChange={(e) => {
                setDataType(e.target.value);
                setFile(null);
                setValidationResult(null);
                setError('');
                setSuccess('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="grades">Notes</option>
              <option value="attendance">Présences</option>
              <option value="students">Élèves</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier à importer <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Choisir un fichier</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  Excel ou CSV jusqu'à 10 MB
                </p>
              </div>
            </div>
            {file && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Fichier sélectionné: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Download Template */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              📄 Modèles de fichiers
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // TODO: Implement template download
                  alert(`Téléchargement du modèle ${dataType} à venir`);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Télécharger modèle {dataType}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleValidate}
              disabled={!file || importing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {importing && !validationResult ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Validation en cours...
                </>
              ) : (
                '🔍 Valider le fichier'
              )}
            </button>

            <button
              onClick={handleImport}
              disabled={!validationResult || validationResult.errors.length > 0 || importing}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {importing && validationResult ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Import en cours...
                </>
              ) : (
                '📥 Lancer l\'import'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat de la validation</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Enregistrements valides</p>
              <p className="text-3xl font-bold text-green-600">
                {validationResult.validRecords}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Erreurs</p>
              <p className="text-3xl font-bold text-red-600">
                {validationResult.errors.length}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Avertissements</p>
              <p className="text-3xl font-bold text-yellow-600">
                {validationResult.warnings?.length || 0}
              </p>
            </div>
          </div>

          {/* Errors Table */}
          {validationResult.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                ❌ Erreurs bloquantes ({validationResult.errors.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ligne
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Colonne
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validationResult.errors.slice(0, 10).map((error: any, idx: number) => (
                      <tr key={idx} className="hover:bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {error.row}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {error.column}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {error.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validationResult.errors.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    ... et {validationResult.errors.length - 10} autre(s) erreur(s)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings && validationResult.warnings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">
                ⚠️ Avertissements ({validationResult.warnings.length})
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {validationResult.warnings.slice(0, 5).map((warning: string, idx: number) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
