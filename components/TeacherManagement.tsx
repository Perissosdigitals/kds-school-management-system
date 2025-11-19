import React, { useState, useEffect, useCallback } from 'react';
import type { Teacher } from '../types';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { getTeachers } from '../services/api/teachers.service';
import { LoadingSpinner } from './ui/LoadingSpinner';

const TeacherRow = React.memo(({ teacher }: { teacher: Teacher }) => (
    <tr className="bg-white border-b hover:bg-gray-50">
        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
        {teacher.id}
        </th>
        <td className="px-6 py-4">{teacher.lastName} {teacher.firstName}</td>
        <td className="px-6 py-4">{teacher.subject}</td>
        <td className="px-6 py-4">{teacher.phone}</td>
        <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            teacher.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {teacher.status}
        </span>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
            <button className="text-blue-600 hover:text-blue-800"><i className='bx bxs-edit text-lg'></i></button>
            <button className="text-red-600 hover:text-red-800"><i className='bx bxs-trash text-lg'></i></button>
            </div>
        </td>
    </tr>
));

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const loadTeachers = async () => {
        setIsLoading(true);
        try {
            const data = await getTeachers();
            setTeachers(data || []);
        } catch (error) {
            console.error("Failed to load teachers:", error);
            setTeachers([]);
        } finally {
            setIsLoading(false);
        }
    }
    loadTeachers();
  }, []);

  const handleExport = useCallback(() => {
    exportToCSV(teachers, 'liste_professeurs');
  }, [teachers]);
  
  const handleImport = useCallback((importedData: Teacher[]) => {
    const newTeachers = importedData.map((t, index) => ({
      ...t,
      id: t.id || `T-IMPORT-${Date.now()}-${index}`,
    }));
    setTeachers(prev => [...prev, ...newTeachers]);
    alert(`${newTeachers.length} professeur(s) importé(s) avec succès !`);
  }, []);

  const teacherHeaders = ['id', 'lastName', 'firstName', 'subject', 'phone', 'email', 'status'];
  
  const handleExportTemplate = useCallback(() => {
    exportCSVTemplate(teacherHeaders, 'modele_import_professeurs');
  }, [teacherHeaders]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestion des Professeurs</h2>
          <p className="text-gray-500">Consultez et gérez les informations des professeurs.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
          >
            <i className='bx bxs-file-import'></i>
            <span>Importer CSV</span>
          </button>
          <button 
            onClick={handleExportTemplate}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
            title="Télécharger un modèle CSV pour l'importation"
          >
            <i className='bx bxs-download'></i>
            <span>Télécharger Modèle</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
          >
            <i className='bx bxs-file-export'></i>
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        {isLoading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">ID Professeur</th>
                    <th scope="col" className="px-6 py-3">Nom Complet</th>
                    <th scope="col" className="px-6 py-3">Matière</th>
                    <th scope="col" className="px-6 py-3">Téléphone</th>
                    <th scope="col" className="px-6 py-3">Statut</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {teachers.map((teacher) => (
                    <TeacherRow key={teacher.id} teacher={teacher} />
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>
      <ImportCSVModal<Teacher>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importer des Professeurs depuis un CSV"
        expectedHeaders={teacherHeaders}
      />
    </div>
  );
};

export default TeacherManagement;