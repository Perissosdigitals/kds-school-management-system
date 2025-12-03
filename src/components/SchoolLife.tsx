import React from 'react';
import type { User } from '../types';

interface SchoolLifeProps {
  currentUser?: User;
}

const SchoolLife: React.FC<SchoolLifeProps> = ({ currentUser }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Vie Scolaire</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className='bx bx-calendar-event text-blue-600'></i>
            Événements à venir
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-800">Conseil de classe 6ème A</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Demain</span>
              </div>
              <p className="text-sm text-slate-500">Salle des professeurs - 14h00</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-800">Réunion Parents-Profs</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">15 Déc</span>
              </div>
              <p className="text-sm text-slate-500">Grand Hall - 09h00</p>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className='bx bx-news text-orange-600'></i>
            Annonces
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4 py-1">
              <h3 className="font-medium text-slate-800">Fermeture exceptionnelle</h3>
              <p className="text-sm text-slate-500 mt-1">L'école sera fermée le vendredi 20 décembre pour travaux.</p>
              <p className="text-xs text-slate-400 mt-2">Publié par Admin le 01/12/2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolLife;
