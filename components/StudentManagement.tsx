import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import type { Student, DocumentType, User, SchoolClass, Teacher } from '../types';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';
import { IMPORT_TEMPLATES } from '../src/constants/import-templates';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { FilterInput, FilterSelect } from './ui/FilterControls';
import StudentDocuments from './StudentDocuments';
import { StudentDetail } from './StudentDetail';
import { StudentEditForm } from './StudentEditForm';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { StudentsService } from '../services/api/students.service';
import { ClassesService } from '../services/api/classes.service';
import { TeachersService } from '../services/api/teachers.service';
import { AdvancedStudentFilters, StudentFilters } from './ui/AdvancedStudentFilters';
import { useToast } from '../context/ToastContext';
import { FilterGuide } from './ui/FilterGuide';
import { Button } from './ui/Button';
import { Card, CardHeader } from './ui/Card';
import { Modal } from './ui/Modal';

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
        {student.registrationNumber ? (
          <span className="font-mono text-blue-600">{student.registrationNumber}</span>
        ) : (
          <span className="text-xs text-gray-400 italic" title={student.id}>En attente...</span>
        )}
      </th>
      <td className="px-6 py-4 font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => onViewDetail(student)}>
        {student.lastName} {student.firstName}
      </td>
      <td className="px-6 py-4">{student.class?.name || student.gradeLevel}</td>
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
  const { showToast } = useToast();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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


  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('StudentManagement: Fetching classes and teachers...');
      const [classesResult, teachersResult] = await Promise.all([
        ClassesService.getClasses(),
        TeachersService.getTeachers()
      ]);

      const fetchedClasses = classesResult.data;
      const fetchedTeachers = teachersResult;

      setClasses(fetchedClasses);
      setTeachers(fetchedTeachers);

      console.log('StudentManagement: Fetching all students for client-side filtering...');
      const studentsData = await StudentsService.getStudents({ limit: 1000 }, {
        classes: fetchedClasses,
        teachers: fetchedTeachers
      });
      setAllStudents(studentsData || []);
    } catch (error) {
      console.error('StudentManagement: Error loading data:', error);
      showToast("Erreur: Impossible de charger les données.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStudentUpdate = useCallback((updatedStudent: Student) => {
    setAllStudents(currentStudents =>
      currentStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    );
    setSelectedStudent(updatedStudent);
  }, []);

  const handleStudentUpdateWithToast = useCallback(async (student: Student, message: string) => {
    try {
      // Persister les documents si cette fonction est appelée depuis StudentDocuments
      const updatedStudent = await StudentsService.updateStudentDocuments(student.id, student.documents);
      handleStudentUpdate(updatedStudent);
      console.log('StudentManagement: Documents mis à jour avec succès:', message);
      // Not showing toast here because StudentDocuments now handles it for better granularity
    } catch (error: any) {
      console.error('StudentManagement: Erreur lors de la mise à jour des documents:', error);
      showToast("Erreur lors de la sauvegarde des documents sur le serveur.", "error");
    }
  }, [handleStudentUpdate, showToast]);

  const parseDateFR = (dateStr: string): Date | null => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  const filteredAndSortedStudents = useMemo(() => {
    let results = allStudents.filter(student => {
      // 1. Search Text (Name or Registration Number)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesName = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchLower);
        const matchesRegNum = student.registrationNumber?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesRegNum) return false;
      }

      // 2. Class Filter (Robust: ID, Level-Name, or direct gradeLevel)
      if (filters.selectedClass) {
        const matchesClassId = student.class?.id === filters.selectedClass || student.classId === filters.selectedClass;
        const matchesClassName = `${student.class?.level} - ${student.class?.name}` === filters.selectedClass;
        const matchesGradeLevel = student.gradeLevel === filters.selectedClass;
        if (!matchesClassId && !matchesClassName && !matchesGradeLevel) return false;
      }

      // 3. Teacher Filter (ID or direct match)
      if (filters.selectedTeacher) {
        const matchesTeacherId = student.class?.teacher?.id === filters.selectedTeacher ||
          student.teacherId === filters.selectedTeacher ||
          student.teacher?.id === filters.selectedTeacher;
        if (!matchesTeacherId) return false;
      }

      // 4. Status Filter
      if (filters.selectedStatus && student.status !== filters.selectedStatus) {
        return false;
      }

      // 5. Gender Filter
      if (filters.selectedGender) {
        const gender = student.gender === 'Masculin' || student.gender === 'M' ? 'M' : 'F';
        const filterGender = filters.selectedGender === 'Masculin' || filters.selectedGender === 'M' ? 'M' : 'F';
        if (gender !== filterGender) return false;
      }

      // 6. Date Range Filter
      if (filters.startDate || filters.endDate) {
        const regDate = student.registrationDate ? new Date(student.registrationDate) : null;
        if (regDate) {
          if (filters.startDate && regDate < new Date(filters.startDate)) return false;
          if (filters.endDate && regDate > new Date(filters.endDate)) return false;
        }
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
    const mappedData = filteredAndSortedStudents.map(s => ({
      'ID': s.id,
      'Nom': s.lastName,
      'Prénom': s.firstName,
      'Date Naissance': s.dob,
      'Sexe': s.gender,
      'Classe': s.gradeLevel,
      'Contact Urgence': `${s.emergencyContactName || ''} ${s.emergencyContactPhone || ''}`.trim(),
      'Téléphone': s.phone,
      'Adresse': s.address,
      'Info Médicale': s.medicalInfo,
      'Statut': s.status
    }));
    exportToCSV(mappedData, 'liste_eleves', IMPORT_TEMPLATES.students);
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

  return (
    <div className="space-y-8">
      {/* List View Content */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Gestion des Élèves</h2>
          <p className="text-slate-500">Consultez et gérez les informations des élèves inscrits.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <FilterGuide />
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            icon="bxs-file-import"
            className="sm:w-auto w-full"
          >
            Importer CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportTemplate}
            icon="bxs-download"
            className="sm:w-auto w-full border-purple-100 text-purple-600 hover:border-purple-600"
          >
            Modèle
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            icon="bxs-file-export"
            className="sm:w-auto w-full"
          >
            Exporter ({filteredAndSortedStudents.length})
          </Button>
        </div>
      </div>

      {/* Advanced Filters Component */}
      <AdvancedStudentFilters
        filters={filters}
        onFiltersChange={setFilters}
        classes={classes}
        teachers={teachers}
      />

      {/* Results Summary with Card */}
      <Card variant="blue" padding="sm" className="flex items-center justify-between border-l-8 border-emerald-500 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="bg-emerald-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-200 transform -rotate-3 hover:rotate-0 transition-transform">
            <i className='bx bxs-user-detail text-3xl'></i>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-extra-bold tracking-widest uppercase">Base de données élèves</p>
            <p className="text-3xl font-black text-slate-800">
              {filteredAndSortedStudents.length} <span className="text-xl font-bold text-slate-400">Inscrits</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Total base: <span className="text-slate-800">{allStudents.length}</span></p>
          {filteredAndSortedStudents.length < allStudents.length && (
            <p className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full mt-1">
              -{allStudents.length - filteredAndSortedStudents.length} filtrés
            </p>
          )}
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50/50 border-b">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">ID Élève</th>
                <SortableHeader
                  label="Nom Complet"
                  sortKey="name"
                  currentSortKey={sortKey}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Niveau</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">État Dossier</th>
                <SortableHeader
                  label="Statut"
                  sortKey="status"
                  currentSortKey={sortKey}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((student) => (
                <StudentRow key={student.id} student={student} onViewDocuments={handleViewDocuments} onViewDetail={handleViewDetail} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
              ))}
              {filteredAndSortedStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <i className='bx bx-search-alt text-5xl text-slate-200'></i>
                      <p className="font-medium">Aucun élève trouvé avec ces critères.</p>
                      <Button variant="ghost" size="sm" onClick={() => setFilters({ searchText: '', selectedClass: '', selectedTeacher: '', selectedStatus: '', selectedGender: '', startDate: '', endDate: '' })}>
                        Réinitialiser les filtres
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-slate-50/30 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {paginatedStudents.length} sur {filteredAndSortedStudents.length}
            </span>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                icon="bx-chevron-left"
              >
                Précédent
              </Button>
              <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border shadow-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex-row-reverse"
                icon="bx-chevron-right"
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
      <ImportCSVModal<Student>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importer des Élèves depuis un CSV"
        expectedHeaders={studentHeaders}
      />

      {/* Modal pour Édition Étudiant */}
      <Modal
        isOpen={view === 'edit' && !!selectedStudent}
        onClose={handleBackToList}
        title="Modifier l'Élève"
        size="lg"
      >
        {selectedStudent && (
          <StudentEditForm
            student={selectedStudent}
            onSave={handleStudentSaved}
            onCancel={handleBackToList}
          />
        )}
      </Modal>

      {/* Modal pour Détails Étudiant */}
      <Modal
        isOpen={view === 'detail' && !!selectedStudent}
        onClose={handleBackToList}
        title="Détails de l'Élève"
        size="xl"
      >
        {selectedStudent && (
          <StudentDetail
            student={selectedStudent}
            onBack={handleBackToList}
            onViewDocuments={handleViewDocuments}
            onViewPedagogicalFile={handleViewPedagogicalFile}
            currentUser={currentUser}
            onNavigateToTeacher={(teacherId) => {
              console.log('Navigate to teacher:', teacherId);
              alert('Navigation vers le professeur - À implémenter');
            }}
            onNavigateToClass={(classId) => {
              console.log('Navigate to class:', classId);
              alert('Navigation vers la classe - À implémenter');
            }}
          />
        )}
      </Modal>

      {/* Modal pour Documents */}
      <Modal
        isOpen={view === 'documents' && !!selectedStudent}
        onClose={handleBackToDetail}
        title="Gestion des Documents"
        size="lg"
      >
        {selectedStudent && (
          <StudentDocuments
            student={selectedStudent}
            currentUser={currentUser}
            onUpdateStudent={handleStudentUpdateWithToast}
            onBack={handleBackToDetail}
          />
        )}
      </Modal>

      {/* Modal pour Dossier Pédagogique */}
      <Modal
        isOpen={view === 'pedagogical' && !!selectedStudent}
        onClose={handleBackToDetail}
        title="Dossier Pédagogique"
        size="xl"
      >
        {selectedStudent && (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentPedagogicalFile
              student={selectedStudent}
              currentUser={currentUser}
              onBack={handleBackToDetail}
            />
          </Suspense>
        )}
      </Modal>
    </div>
  );
};

export default StudentManagement;