import React, { useRef, useState, useCallback, useMemo } from 'react';
import type { Student, DocumentType, DocumentStatus, StudentDocument, User, DocumentHistoryLog } from '../types';
import { DocumentPreviewModal } from './ui/DocumentPreviewModal';
import { DocumentRejectionModal } from './ui/DocumentRejectionModal';
import { DocumentsService } from '../services/api/documents.service';
import { ActivityService } from '../services/api/activity.service';
import { useToast } from '../context/ToastContext';

interface StudentDocumentsProps {
    student: Student;
    currentUser: User;
    onUpdateStudent: (student: Student, toastMessage: string) => void;
    onBack: () => void;
}

const getStatusInfo = (status: DocumentStatus): { chip: string; icon: string; text: string } => {
    switch (status) {
        case 'approved':
        case 'Validé': return { chip: 'bg-green-100 text-green-800', icon: 'bxs-check-circle', text: 'Document validé' };
        case 'pending':
        case 'En attente': return { chip: 'bg-amber-100 text-amber-800', icon: 'bxs-time-five', text: 'En attente de validation' };
        case 'rejected':
        case 'Rejeté': return { chip: 'bg-orange-100 text-orange-800', icon: 'bxs-error', text: 'Document rejeté' };
        case 'missing':
        case 'Manquant':
        default: return { chip: 'bg-red-100 text-red-800', icon: 'bxs-x-circle', text: 'Document manquant' };
    }
};

const documentTypes: DocumentType[] = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];

