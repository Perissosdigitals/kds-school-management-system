import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Student, DocumentStatus, DocumentType, User, SchoolClass, Teacher } from '../types';
import { StudentsService } from '../services/api/students.service';
import { ClassesService } from '../services/api/classes.service';
import { TeachersService } from '../services/api/teachers.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import StudentDocuments from './StudentDocuments';
import { AdvancedDocumentFilters, type DocumentFilters } from './ui/AdvancedDocumentFilters';

const documentTypes: DocumentType[] = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];

const getStatusColor = (status: DocumentStatus) => {
  switch (status) {
    case 'Validé': return 'bg-green-500';
    case 'En attente': return 'bg-amber-500';
    case 'Rejeté': return 'bg-red-500';
    default: return 'bg-gray-200';
  }
};

export const Documentation: React.FC<{ currentUser?: User }> = ({ currentUser }) => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'student-docs'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>({ searchTerm: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch classes and teachers first as they are needed for enrichment
      const [classesResponse, teachersData] = await Promise.all([
        ClassesService.getClasses(),
        TeachersService.getTeachers()
      ]);

      const academicClasses = classesResponse.data;

      // 2. Fetch students and pass classes/teachers for enrichment
      const students = await StudentsService.getStudents({}, {
        classes: academicClasses,
        teachers: teachersData
      });

      setClasses(academicClasses);
      setTeachers(teachersData);
      setAllStudents(students);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const total = allStudents.length;
    if (total === 0) return { total: 0, complete: 0, pending: 0, missing: 0, totalPendingDocs: 0 };

    let complete = 0;
    let pending = 0;
    let missing = 0;
    let totalPendingDocs = 0;

    allStudents.forEach(student => {
      const docs = student.documents || [];
      const validatedCount = docs.filter(d => d.status === 'Validé').length;
      const pendingCount = docs.filter(d =>
        d.status === 'En attente' ||
        d.status === 'En attente de validation'
      ).length;

      // Count total pending documents across all students
      totalPendingDocs += pendingCount;

      // Categorize students
      if (validatedCount === documentTypes.length) {
        complete++;
      } else if (pendingCount > 0) {
        pending++; // Students with at least one document awaiting validation
      } else {
        missing++;
      }
    });

    return { total, complete, pending, missing, totalPendingDocs };
  }, [allStudents]);

  const filteredStudents = useMemo(() => {
    // Debug: Log first student to see structure
    if (allStudents.length > 0 && filters.classId) {
      console.log('DEBUG - First student:', allStudents[0]);
      console.log('DEBUG - First student class:', allStudents[0].class);
      console.log('DEBUG - Filter classId:', filters.classId);
    }

    return allStudents.filter(student => {
      // Filter by search term (name or registration number)
      const matchesSearch = !filters.searchTerm ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (student.registrationNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // Filter by class (robust check: object ID, direct ID, class name, or grade level)
      const matchesClass = !filters.classId ||
        student.class?.id === filters.classId ||
        student.classId === filters.classId ||
        student.class?.name === filters.classId ||
        student.gradeLevel === filters.classId;

      // Filter by teacher (via class or directly)
      const matchesTeacher = !filters.teacherId ||
        student.class?.teacher?.id === filters.teacherId ||
        student.teacher?.id === filters.teacherId ||
        student.teacherId === filters.teacherId ||
        student.class?.teacherName === filters.teacherId;

      // Filter by document status
      let matchesDocStatus = true;
      if (filters.documentStatus) {
        const docs = student.documents || [];

        if (filters.documentStatus === 'Manquant') {
          // For "Manquant", check if ANY required document type is missing
          matchesDocStatus = documentTypes.some(requiredType => {
            return !docs.some(doc => doc.type === requiredType);
          });
        } else {
          // For other statuses, check if student has at least one document with that status
          matchesDocStatus = docs.some(doc => doc.status === filters.documentStatus);
        }
      }

      // Filter by progression
      let matchesProgress = true;
      if (filters.progressFilter) {
        const validatedCount = (student.documents || []).filter(d => d.status === 'Validé').length;
        if (filters.progressFilter === 'complete') {
          matchesProgress = validatedCount === documentTypes.length;
        } else if (filters.progressFilter === 'partial') {
          matchesProgress = validatedCount > 0 && validatedCount < documentTypes.length;
        } else if (filters.progressFilter === 'missing') {
          matchesProgress = validatedCount === 0;
        }
      }

      return matchesSearch && matchesClass && matchesTeacher && matchesDocStatus && matchesProgress;
    });
  }, [allStudents, filters]);

  const handleViewStudentDocs = (student: Student) => {
    setSelectedStudent(student);
    setView('student-docs');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedStudent(null);
    loadData(); // Refresh data in case improvements were made
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      await StudentsService.updateStudentDocuments(updatedStudent.id, updatedStudent.documents);
      setAllStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      setSelectedStudent(updatedStudent);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des documents:', error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (view === 'student-docs' && selectedStudent && currentUser) {
    return (
      <StudentDocuments
        student={selectedStudent}
        currentUser={currentUser}
        onUpdateStudent={handleUpdateStudent}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestion des Documents</h2>
          <p className="text-gray-500">Suivi complet et archivage de la documentation des élèves.</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <i className='bx bxs-user-detail text-2xl'></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Élèves</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <i className='bx bxs-check-shield text-2xl'></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Dossiers Complets</p>
            <p className="text-2xl font-bold text-slate-800">{stats.complete}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <i className='bx bxs-time-five text-2xl'></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Documents en Attente</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalPendingDocs}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.pending} élève{stats.pending > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
            <i className='bx bxs-x-circle text-2xl'></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Dossiers Vides</p>
            <p className="text-2xl font-bold text-slate-800">{stats.missing}</p>
          </div>
        </div>
      </div>

      {/* Advanced Filters Section */}
      <AdvancedDocumentFilters
        onFilterChange={setFilters}
        classes={classes}
        teachers={teachers}
      />

      {/* Student List Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">Suivi par Élève</h3>
          <div className="text-sm text-slate-500">
            <span className="font-bold text-slate-700">{filteredStudents.length}</span> élève{filteredStudents.length > 1 ? 's' : ''}
            {filteredStudents.length !== allStudents.length && (
              <span className="text-slate-400"> sur {allStudents.length}</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Élève</th>
                <th className="px-6 py-4 font-bold">Classe</th>
                <th className="px-6 py-4 font-bold">État de Progression</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const validatedCount = (student.documents || []).filter(d => d.status === 'Validé').length;
                const progress = (validatedCount / documentTypes.length) * 100;

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{student.lastName} {student.firstName}</p>
                          <p className="text-xs text-slate-500 font-mono">{student.registrationNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                        {student.class?.name || student.gradeLevel || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-amber-500' : 'bg-slate-300'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{validatedCount}/{documentTypes.length}</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {documentTypes.map(type => {
                          const doc = (student.documents || []).find(d => d.type === type);
                          return (
                            <div
                              key={type}
                              className={`w-2 h-2 rounded-full ${getStatusColor(doc?.status || 'Manquant')}`}
                              title={`${type}: ${doc?.status || 'Manquant'}`}
                            ></div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewStudentDocs(student)}
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-sm"
                      >
                        <i className='bx bxs-file-doc'></i>
                        Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <i className='bx bx-search text-4xl mb-2'></i>
                    <p>Aucun élève trouvé avec les filtres appliqués</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {allStudents.length > 0 && (
          <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Fin de la liste • {allStudents.length} élèves au total</p>
          </div>
        )}
      </div>
    </div>
  );
};
