import React from 'react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: string;
  fileName: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = React.memo(({ isOpen, onClose, fileData, fileName }) => {
  if (!isOpen) return null;

  const isPdf = fileData.startsWith('data:application/pdf');
  const isImage = fileData.startsWith('data:image/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-4xl h-[90vh] flex flex-col m-4 transform transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold text-slate-800 truncate" title={fileName}>{fileName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {isPdf ? (
            <iframe 
              src={fileData} 
              className="w-full h-full border-0" 
              title={fileName}
            >
              Votre navigateur ne supporte pas l'affichage des PDF.
            </iframe>
          ) : isImage ? (
            <img 
              src={fileData} 
              alt={`Aperçu de ${fileName}`} 
              className="max-w-full max-h-full mx-auto object-contain" 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>Le format de ce fichier n'est pas supporté pour un aperçu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});