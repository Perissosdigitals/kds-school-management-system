import React, { useState, useCallback, useEffect } from 'react';

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all duration-300" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <i className="bx bxs-error-circle text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Rejet du document</h2>
                            <p className="text-slate-500 text-xs">Action requise pour continuer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <i className="bx bx-x text-2xl"></i>
                    </button>
                </div>

                <div className="p-6">
                    <label htmlFor="rejection-reason" className="block text-sm font-semibold text-slate-700 mb-3">
                        Motif du rejet pour "{documentType}" :
                    </label>
                    <textarea
                        id="rejection-reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Veuillez indiquer la raison du rejet pour informer l'utilisateur..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none text-slate-700 placeholder:text-slate-400"
                        autoFocus
                    />
                    <p className="mt-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Ce motif sera visible dans l'historique des modifications.
                    </p>
                </div>

                <div className="p-6 bg-slate-50/80 flex justify-end gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 font-bold transition-all hover:shadow-md active:scale-95"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                        className="px-6 py-2.5 rounded-xl text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 hover:shadow-orange-300 active:scale-95"
                    >
                        <i className="bx bx-check-circle"></i>
                        Confirmer le rejet
                    </button>
                </div>
            </div>
        </div>
    );
};
