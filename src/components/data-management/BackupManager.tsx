import React, { useState, useEffect } from 'react';
import { DataManagementService } from '../../services/api/data-management.service';
import type { Backup, CreateBackupDto } from '../../types';

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Create backup modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [backupName, setBackupName] = useState<string>('');
  const [backupDescription, setBackupDescription] = useState<string>('');
  const [compress, setCompress] = useState<boolean>(true);
  
  // Restore confirmation modal state
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [restoreBackupId, setRestoreBackupId] = useState<string>('');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteBackupId, setDeleteBackupId] = useState<string>('');

  // Load backups
  const loadBackups = async () => {
    setLoadingBackups(true);
    setError('');
    
    try {
      const response = await DataManagementService.listBackups();
      setBackups(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des sauvegardes';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  // Create backup
  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      setError('Veuillez saisir un nom pour la sauvegarde');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const createDto: CreateBackupDto = {
        name: backupName,
        description: backupDescription || undefined,
        compress,
      };

      await DataManagementService.createBackup(createDto);
      
      setSuccess('Sauvegarde créée avec succès!');
      setShowCreateModal(false);
      setBackupName('');
      setBackupDescription('');
      setCompress(true);
      
      // Reload backups
      await loadBackups();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la création de la sauvegarde';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download backup
  const handleDownloadBackup = async (backupId: string, filename: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const blob = await DataManagementService.downloadBackup(backupId);
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Téléchargement réussi!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du téléchargement';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Restore backup
  const handleRestoreBackup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await DataManagementService.restoreBackup(restoreBackupId);
      
      setSuccess('Restauration réussie! Base de données restaurée.');
      setShowRestoreModal(false);
      setRestoreBackupId('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la restauration';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete backup
  const handleDeleteBackup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await DataManagementService.deleteBackup(deleteBackupId);
      
      setSuccess('Sauvegarde supprimée avec succès!');
      setShowDeleteModal(false);
      setDeleteBackupId('');
      
      // Reload backups
      await loadBackups();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="backup-manager bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestion des Sauvegardes
        </h2>
        
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer une sauvegarde
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p className="font-medium">Succès</p>
          <p>{success}</p>
        </div>
      )}

      {/* Backups List */}
      {loadingBackups ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Chargement des sauvegardes...</p>
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-4 text-gray-600">Aucune sauvegarde disponible</p>
          <p className="text-sm text-gray-500 mt-2">
            Créez votre première sauvegarde pour protéger vos données
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <div className="text-sm font-medium text-gray-900">
                        {backup.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {backup.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(backup.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatFileSize(backup.size)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      backup.compressed 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {backup.compressed ? 'Compressé' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Télécharger"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setRestoreBackupId(backup.id);
                          setShowRestoreModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Restaurer"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteBackupId(backup.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Créer une sauvegarde
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="backup_2024_11_24"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Sauvegarde avant migration..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={compress}
                    onChange={(e) => setCompress(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Compresser (.sql.gz) - Recommandé
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setBackupName('');
                    setBackupDescription('');
                    setCompress(true);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={loading}
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={handleCreateBackup}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">
                Confirmer la restauration
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Cette action remplacera toutes les données actuelles par celles de la sauvegarde. 
                Cette opération est <strong>irréversible</strong>.
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setRestoreBackupId('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={loading}
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Restauration...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Cette action supprimera définitivement la sauvegarde. 
                Vous ne pourrez plus la restaurer.
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteBackupId('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={loading}
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={handleDeleteBackup}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Bonnes pratiques</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Créez une sauvegarde avant toute opération majeure (migration, import massif)</li>
          <li>Vérifiez mensuellement la validité des sauvegardes par restauration test</li>
          <li>Utilisez la compression pour économiser l'espace disque (~70% réduction)</li>
          <li>Conservez au moins 3 sauvegardes différentes (J-1, J-7, J-30)</li>
        </ul>
      </div>
    </div>
  );
};