const StudentDocuments: React.FC<StudentDocumentsProps> = ({ student, currentUser, onUpdateStudent, onBack }) => {
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentDocTypeRef = useRef<DocumentType | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionDocType, setRejectionDocType] = useState<DocumentType | null>(null);
    const [documentToPreview, setDocumentToPreview] = useState<StudentDocument | null>(null);

    // Granular states for better UX
    const [uploadingDocTypes, setUploadingDocTypes] = useState<Set<string>>(new Set());
    const [errorDocTypes, setErrorDocTypes] = useState<Map<string, string>>(new Map());

    const updateDocument = useCallback((docType: DocumentType, newStatus: DocumentStatus, toastMessage: string, fileName?: string, fileData?: string, rejectionReason?: string) => {
        const docIndex = student.documents.findIndex(d => d.type === docType);

        let updatedDocs = [...student.documents];
        const newHistoryEntry: DocumentHistoryLog = {
            timestamp: new Date().toISOString(),
            user: currentUser.name || `${currentUser.first_name} ${currentUser.last_name}`,
            action: rejectionReason
                ? `Statut changé à '${newStatus}' (Motif: ${rejectionReason})`
                : `Statut changé à '${newStatus}'`,
        };

        if (docIndex === -1) {
            // Add new document if not found (happens for missing docs)
            updatedDocs.push({
                type: docType,
                status: newStatus,
                fileName: fileName || '',
                fileData: fileData || '',
                rejectionReason: rejectionReason || '',
                updatedAt: new Date().toLocaleDateString('fr-FR'),
                history: [newHistoryEntry]
            });
        } else {
            const oldDoc = student.documents[docIndex];
            updatedDocs[docIndex] = {
                ...oldDoc,
                status: newStatus,
                fileName: fileName !== undefined ? fileName : oldDoc.fileName,
                fileData: fileData !== undefined ? fileData : oldDoc.fileData,
                rejectionReason: rejectionReason !== undefined ? rejectionReason : oldDoc.rejectionReason,
                updatedAt: new Date().toLocaleDateString('fr-FR'),
                history: [...(oldDoc.history || []), newHistoryEntry],
            };
        }

        onUpdateStudent({ ...student, documents: updatedDocs }, toastMessage);

        ActivityService.logActivity(
            currentUser,
            `Document ${newStatus}: ${docType}`,
            'documents',
            `Élève: ${student.firstName} ${student.lastName}${rejectionReason ? ` - Motif: ${rejectionReason}` : ''}`,
            undefined,
            student.id
        );
    }, [student, currentUser, onUpdateStudent]);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !currentDocTypeRef.current) {
            return;
        }
        const file = event.target.files[0];
        const docType = currentDocTypeRef.current;

        setUploadingDocTypes(prev => new Set(prev).add(docType));
        setErrorDocTypes(prev => {
            const next = new Map(prev);
            next.delete(docType);
            return next;
        });

        try {
            showToast(`Chargement de ${docType}...`, 'info', 3000);

            // Upload to backend
            const uploadedDoc = await DocumentsService.uploadFile(student.id, docType, file);

            // Important: Use the returned backend path 
            const viewUrl = uploadedDoc.url || DocumentsService.getFileViewUrl(uploadedDoc.id);

            // Update local state and parent
            updateDocument(docType, 'pending', `Document chargé : ${file.name}`, file.name, viewUrl);

            showToast("Document enregistré avec succès !", "success");
        } catch (error: any) {
            console.error("Upload error detail:", error);
            const errorMsg = error.response?.data?.message || error.message || "Erreur de connexion au serveur";
            setErrorDocTypes(prev => new Map(prev).set(docType, errorMsg));
            showToast(`Échec du chargement: ${errorMsg}`, "error");
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setUploadingDocTypes(prev => {
                const next = new Set(prev);
                next.delete(docType);
                return next;
            });
        }
    }, [student.id, updateDocument, showToast]);

    const triggerFileUpload = useCallback((docType: DocumentType) => {
        currentDocTypeRef.current = docType;
        fileInputRef.current?.click();
    }, []);

    const handlePreviewClick = useCallback((doc: StudentDocument) => {
        setDocumentToPreview(doc);
        setIsPreviewModalOpen(true);
    }, []);

    const handleClosePreview = useCallback(() => {
        setIsPreviewModalOpen(false);
        setDocumentToPreview(null);
    }, []);

    const handleRejectionClick = useCallback((docType: DocumentType) => {
        setRejectionDocType(docType);
        setIsRejectionModalOpen(true);
    }, []);

    const handleConfirmRejection = useCallback((reason: string) => {
        if (rejectionDocType) {
            updateDocument(rejectionDocType, 'rejected', `Document '${rejectionDocType}' rejeté.`, undefined, undefined, reason);
            setIsRejectionModalOpen(false);
            setRejectionDocType(null);
            showToast(`Document ${rejectionDocType} rejeté`, "info");
        }
    }, [rejectionDocType, updateDocument, showToast]);

    const handleValidationClick = useCallback((docType: DocumentType) => {
        updateDocument(docType, 'approved', `Document '${docType}' validé.`);
        showToast(`Document ${docType} validé avec succès !`, "success");
    }, [updateDocument, showToast]);

    const fullHistory = useMemo(() => student.documents
        .flatMap(doc => (doc.history || []).map(log => ({ ...log, docType: doc.type })))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [student.documents]);

    const isGlobalUploading = uploadingDocTypes.size > 0;

    return (
        <div className="relative">
            <div className={`space-y-6 transition-all`}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} disabled={isGlobalUploading} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors disabled:opacity-50">
                        <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Gestion des Documents</h2>
                        <p className="text-slate-500 font-medium">Élève: <span className="text-blue-600 font-bold">{student.firstName} {student.lastName}</span></p>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {documentTypes.map(docType => {
                        const doc = student.documents.find(d => d.type === docType) || { type: docType, status: 'missing' as DocumentStatus, history: [] };
                        const isUploading = uploadingDocTypes.has(docType);
                        const errorMessage = errorDocTypes.get(docType);

                        // Robust status identification supporting both internal and DB (French) strings
                        const status = doc.status;
                        const isPending = status === 'pending' || status === 'En attente' || status === 'En attente de validation' || (status && status.toLowerCase().includes('attente'));
                        const isApproved = status === 'approved' || status === 'Validé' || status === 'Document validé' || (status && status.toLowerCase().includes('valid'));
                        const isRejected = status === 'rejected' || status === 'Rejeté' || status === 'Document rejeté' || (status && status.toLowerCase().includes('rejet'));

                        // A document is present if it's not missing OR if it has a filename
                        const isPresent = (!!doc.fileName || (!!status && !status.toLowerCase().includes('manquant') && !status.toLowerCase().includes('missing')));
                        const isMissing = !isPresent;

                        // Ensure doc has view link if it has an id but no fileData
                        if (isPresent && !doc.fileData && (doc as any).id) {
                            (doc as any).fileData = DocumentsService.getFileViewUrl((doc as any).id);
                        }

                        const statusInfo = getStatusInfo(doc.status);

                        return (
                            <div key={docType} className={`bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-between border-2 transition-all duration-300 ${isUploading ? 'border-blue-400 scale-[0.98]' : 'border-transparent hover:border-slate-100'}`}>
                                <div className="relative">
                                    {isUploading && (
                                        <div className="absolute inset-x-[-1.5rem] top-[-1.5rem] h-1.5 bg-blue-100 rounded-t-2xl overflow-hidden">
                                            <div className="h-full bg-blue-600 animate-progress-indeterminate w-1/3"></div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-slate-50 rounded-xl">
                                            <i className={`bx ${doc.status === 'missing' ? 'bx-file-blank' : 'bxs-file'} text-3xl text-slate-400`}></i>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusInfo.chip}`}>
                                            {statusInfo.text}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{docType}</h3>

                                    {doc.registrationNumber && (
                                        <div className="text-[10px] inline-flex items-center gap-1 font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 mb-2">
                                            <i className='bx bx-hash'></i> {doc.registrationNumber}
                                        </div>
                                    )}

                                    {doc.fileName && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg truncate">
                                            <i className='bx bx-paperclip text-slate-400'></i>
                                            <span className="truncate flex-1">{doc.fileName}</span>
                                        </div>
                                    )}

                                    {doc.status === 'rejected' && doc.rejectionReason && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-800 shadow-sm">
                                            <div className="flex items-center gap-1.5 font-bold mb-1">
                                                <i className='bx bxs-error-circle'></i>
                                                <span>MOTIF DU REJET</span>
                                            </div>
                                            {doc.rejectionReason}
                                        </div>
                                    )}

                                    {errorMessage && (
                                        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 shadow-sm animate-shake">
                                            <div className="flex items-center gap-1.5 font-bold mb-1">
                                                <i className='bx bxs-x-circle'></i>
                                                <span>ERREUR DE CHARGEMENT</span>
                                            </div>
                                            {errorMessage}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 space-y-3">
                                    {isMissing && !isUploading && (
                                        <button
                                            onClick={() => triggerFileUpload(docType)}
                                            className={`w-full flex items-center justify-center gap-2 font-black py-2.5 px-4 rounded-xl transition-all shadow-lg active:scale-95 ${errorMessage ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} text-white`}
                                        >
                                            <i className={`bx ${errorMessage ? 'bx-refresh' : 'bxs-cloud-upload'} text-xl`}></i>
                                            <span>{errorMessage ? 'Réessayer' : 'Scanner / Charger'}</span>
                                        </button>
                                    )}

                                    {isPresent && !isUploading && (
                                        <div className="grid grid-cols-1 gap-2">
                                            {doc.fileData && (
                                                <button
                                                    onClick={() => handlePreviewClick(doc)}
                                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95"
                                                >
                                                    <i className='bx bxs-file-find text-xl'></i> <span>Visualiser</span>
                                                </button>
                                            )}

                                            <button
                                                onClick={() => triggerFileUpload(docType)}
                                                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold py-2 px-4 rounded-xl transition-colors text-xs"
                                            >
                                                <i className='bx bx-refresh text-lg'></i> <span>Remplacer ce fichier</span>
                                            </button>
                                        </div>
                                    )}

                                    {isPending && !isUploading && (
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                            <button
                                                onClick={() => handleValidationClick(docType)}
                                                className="flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white font-black py-2 rounded-xl transition-all text-xs"
                                            >
                                                <i className='bx bxs-check-shield'></i> <span>Valider</span>
                                            </button>
                                            <button
                                                onClick={() => handleRejectionClick(docType)}
                                                className="flex items-center justify-center gap-1.5 bg-orange-100 hover:bg-orange-600 text-orange-700 hover:text-white font-black py-2 rounded-xl transition-all text-xs"
                                            >
                                                <i className='bx bxs-no-entry'></i> <span>Rejeter</span>
                                            </button>
                                        </div>
                                    )}

                                    {isUploading && (
                                        <div className="w-full py-2.5 px-4 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-blue-100 italic text-sm">
                                            <i className='bx bx-loader-alt bx-spin'></i>
                                            <span>Synchronisation...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <i className='bx bx-history'></i>
                            </div>
                            Historique des Modifications
                        </h3>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                            Journal Temps Réel
                        </div>
                    </div>

                    {fullHistory.length > 0 ? (
                        <div className="relative overflow-x-auto rounded-xl border border-slate-50">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-black">Date & Heure</th>
                                        <th scope="col" className="px-6 py-4 font-black">Utilisateur</th>
                                        <th scope="col" className="px-6 py-4 font-black">Document</th>
                                        <th scope="col" className="px-6 py-4 font-black">Action / Détails</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {fullHistory.map((log, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap tabular-nums text-slate-400 font-medium">
                                                {new Date(log.timestamp).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">{log.user}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-[11px]">
                                                    {log.docType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 italic text-slate-600 group-hover:text-slate-900 transition-colors">
                                                {log.action}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                            <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <i className='bx bx-info-circle text-3xl text-slate-300'></i>
                            </div>
                            <p className="text-slate-400 font-bold">Aucun historique de modification pour cet élève.</p>
                        </div>
                    )}
                </div>

                {isPreviewModalOpen && documentToPreview?.fileData && documentToPreview?.fileName && (
                    <DocumentPreviewModal
                        isOpen={isPreviewModalOpen}
                        onClose={handleClosePreview}
                        fileData={documentToPreview.fileData}
                        fileName={documentToPreview.fileName}
                    />
                )}

                {isRejectionModalOpen && rejectionDocType && (
                    <DocumentRejectionModal
                        isOpen={isRejectionModalOpen}
                        onClose={() => setIsRejectionModalOpen(false)}
                        onConfirm={handleConfirmRejection}
                        documentType={rejectionDocType}
                    />
                )}
            </div>
        </div>
    );
};

export default StudentDocuments;