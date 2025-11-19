import React from 'react';
import type { FinancialTransaction } from '../../types';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FinancialTransaction | null;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

const DetailRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-slate-800 text-right">{value}</p>
    </div>
);

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Détail de la Transaction</h2>
            <p className="text-gray-500 text-sm">ID: {transaction.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>
        
        <div className="space-y-2">
            <DetailRow label="Date" value={transaction.date} />
            <DetailRow label="Description" value={transaction.description} />
            <DetailRow label="Élève / Source" value={transaction.studentName} />
            <DetailRow label="Classe" value={transaction.gradeLevel || 'N/A'} />
            <DetailRow label="Type" value={transaction.type} />
            <DetailRow label="Montant" value={formatCurrency(transaction.amount)} />
            <DetailRow label="Statut" value={transaction.status} />
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
