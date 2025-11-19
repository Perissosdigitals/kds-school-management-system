import React, { useRef, useState, useCallback, useMemo } from 'react';
import type { Student, DocumentType, DocumentStatus, StudentDocument, User, DocumentHistoryLog } from '../types';
import { DocumentPreviewModal } from './ui/DocumentPreviewModal';

interface StudentDocumentsProps {
    student: Student;
    currentUser: User;
    onUpdateStudent: (student: Student, toastMessage: string) => void;
    onBack: () => void;
}

const getStatusInfo = (status: DocumentStatus): { chip: string; icon: string; text: string } => {
    switch (status) {
        case 'Validé': return { chip: 'bg-green-100 text-green-800', icon: 'bxs-check-circle', text: 'Document validé' };
        case 'En attente': return { chip: 'bg-amber-100 text-amber-800', icon: 'bxs-time-five', text: 'En attente de validation' };
        case 'Rejeté': return { chip: 'bg-orange-100 text-orange-800', icon: 'bxs-error', text: 'Document rejeté' };
        case 'Manquant':
        default: return { chip: 'bg-red-100 text-red-800', icon: 'bxs-x-circle', text: 'Document manquant' };
    }
};

const documentTypes: DocumentType[] = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];

const StudentDocuments: React.FC<StudentDocumentsProps> = ({ student, currentUser, onUpdateStudent, onBack }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentDocTypeRef = useRef<DocumentType | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [documentToPreview, setDocumentToPreview] = useState<StudentDocument | null>(null);

    const updateDocument = useCallback((docType: DocumentType, newStatus: DocumentStatus, toastMessage: string, fileName?: string, fileData?: string) => {
        const docIndex = student.documents.findIndex(d => d.type === docType);
        if (docIndex === -1) return;

        const oldDoc = student.documents[docIndex];
        const oldStatus = oldDoc.status;

        const newHistoryEntry: DocumentHistoryLog = {
            timestamp: new Date().toISOString(),
            user: currentUser.name,
            action: `Statut changé de '${oldStatus}' à '${newStatus}'`,
        };
        
        const updatedHistory = [...(oldDoc.history || []), newHistoryEntry];

        const updatedDocs = [...student.documents];
        updatedDocs[docIndex] = {
            ...oldDoc,
            status: newStatus,
            fileName: fileName !== undefined ? fileName : oldDoc.fileName,
            fileData: fileData !== undefined ? fileData : oldDoc.fileData,
            updatedAt: new Date().toLocaleDateString('fr-FR'),
            history: updatedHistory,
        };
        
        onUpdateStudent({ ...student, documents: updatedDocs }, toastMessage);
    }, [student, currentUser, onUpdateStudent]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !currentDocTypeRef.current) {
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = e.target?.result as string;
            updateDocument(currentDocTypeRef.current!, 'En attente', `Document chargé : ${file.name}`, file.name, fileData);
        };
        reader.readAsDataURL(file);
    }, [updateDocument]);

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
    
    const fullHistory = useMemo(() => student.documents
        .flatMap(doc => (doc.history || []).map(log => ({ ...log, docType: doc.type })))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [student.documents]);


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
                    <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Gestion des Documents</h2>
                    <p className="text-gray-500">Élève: <span className="font-semibold">{student.firstName} {student.lastName}</span></p>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
                capture="environment"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {documentTypes.map(docType => {
                    const doc = student.documents.find(d => d.type === docType) || { type: docType, status: 'Manquant', history: [] };
                    const statusInfo = getStatusInfo(doc.status);

                    return (
                        <div key={docType} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">{docType}</h3>
                                    <i className={`bx ${statusInfo.icon} text-2xl ${statusInfo.chip.split(' ')[1]}`}></i>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.chip}`}>{statusInfo.text}</span>
                                {doc.fileName && (
                                     <p className="text-xs text-gray-500 mt-3 truncate">
                                        Fichier: <span className="font-medium">{doc.fileName}</span>
                                    </p>
                                )}
                                {doc.updatedAt && (
                                    <p className="text-xs text-gray-500">Dernière MàJ: {doc.updatedAt}</p>
                                )}
                            </div>
                            
                            <div className="mt-6 space-y-2">
                                {(doc.status === 'Manquant' || doc.status === 'Rejeté') && (
                                    <button onClick={() => triggerFileUpload(docType)} className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                        <i className='bx bxs-camera'></i> <span>Scanner / Charger</span>
                                    </button>
                                )}
                                {(doc.status === 'En attente' || doc.status === 'Validé' || doc.status === 'Rejeté') && doc.fileData && (
                                    <button onClick={() => handlePreviewClick(doc)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition-colors">
                                        <i className='bx bxs-file-find'></i> <span>Visualiser</span>
                                    </button>
                                )}
                                {doc.status === 'En attente' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateDocument(docType, 'Validé', `Document '${docType}' validé.`)} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            <i className='bx bxs-check-shield'></i> <span>Valider</span>
                                        </button>
                                         <button onClick={() => updateDocument(docType, 'Rejeté', `Document '${docType}' rejeté.`)} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            <i className='bx bxs-no-entry'></i> <span>Rejeter</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <i className='bx bx-history'></i>
                    Historique des Modifications
                </h3>
                {fullHistory.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto pr-2">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Date & Heure</th>
                                    <th scope="col" className="px-4 py-2">Utilisateur</th>
                                    <th scope="col" className="px-4 py-2">Document</th>
                                    <th scope="col" className="px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {fullHistory.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                                        <td className="px-4 py-2">{log.user}</td>
                                        <td className="px-4 py-2 font-medium text-slate-600">{log.docType}</td>
                                        <td className="px-4 py-2">{log.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        <i className='bx bx-info-circle text-3xl mb-2'></i>
                        <p>Aucun historique de modification pour cet élève.</p>
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
        </div>
    );
};

export default StudentDocuments;