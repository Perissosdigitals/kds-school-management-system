import React from 'react';
import type { InventoryItem } from '../../types';

interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

const DetailRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-slate-800 text-right">{value}</p>
    </div>
);

export const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Détail de l'Article</h2>
            <p className="text-gray-500 text-sm">ID: {item.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>
        
        <div className="space-y-2">
            <DetailRow label="Nom de l'article" value={item.name} />
            <DetailRow label="Catégorie" value={item.category} />
            <DetailRow label="Quantité" value={`${item.quantity} ${item.unit}`} />
            <DetailRow label="Statut du Stock" value={item.stockStatus} />
            <DetailRow label="Dernière Mise à Jour" value={item.lastUpdated} />
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
