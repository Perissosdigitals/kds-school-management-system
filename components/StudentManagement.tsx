import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import type { Student, DocumentType, User, SchoolClass, Teacher } from '../types';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { FilterInput, FilterSelect } from './ui/FilterControls';
import StudentDocuments from './StudentDocuments';
import { StudentDetail } from './StudentDetail';
import { StudentEditForm } from './StudentEditForm';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { StudentsService } from '../services/api/students.service';
import { AdvancedStudentFilters, StudentFilters } from './ui/AdvancedStudentFilters';
import { FilterGuide } from './ui/FilterGuide';
import { schoolClasses, teacherDetails } from '../data/mockData';

const StudentPedagogicalFile = lazy(() => import('./StudentPedagogicalFile'));

type SortKey = 'name' | 'status';
type SortDirection = 'asc' | 'desc';

const getStatusClass = (status: Student['status']) => {
    switch (status) {
        case 'Actif':
            return 'bg-green-100 text-green-800';
        case 'Inactif':
            return 'bg-red-100 text-red-800';
        case 'En attente':
            return 'bg-amber-100 text-amber-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const documentTypes: DocumentType[] = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];

const StudentRow = React.memo(({ student, onViewDocuments, onViewDetail, onEdit, onDelete }: { student: Student, onViewDocuments: (student: Student) => void, onViewDetail: (student: Student) => void, onEdit: (student: Student) => void, onDelete: (student: Student) => void }) => {
    const totalDocs = documentTypes.length;
    const validatedDocs = student.documents.filter(d => d.status === 'Validé').length;
    const progressPercentage = totalDocs > 0 ? (validatedDocs / totalDocs) * 100 : 0;

    const getProgressBarColor = (percentage: number) => {
        if (percentage === 100) return 'bg-green-500';
        if (percentage >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };
    
    const progressBarColor = getProgressBarColor(progressPercentage);

    return (
        <tr className="bg-white border-b">
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {student.id}
            </th>
            <td className="px-6 py-4 font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => onViewDetail(student)}>
              {student.lastName} {student.firstName}
            </td>
            <td className="px-6 py-4">{student.gradeLevel}</td>
            <td 
              className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => onViewDocuments(student)}
              title="Gérer les documents de cet élève"
            >
                <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className={`${progressBarColor} h-2.5 rounded-full`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8 text-right">{validatedDocs}/{totalDocs}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(student.status)}`}>
                {student.status}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => onEdit(student)} className="text-blue-600 hover:text-blue-800" title="Modifier l'élève"><i className='bx bxs-edit text-lg'></i></button>
                    <button onClick={() => onDelete(student)} className="text-red-600 hover:text-red-800" title="Supprimer l'élève"><i className='bx bxs-trash text-lg'></i></button>
                </div>
            </td>
        </tr>
    );
});

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey | null;
  currentSortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}> = ({ label, sortKey, currentSortKey, currentSortDirection, onSort }) => {
  const isSorting = currentSortKey === sortKey;
  return (
    <th scope="col" className="px-6 py-3">
        <button className="flex items-center gap-1.5 hover:text-slate-900 transition-colors uppercase" onClick={() => onSort(sortKey)}>
            <span>{label}</span>
            {isSorting && (currentSortDirection === 'asc' ? <i className='bx bx-sort-up'></i> : <i className='bx bx-sort-down'></i>)}
            {!isSorting && <i className='bx bx-sort text-slate-400'></i>}
        </button>
    </th>
  );
};

export const StudentManagement: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'documents' | 'detail' | 'pedagogical' | 'edit'>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const ITEMS_PER_PAGE = 10;
  
  // Advanced filters state
  const [filters, setFilters] = useState<StudentFilters>({
    searchText: '',
    selectedClass: '',
    selectedTeacher: '',
    selectedStatus: '',
    selectedGender: '',
    startDate: '',
    endDate: ''
  });


  useEffect(() => {
    const loadStudents = async () => {
        setIsLoading(true);
        try {
            const data = await StudentsService.getStudents();
            setAllStudents(data || []);
        } catch (error) {
            console.error(error);
            setAllStudents([]);
            alert("Erreur: Impossible de charger les élèves.");
        } finally {
            setIsLoading(false);
        }
    }
    loadStudents();
  }, []);
  
  const handleStudentUpdate = useCallback((updatedStudent: Student) => {
    setAllStudents(currentStudents => 
      currentStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    );
    setSelectedStudent(updatedStudent);
  }, []);
  
  const handleStudentUpdateWithToast = useCallback((student: Student, _message: string) => {
    handleStudentUpdate(student);
  }, [handleStudentUpdate]);

  const parseDateFR = (dateStr: string): Date | null => {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const [day, month, year] = parts.map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      return new Date(year, month - 1, day);
  };

  const filteredAndSortedStudents = useMemo(() => {
    let results = allStudents.filter(student => {
      // Search by name filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        if (!fullName.includes(searchLower)) return false;
      }
      
      // Filter by class
      if (filters.selectedClass && student.gradeLevel !== filters.selectedClass) {
        return false;
      }
      
      // Filter by teacher (using student's class teacher)
      if (filters.selectedTeacher && student.teacherId !== filters.selectedTeacher) {
        return false;
      }
      
      // Filter by status
      if (filters.selectedStatus && student.status !== filters.selectedStatus) {
        return false;
      }
      
      // Filter by gender
      if (filters.selectedGender) {
        const normalizedGender = student.gender;
        const filterGender = filters.selectedGender;
        
        // Handle different gender formats
        const genderMatch = 
          normalizedGender === filterGender ||
          (filterGender === 'Masculin' && (normalizedGender === 'M' || normalizedGender === 'male')) ||
          (filterGender === 'Féminin' && (normalizedGender === 'F' || normalizedGender === 'female')) ||
          (filterGender === 'M' && (normalizedGender === 'Masculin' || normalizedGender === 'male')) ||
          (filterGender === 'F' && (normalizedGender === 'Féminin' || normalizedGender === 'female'));
        
        if (!genderMatch) return false;
      }
      
      // Filter by date range
      if (filters.startDate || filters.endDate) {
        const registrationDate = parseDateFR(student.registrationDate);
        if (!registrationDate) return false;
  
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;
        
        const isAfterStartDate = start ? registrationDate >= start : true;
        const isBeforeEndDate = end ? registrationDate <= end : true;
        
        if (!(isAfterStartDate && isBeforeEndDate)) return false;
      }
      
      return true;
    });

    // Apply sorting
    if (sortKey) {
        results.sort((a, b) => {
            let valA, valB;
            if (sortKey === 'name') {
                valA = `${a.lastName} ${a.firstName}`;
                valB = `${b.lastName} ${b.firstName}`;
            } else { // status
                valA = a.status;
                valB = b.status;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return results;
  }, [allStudents, filters, sortKey, sortDirection]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortKey, sortDirection]);
  
  const totalPages = Math.ceil(filteredAndSortedStudents.length / ITEMS_PER_PAGE);
  
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedStudents, currentPage]);


  const handleExport = useCallback(() => {
    exportToCSV(filteredAndSortedStudents, 'liste_eleves');
  }, [filteredAndSortedStudents]);

  const handleImport = useCallback((importedData: any[]) => {
    const newStudents = importedData.map((s, index) => ({
      ...s,
      id: s.id || `IMPORT-${Date.now()}-${index}`,
      documents: s.documents || documentTypes.map(type => ({ type, status: 'Manquant' })),
    }));
    setAllStudents(prev => [...prev, ...newStudents]);
    alert(`${newStudents.length} élève(s) importé(s) avec succès !`);
  }, []);
  
  const handleViewDocuments = useCallback((studentToView: Student) => {
    setSelectedStudent(studentToView);
    setView('documents');
  }, []);

  const handleViewDetail = useCallback((studentToView: Student) => {
    setSelectedStudent(studentToView);
    setView('detail');
  }, []);

  const handleViewPedagogicalFile = useCallback((studentToView: Student) => {
    setSelectedStudent(studentToView);
    setView('pedagogical');
  }, []);

  const handleEditStudent = useCallback((studentToEdit: Student) => {
    setSelectedStudent(studentToEdit);
    setView('edit');
  }, []);

  const handleDeleteStudent = useCallback(async (studentToDelete: Student) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${studentToDelete.firstName} ${studentToDelete.lastName}?`)) {
      try {
        await StudentsService.deleteStudent(studentToDelete.id);
        setAllStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
        alert('Élève supprimé avec succès!');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'élève.');
      }
    }
  }, []);

  const handleStudentSaved = useCallback((updatedStudent: Student) => {
    setAllStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setView('list');
    setSelectedStudent(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setView('list');
    setSelectedStudent(null);
  }, []);
  
  const handleBackToDetail = useCallback(() => {
    setView('detail');
  }, []);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else {
            setSortKey(null); // Cycle off
        }
    } else {
        setSortKey(key);
        setSortDirection('asc');
    }
  };

  const studentHeaders = ['id', 'registrationDate', 'lastName', 'firstName', 'dob', 'gender', 'nationality', 'birthPlace', 'address', 'phone', 'email', 'gradeLevel', 'previousSchool', 'emergencyContactName', 'emergencyContactPhone', 'medicalInfo', 'status'];

  const handleExportTemplate = useCallback(() => {
    exportCSVTemplate(studentHeaders, 'modele_import_eleves');
  }, [studentHeaders]);


  if (isLoading) {
      return <LoadingSpinner />;
  }

  if (view === 'edit' && selectedStudent) {
    return (
        <StudentEditForm
            student={selectedStudent}
            onSave={handleStudentSaved}
            onCancel={handleBackToList}
        />
    );
  }

  if (view === 'documents' && selectedStudent) {
    return (
        <StudentDocuments 
            student={selectedStudent}
            currentUser={currentUser}
            onUpdateStudent={handleStudentUpdateWithToast}
            onBack={handleBackToDetail}
        />
    );
  }

  if (view === 'detail' && selectedStudent) {
    return (
        <StudentDetail
            student={selectedStudent}
            onBack={handleBackToList}
            onViewDocuments={handleViewDocuments}
            onViewPedagogicalFile={handleViewPedagogicalFile}
            onNavigateToTeacher={(teacherId) => {
              console.log('Navigate to teacher:', teacherId);
              // TODO: Implement navigation to teacher detail
              alert('Navigation vers le professeur - À implémenter dans App.tsx');
            }}
            onNavigateToClass={(classId) => {
              console.log('Navigate to class:', classId);
              // TODO: Implement navigation to class detail
              alert('Navigation vers la classe - À implémenter dans App.tsx');
            }}
            onNavigateToTimetable={() => {
              console.log('Navigate to timetable');
              // TODO: Implement navigation to timetable
              alert('Navigation vers l\'emploi du temps - À implémenter');
            }}
            onNavigateToGrades={() => {
              console.log('Navigate to grades');
              // TODO: Implement navigation to grades
              alert('Navigation vers les notes - À implémenter');
            }}
        />
    );
  }

  if (view === 'pedagogical' && selectedStudent) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <StudentPedagogicalFile
            student={selectedStudent}
            currentUser={currentUser}
            onBack={handleBackToDetail}
        />
      </Suspense>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestion des Élèves</h2>
          <p className="text-gray-500">Consultez et gérez les informations des élèves inscrits.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <FilterGuide />
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
            title="Télécharger un fichier CSV avec les colonnes attendues pour l'importation."
          >
            <i className='bx bxs-download'></i>
            <span>Télécharger Modèle</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
            title={`Exporter ${filteredAndSortedStudents.length} élève(s) (résultats filtrés)`}
          >
            <i className='bx bxs-file-export'></i>
            <span>Exporter CSV</span>
            {filteredAndSortedStudents.length < allStudents.length && (
              <span className="bg-green-800 text-xs px-2 py-0.5 rounded-full">
                {filteredAndSortedStudents.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Advanced Filters Component */}
      <AdvancedStudentFilters
        filters={filters}
        onFiltersChange={setFilters}
        classes={schoolClasses}
        teachers={teacherDetails}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center">
            <i className='bx bx-user-check text-2xl'></i>
          </div>
          <div>
            <p className="text-sm text-gray-600">Résultats de recherche</p>
            <p className="text-2xl font-bold text-gray-800">
              {filteredAndSortedStudents.length} élève{filteredAndSortedStudents.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>Total dans la base: <span className="font-semibold text-gray-800">{allStudents.length}</span></p>
          {filteredAndSortedStudents.length < allStudents.length && (
            <p className="text-blue-600 font-medium">
              {allStudents.length - filteredAndSortedStudents.length} élève{allStudents.length - filteredAndSortedStudents.length > 1 ? 's' : ''} masqué{allStudents.length - filteredAndSortedStudents.length > 1 ? 's' : ''} par les filtres
            </p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 uppercase">ID Élève</th>
                <SortableHeader
                    label="Nom Complet"
                    sortKey="name"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                />
                <th scope="col" className="px-6 py-3 uppercase">Niveau</th>
                <th scope="col" className="px-6 py-3 uppercase">État des Documents</th>
                <SortableHeader
                    label="Statut"
                    sortKey="status"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                />
                <th scope="col" className="px-6 py-3 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <StudentRow key={student.id} student={student} onViewDocuments={handleViewDocuments} onViewDetail={handleViewDetail} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
              ))}
              {filteredAndSortedStudents.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                        <i className='bx bx-user-x text-4xl mb-2'></i>
                        <p>Aucun élève ne correspond à vos critères de filtrage.</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
             <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                <span className="text-sm text-gray-600">
                    Affiche {paginatedStudents.length} sur {filteredAndSortedStudents.length} élèves
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Précédent
                    </button>
                    <span className="text-sm font-medium text-slate-700">
                        Page {currentPage} sur {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Suivant
                    </button>
                </div>
            </div>
        )}
      </div>
      <ImportCSVModal<Student>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importer des Élèves depuis un CSV"
        expectedHeaders={studentHeaders}
      />
    </div>
  );
};

export default StudentManagement;