import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from './Modal';

interface DocumentRejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    documentType: string;
}

export const DocumentRejectionModal: React.FC<DocumentRejectionModalProps> = ({ isOpen, onClose, onConfirm, documentType }) => {
    const [reason, setReason] = useState('');

    // Reset reason when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setReason('');
        }
    }, [isOpen]);

    const handleConfirm = useCallback(() => {
        if (reason.trim()) {
            onConfirm(reason);
            onClose();
        }
    }, [reason, onConfirm, onClose]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Rejet du document"
            size="md"
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                        <i className="bx bxs-error-circle text-2xl"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-900">Action Requise</h3>
                        <p className="text-orange-700 text-xs">Veuillez justifier le rejet du document "{documentType}".</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="rejection-reason" className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">
                        Motif du rejet :
                    </label>
                    <textarea
                        id="rejection-reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Document illisible, mauvais format, date expirée..."
                        className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none text-slate-700 placeholder:text-slate-400 bg-slate-50/30 font-medium"
                        autoFocus
                    />
                    <p className="mt-3 text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                        <i className='bx bx-info-circle text-xs'></i>
                        Visible dans l'historique des modifications
                    </p>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 rounded-2xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-black transition-all text-sm active:scale-95"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                        className="flex-[2] px-6 py-3.5 rounded-2xl text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-black shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 hover:shadow-orange-300 active:scale-95 text-sm"
                    >
                        <i className="bx bx-check-circle text-lg"></i>
                        Confirmer le rejet
                    </button>
                </div>
            </div>
        </Modal>
    );
};
