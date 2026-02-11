import React, { useState, useEffect, useCallback } from 'react';
import type { Teacher, TeacherClassAssignment } from '../types';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';
import { IMPORT_TEMPLATES } from '../src/constants/import-templates';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { TeachersService } from '../services/api/teachers.service';
import { DataManagementService } from '../services/api/data-management.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { TeacherEditForm } from './TeacherEditForm';
import { TeacherRoleBadge } from './ui/TeacherRoleBadge';

// Separate Detail and Row views
interface TeacherDetailProps {
  teacher: Teacher;
  onBack: () => void;
  onEdit: (teacher: Teacher) => void;
  onNavigateToClass?: (classId: string) => void;
  onNavigateToStudent?: (studentId: string) => void;
  onNavigateToTimetable?: () => void;
  onNavigateToPedagogicalNotes?: () => void;
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

const TeacherDetail: React.FC<TeacherDetailProps> = ({
  teacher,
  onBack,
  onEdit,
  onNavigateToClass,
  onNavigateToStudent,
  onNavigateToTimetable,
  onNavigateToPedagogicalNotes
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
          <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-800">{teacher.firstName} {teacher.lastName}</h2>
          <p className="text-gray-500">
            Profil de l'enseignant -
            <span className="font-mono ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              {teacher.registrationNumber || 'ID non attribué'}
            </span>
            - {teacher.subject}
          </p>
        </div>
        <button
          onClick={() => onEdit(teacher)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <i className='bx bxs-edit'></i>
          <span>Modifier</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <DetailSection title="Informations Personnelles">
          <DetailItem label="Matricule" value={teacher.registrationNumber} />
          <DetailItem label="Nom de famille" value={teacher.lastName} />
          <DetailItem label="Prénom" value={teacher.firstName} />
          <DetailItem label="Email" value={teacher.email} />
          <DetailItem label="Téléphone" value={teacher.phone} />
          <DetailItem label="Adresse" value={teacher.address} />
          <DetailItem label="Contact d'Urgence" value={teacher.emergencyContact} />
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${teacher.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {teacher.status}
            </span>
          </div>
        </DetailSection>

        <DetailSection title="Informations Professionnelles">
          <DetailItem label="Matière Principale" value={teacher.subject} />
          <DetailItem label="Spécialisation" value={teacher.specialization} />
          <DetailItem label="Date d'Embauche" value={teacher.hireDate} />
          {teacher.qualifications && (
            <div className="md:col-span-3">
              <p className="text-sm text-gray-500">Qualifications et Diplômes</p>
              <p className="font-medium text-slate-800 whitespace-pre-line">{teacher.qualifications}</p>
            </div>
          )}
        </DetailSection>

        {/* Classes Assignées */}
        {teacher.classes && teacher.classes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 pb-2 border-b">Classes Assignées ({teacher.classes.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teacher.classes.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => onNavigateToClass?.(cls.id)}
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-900">{cls.name}</p>
                      <p className="text-sm text-blue-700">{cls.level}</p>
                      {cls.room && <p className="text-xs text-blue-600 mt-1"><i className='bx bxs-door-open'></i> {cls.room}</p>}
                    </div>
                    <i className='bx bx-chevron-right text-2xl text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity'></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Élèves */}
        {teacher.students && teacher.students.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 pb-2 border-b">Élèves Enseignés ({teacher.students.length})</h3>
            <div className="max-h-96 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {teacher.students.map(student => (
                  <div
                    key={student.id}
                    onClick={() => onNavigateToStudent?.(student.id)}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-slate-600">{student.gradeLevel}</p>
                      </div>
                      <i className='bx bx-user text-slate-400 group-hover:text-blue-600 transition-colors'></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Accès Rapide - Point de Repère Central */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <i className='bx bxs-dashboard'></i>
            Accès Rapide aux Données Associées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={onNavigateToTimetable}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <i className='bx bx-calendar text-3xl text-purple-600 group-hover:scale-110 transition-transform'></i>
                <div className="text-left">
                  <p className="font-semibold text-purple-900">Emploi du Temps</p>
                  <p className="text-xs text-purple-700">Horaires de cours</p>
                </div>
              </div>
            </button>

            <button
              onClick={onNavigateToPedagogicalNotes}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <i className='bx bxs-notepad text-3xl text-green-600 group-hover:scale-110 transition-transform'></i>
                <div className="text-left">
                  <p className="font-semibold text-green-900">Notes Pédagogiques</p>
                  <p className="text-xs text-green-700">Suivi des élèves</p>
                </div>
              </div>
            </button>

            <button
              className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <i className='bx bxs-bar-chart-alt-2 text-3xl text-amber-600 group-hover:scale-110 transition-transform'></i>
                <div className="text-left">
                  <p className="font-semibold text-amber-900">Évaluations</p>
                  <p className="text-xs text-amber-700">Saisie des notes</p>
                </div>
              </div>
            </button>

            <button
              className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <i className='bx bxs-calendar-check text-3xl text-red-600 group-hover:scale-110 transition-transform'></i>
                <div className="text-left">
                  <p className="font-semibold text-red-900">Présences</p>
                  <p className="text-xs text-red-700">Feuille d'appel</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherRow = React.memo(({ teacher, onViewDetail, onEdit, onDelete }: {
  teacher: Teacher,
  onViewDetail: (teacher: Teacher) => void,
  onEdit: (teacher: Teacher) => void,
  onDelete: (teacher: Teacher) => void
}) => (
  <tr className="bg-white border-b hover:bg-gray-50">
    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
      {teacher.registrationNumber ? (
        <span className="font-mono text-blue-600">{teacher.registrationNumber}</span>
      ) : (
        <span className="text-xs text-gray-400 italic" title={teacher.id}>En attente...</span>
      )}
    </th>
    <td
      className="px-6 py-4 font-medium text-blue-700 hover:underline cursor-pointer"
      onClick={() => onViewDetail(teacher)}
    >
      {teacher.lastName} {teacher.firstName}
    </td>
    <td className="px-6 py-4">{teacher.subject}</td>
    <td className="px-6 py-4">{teacher.phone}</td>
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-1">
        {teacher.classAssignments && teacher.classAssignments.length > 0 ? (
          teacher.classAssignments.map(assignment => (
            <div key={assignment.id} className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                {assignment.class?.name || 'Unknown'}
              </span>
              <TeacherRoleBadge role={assignment.role} />
            </div>
          ))
        ) : teacher.classes && teacher.classes.length > 0 ? (
          teacher.classes.map(c => (
            <span key={c.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
              {c.name}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-xs italic">Aucune</span>
        )}
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${teacher.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {teacher.status}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <button onClick={() => onEdit(teacher)} className="text-blue-600 hover:text-blue-800" title="Modifier l'enseignant"><i className='bx bxs-edit text-lg'></i></button>
        <button onClick={() => onDelete(teacher)} className="text-red-600 hover:text-red-800" title="Supprimer l'enseignant"><i className='bx bxs-trash text-lg'></i></button>
      </div>
    </td>
  </tr>
));

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit'>('list');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await TeachersService.getTeachers();
      setTeachers(data || []);
    } catch (error) {
      console.error("Failed to load teachers:", error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode('detail');
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode('edit');
  };

  const handleDelete = async (teacher: Teacher) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${teacher.firstName} ${teacher.lastName} ?`)) {
      try {
        await TeachersService.deleteTeacher(teacher.id);
        setTeachers(prev => prev.filter(t => t.id !== teacher.id));
        alert('Enseignant supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'enseignant.');
      }
    }
  };

  const handleSave = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    setViewMode('list');
    setSelectedTeacher(null);
    loadTeachers(); // Refresh the list
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedTeacher(null);
  };

  const handleExport = useCallback(() => {
    const mappedData = teachers.map(t => ({
      'ID_Prof': t.id,
      'Nom': t.lastName,
      'Prenom': t.firstName,
      'Matiere': t.subject,
      'Tel': t.phone,
      'Email': t.email,
      'Classes_Assignees': t.classes ? t.classes.map(c => c.name).join(', ') : ''
    }));
    exportToCSV(mappedData, 'liste_professeurs', IMPORT_TEMPLATES.teachers);
  }, [teachers]);

  const handleImport = useCallback(async (importedData: Teacher[], file?: File) => {
    if (file) {
      try {
        setIsLoading(true);
        await DataManagementService.importTeachers(file);
        alert('Import effectué avec succès !');
        loadTeachers();
      } catch (error) {
        console.error('Erreur import:', error);
        alert('Erreur lors de l\'import des professeurs.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback for when no file is passed (should not happen with updated modal)
      // But we can keep the old logic just in case or just alert
      console.warn('No file provided for import');
    }
  }, []);

  const teacherHeaders = ['id', 'lastName', 'firstName', 'subject', 'phone', 'email', 'status'];

  const handleExportTemplate = useCallback(() => {
    exportCSVTemplate(teacherHeaders, 'modele_import_professeurs');
  }, [teacherHeaders]);

  const handleCreateTeacher = () => {
    setSelectedTeacher({
      id: '',
      firstName: '',
      lastName: '',
      subject: '',
      phone: '',
      email: '',
      status: 'Actif'
    } as Teacher);
    setViewMode('create');
  };

  const handleSaveNewTeacher = (newTeacher: Teacher) => {
    setTeachers(prev => [...prev, newTeacher]);
    setViewMode('list');
    setSelectedTeacher(null);
    loadTeachers(); // Refresh
  };

  // Show detail view
  if (viewMode === 'detail' && selectedTeacher) {
    return <TeacherDetail teacher={selectedTeacher} onBack={handleBack} onEdit={handleEdit} />;
  }

  // Show edit view
  if (viewMode === 'edit' && selectedTeacher) {
    return <TeacherEditForm teacher={selectedTeacher} onSave={handleSave} onCancel={handleBack} />;
  }

  // Show create view
  if (viewMode === 'create' && selectedTeacher) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
            <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
          </button>
          <h2 className="text-3xl font-bold text-slate-800">Nouveau Professeur</h2>
        </div>
        <TeacherEditForm teacher={selectedTeacher} onSave={handleSaveNewTeacher} onCancel={handleBack} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestion des Professeurs</h2>
          <p className="text-gray-500">Consultez et gérez les informations des professeurs.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleCreateTeacher}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
          >
            <i className='bx bx-plus-circle'></i>
            <span>Nouveau Professeur</span>
          </button>
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
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 w-full sm:w-auto"
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
                  <th scope="col" className="px-6 py-3">Classes</th>
                  <th scope="col" className="px-6 py-3">Statut</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <TeacherRow
                    key={teacher.id}
                    teacher={teacher}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
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