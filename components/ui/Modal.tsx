import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  const modalContent = (
    <div className="glass-backdrop" onClick={onClose}>
      <div
        className={`glass-panel border-white/50 rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-modal-in shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
          >
            <i className='bx bx-x text-2xl'></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {children}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .glass-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999; /* Higher z-index for portal */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 500ms ease-in-out;
        }
        .glass-panel {
          background-color: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}} />
    </div>
  );

  return createPortal(modalContent, document.body);
};
