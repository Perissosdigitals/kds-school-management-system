import React from 'react';

const Inventory: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestion de l'Inventaire</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className='bx bx-box text-3xl text-blue-600'></i>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Module en construction</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          La gestion de l'inventaire sera bientôt disponible. Vous pourrez gérer le matériel, les fournitures et les équipements de l'école.
        </p>
      </div>
    </div>
  );
};

export default Inventory;
