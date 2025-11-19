import React from 'react';
import type { Student } from '../types';

interface StudentDetailProps {
  student: Student;
  onBack: () => void;
  onViewDocuments: (student: Student) => void;
  onViewPedagogicalFile: (student: Student) => void;
}

const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-slate-800">{value || 'N/A'}</p>
  </div>
);

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-3 pb-2 border-b border-slate-200">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);


export const StudentDetail: React.FC<StudentDetailProps> = ({ student, onBack, onViewDocuments, onViewPedagogicalFile }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
          <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{student.firstName} {student.lastName}</h2>
          <p className="text-gray-500">Profil de l'élève - ID: {student.id}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-end gap-3 mb-4">
            <button 
                onClick={() => onViewDocuments(student)} 
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <i className='bx bxs-file-doc'></i>
                <span>Gérer les documents</span>
            </button>
            <button 
                onClick={() => onViewPedagogicalFile(student)} 
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <i className='bx bxs-user-detail'></i>
                <span>Voir la Fiche Pédagogique</span>
            </button>
        </div>

        <DetailSection title="Informations Personnelles">
            <DetailItem label="Nom de famille" value={student.lastName} />
            <DetailItem label="Prénom" value={student.firstName} />
            <DetailItem label="Date de Naissance" value={student.dob} />
            <DetailItem label="Lieu de Naissance" value={student.birthPlace} />
            <DetailItem label="Sexe" value={student.gender} />
            <DetailItem label="Nationalité" value={student.nationality} />
            <DetailItem label="Statut" value={student.status} />
        </DetailSection>

        <DetailSection title="Contact et Adresse">
            <DetailItem label="Adresse de Résidence" value={student.address} />
            <DetailItem label="Téléphone" value={student.phone} />
            <DetailItem label="Email" value={student.email} />
        </DetailSection>

        <DetailSection title="Informations Scolaires">
             <DetailItem label="Date d'Inscription" value={student.registrationDate} />
             <DetailItem label="Niveau Scolaire" value={student.gradeLevel} />
             <DetailItem label="Établissement Antérieur" value={student.previousSchool} />
        </DetailSection>
        
        <DetailSection title="Contact d'Urgence et Santé">
             <DetailItem label="Nom du Contact d'Urgence" value={student.emergencyContactName} />
             <DetailItem label="Téléphone d'Urgence" value={student.emergencyContactPhone} />
             <DetailItem label="Informations Médicales" value={student.medicalInfo} />
        </DetailSection>
      </div>
    </div>
  );
};