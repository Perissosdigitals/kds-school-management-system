import React from 'react';
import type { TimetableLog } from '../../types';

interface TimetableHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TimetableLog[];
}

export const TimetableHistoryModal: React.FC<TimetableHistoryModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl m-4 flex flex-col h-[70vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className='bx bx-history'></i>
            Historique des Modifications
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
            {logs.length > 0 ? (
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3">Date & Heure</th>
                            <th scope="col" className="px-4 py-3">Utilisateur</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="px-4 py-2 font-medium text-slate-700">{log.user}</td>
                                <td className="px-4 py-2">{log.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-500">
                    <div>
                        <i className='bx bx-info-circle text-4xl mb-2'></i>
                        <p>Aucune modification n'a encore été enregistrée.</p>
                    </div>
                </div>
            )}
        </div>
        
        <div className="mt-8 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors">
                Fermer
            </button>
        </div>
      </div>
    </div>
  );
};