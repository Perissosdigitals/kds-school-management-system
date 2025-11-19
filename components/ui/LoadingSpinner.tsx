import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full p-10">
    <div className="flex items-center gap-3 text-slate-600">
        <i className='bx bx-loader-alt bx-spin text-3xl'></i>
        <span className="text-lg font-medium">Chargement...</span>
    </div>
  </div>
);