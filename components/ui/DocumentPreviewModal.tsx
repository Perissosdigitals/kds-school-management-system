import React, { useState, useEffect } from 'react';
import { config } from '../../config';
import { httpClient } from '../../services/httpClient';
import { Modal } from './Modal';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: string;
  fileName: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = React.memo(({ isOpen, onClose, fileData, fileName }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileData.startsWith('data:application/pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) || fileData.startsWith('data:image/');

  useEffect(() => {
    if (isOpen && isPdf && fileData.startsWith('/api')) {
      const fetchPdf = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Use relative path for httpClient which already has the correct baseURL (/api/v1)
          // This removes the need for manual absolute URL construction
          const relativePath = fileData.startsWith('/api/v1')
            ? fileData.replace('/api/v1', '')
            : fileData;

          const response = await httpClient.get(relativePath, {
            responseType: 'blob',
            params: { preview: 'true', t: Date.now() }
          });
          const url = URL.createObjectURL(response.data);
          setBlobUrl(url);
        } catch (err: any) {
          console.error("Error fetching PDF blob:", err);

          // Detect 404 specifically (document not found in database)
          if (err.response?.status === 404) {
            setError("Ce document n'existe plus dans la base de données. Il a peut-être été supprimé ou corrompu. Veuillez le re-télécharger.");
          } else {
            setError("Impossible de charger le document. Veuillez réessayer ou utiliser le bouton en bas pour ouvrir l'original.");
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchPdf();
    } else {
      setBlobUrl(null);
      setError(null);
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, fileData, isPdf, retryCount]);

  if (!isOpen) return null;

  const resolvedFileData = blobUrl || (fileData.startsWith('/api')
    ? `${config.API_URL.replace(/\/api\/v1$/, '')}${fileData}${fileData.includes('?') ? '&' : '?'}preview=true`
    : fileData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fileName}
      size="xl"
    >
      <div className="flex flex-col h-[75vh] md:h-[80vh]">
        <div className="flex-1 overflow-hidden bg-slate-50/50 rounded-xl relative border border-slate-200/50">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm z-10">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-bold animate-pulse">Chargement sécurisé du document...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                <i className='bx bxs-error-circle text-5xl'></i>
              </div>
              <p className="text-slate-800 font-black text-lg mb-2">{error}</p>
              <button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                <i className='bx bx-refresh text-xl'></i>
                Réessayer le chargement
              </button>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full flex flex-col">
              <object
                data={resolvedFileData}
                type="application/pdf"
                className="w-full flex-1 border-0 rounded-lg shadow-inner"
              >
                <iframe
                  src={resolvedFileData}
                  className="w-full h-full border-0"
                  title={`Aperçu PDF - ${fileName}`}
                >
                  <p>Aperçu non disponible directement. Utilisez le bouton ci-dessous.</p>
                </iframe>
              </object>
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={resolvedFileData}
                alt={`Aperçu de ${fileName}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg shadow-slate-200"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6">
                <i className='bx bxs-file-blank text-5xl'></i>
              </div>
              <p className="text-slate-500 font-bold">Le format de ce fichier n'est pas supporté pour un aperçu.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={resolvedFileData.replace('preview=true', 'download=true')}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-black shadow-lg shadow-blue-200 active:scale-95"
          >
            <i className='bx bxs-cloud-download text-xl'></i>
            Ouvrir / Télécharger l'original
          </a>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-sm transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
});