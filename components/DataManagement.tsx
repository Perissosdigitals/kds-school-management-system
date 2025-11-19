import React, { useState, useEffect, useCallback } from 'react';
import type { User, ImportBatch, ImportBatchStatus } from '../types';
import { getImportBatches, submitImportBatch, approveImportBatch, rejectImportBatch } from '../services/api/dataManagement.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ImportBatchModal } from './ui/ImportBatchModal';
import { DataSourceSelector } from './DataSourceSelector';

const getStatusChip = (status: ImportBatchStatus) => {
    switch(status) {
        case 'pending': return 'bg-amber-100 text-amber-800';
        case 'applied': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'approved': return 'bg-blue-100 text-blue-800'; // Intermediate state
        default: return 'bg-gray-100 text-gray-800';
    }
};

const BatchRow = React.memo(({ batch, onApprove, onReject, canReview }: { batch: ImportBatch; onApprove: (id: string) => void; onReject: (id: string) => void; canReview: boolean }) => (
    <tr className="bg-white border-b">
        <td className="px-6 py-4">{new Date(batch.submittedAt).toLocaleString('fr-FR')}</td>
        <td className="px-6 py-4 font-medium text-slate-800">{batch.submittedBy}</td>
        <td className="px-6 py-4">{batch.dataType}</td>
        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs" title={batch.fileName}>{batch.fileName}</td>
        <td className="px-6 py-4">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(batch.status)}`}>
                {batch.status}
            </span>
        </td>
        <td className="px-6 py-4">
            {batch.status === 'pending' && canReview ? (
                <div className="flex gap-2">
                    <button onClick={() => onApprove(batch.id)} className="text-green-600 hover:text-green-800 font-semibold text-xs">Approuver</button>
                    <button onClick={() => onReject(batch.id)} className="text-red-600 hover:text-red-800 font-semibold text-xs">Rejeter</button>
                </div>
            ) : (
                <div className="text-xs text-slate-500">
                    {batch.reviewedBy && <p>Par: {batch.reviewedBy}</p>}
                    {batch.reviewedAt && <p>{new Date(batch.reviewedAt).toLocaleDateString('fr-FR')}</p>}
                </div>
            )}
        </td>
    </tr>
));

export const DataManagement: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canReview = ['Fondatrice', 'Directrice'].includes(currentUser.role);

  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    const data = await getImportBatches();
    setBatches(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleSubmitImport = useCallback(async (dataType: ImportBatch['dataType'], file: File) => {
    const fileContent = await file.text();
    await submitImportBatch(dataType, file.name, fileContent, currentUser.name);
    fetchBatches(); // Refresh list
  }, [currentUser.name, fetchBatches]);
  
  const handleApprove = useCallback(async (batchId: string) => {
    await approveImportBatch(batchId, currentUser.name);
    fetchBatches();
    alert('Importation approuvée et appliquée !');
  }, [currentUser.name, fetchBatches]);
  
  const handleReject = useCallback(async (batchId: string) => {
    await rejectImportBatch(batchId, currentUser.name);
    fetchBatches();
  }, [currentUser.name, fetchBatches]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Gestion des Données</h2>
        <p className="text-gray-500">Pilotez les sources de données et gérez les mises à jour incrémentales.</p>
      </div>

      {canReview && <DataSourceSelector />}

      <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-xl font-semibold text-slate-800">Historique des Imports et Mises à Jour</h3>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all w-full sm:w-auto">
                  <i className='bx bx-upload'></i> <span>Nouvel Import</span>
              </button>
          </div>
          {isLoading ? <LoadingSpinner /> : (
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                              <th scope="col" className="px-6 py-3">Date Soumission</th>
                              <th scope="col" className="px-6 py-3">Soumis Par</th>
                              <th scope="col" className="px-6 py-3">Type de Données</th>
                              <th scope="col" className="px-6 py-3">Fichier</th>
                              <th scope="col" className="px-6 py-3">Statut</th>
                              <th scope="col" className="px-6 py-3">Actions / Validation</th>
                          </tr>
                      </thead>
                      <tbody>
                          {batches.map(batch => (
                              <BatchRow key={batch.id} batch={batch} onApprove={handleApprove} onReject={handleReject} canReview={canReview} />
                          ))}
                          {batches.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500">
                                    <i className='bx bx-cloud-upload text-4xl mb-2'></i>
                                    <p>Aucun lot d'importation à afficher.</p>
                                    <p className="text-xs">Cliquez sur "Nouvel Import" pour commencer.</p>
                                </td>
                            </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
      
      <ImportBatchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitImport}
      />
    </div>
  );
};

export default DataManagement;