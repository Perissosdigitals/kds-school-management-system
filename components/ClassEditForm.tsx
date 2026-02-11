import React, { useState, useEffect } from 'react';
import type { SchoolClass, Teacher, TeacherRole, TeacherClassAssignment } from '../types';
import { ClassesService, assignTeacherToClass, removeTeacherFromClass, getClassTeachers } from '../services/api/classes.service';
import { TeachersService } from '../services/api/teachers.service';
import { TeacherRoleBadge } from './ui/TeacherRoleBadge';

interface ClassEditFormProps {
  schoolClass: SchoolClass;
  onSave: (updatedClass: SchoolClass) => void;
  onCancel: () => void;
}

export const ClassEditForm: React.FC<ClassEditFormProps> = ({ schoolClass, onSave, onCancel }) => {
  const [formData, setFormData] = useState(schoolClass);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Teacher assignment state
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherClassAssignment[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [stagedTeacherIds, setStagedTeacherIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<TeacherRole>('other');
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const isCreateMode = !schoolClass.id || schoolClass.id === '';

  // Load teachers and assignments
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingTeachers(true);
      try {
        // Load all teachers
        const teachers = await TeachersService.getTeachers();
        setAvailableTeachers(teachers);

        // Load existing assignments if editing
        if (!isCreateMode && schoolClass.id) {
          const assignments = await getClassTeachers(schoolClass.id);
          setTeacherAssignments(assignments);
        }
      } catch (err) {
        console.error('Error loading teachers:', err);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    loadData();
  }, [schoolClass.id, isCreateMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Le nom de la classe est obligatoire');
      return false;
    }
    if (!formData.level.trim()) {
      setError('Le niveau scolaire est obligatoire');
      return false;
    }
    if (formData.capacity < 1) {
      setError('La capacité doit être d\'au moins 1 élève');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isCreateMode) {
        console.log('ClassEditForm: Création d\'une nouvelle classe...', formData);
        const newClass = await ClassesService.createClass(formData);
        setSuccessMessage('Classe créée avec succès!');
        setTimeout(() => {
          onSave(newClass);
        }, 1500);
      } else {
        console.log('ClassEditForm: Mise à jour de la classe...', formData);
        const updatedClass = await ClassesService.updateClass(schoolClass.id, formData);
        setSuccessMessage('Classe mise à jour avec succès!');
        setTimeout(() => {
          onSave(updatedClass);
        }, 1500);
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(`Erreur lors de ${isCreateMode ? 'la création' : 'la mise à jour'} de la classe. Veuillez réessayer.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher assignment handlers
  const handleStageTeacher = (teacherId: string) => {
    if (!teacherId || stagedTeacherIds.includes(teacherId)) return;
    setStagedTeacherIds(prev => [...prev, teacherId]);
    setSelectedTeacherId('');
  };

  const handleUnstageTeacher = (teacherId: string) => {
    setStagedTeacherIds(prev => prev.filter(id => id !== teacherId));
  };

  const handleAssignTeacher = async () => {
    if (stagedTeacherIds.length === 0 || !schoolClass.id) return;

    setIsLoading(true);
    try {
      const results = await Promise.all(
        stagedTeacherIds.map(teacherId => assignTeacherToClass(schoolClass.id!, teacherId, 'other'))
      );

      setTeacherAssignments(prev => [...prev, ...results]);
      setStagedTeacherIds([]);
      setSuccessMessage(`${stagedTeacherIds.length} enseignant(s) affecté(s) avec succès!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error assigning teachers:', err);
      setError('Erreur lors de l\'affectation des enseignants');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!schoolClass.id) return;

    try {
      await removeTeacherFromClass(schoolClass.id, teacherId);
      setTeacherAssignments(prev => prev.filter(a => a.teacherId !== teacherId));
      setSuccessMessage('Enseignant retiré avec succès!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error removing teacher:', err);
      setError('Erreur lors du retrait de l\'enseignant');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = availableTeachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-shake">
          <p className="font-bold flex items-center gap-2">
            <i className='bx bx-error-circle'></i>
            Erreur
          </p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-bounce-subtle">
          <p className="font-bold flex items-center gap-2">
            <i className='bx bx-check-circle'></i>
            Succès
          </p>
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Nom de la classe *</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ex: 6ème A, CM2 B..."
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Niveau Scolaire *</span>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
                placeholder="Ex: Primaire, Secondaire..."
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Année Académique *</span>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Capacité maximale *</span>
              <div className="relative">
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium pl-10"
                />
                <i className='bx bx-group absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg'></i>
              </div>
            </label>
          </div>
        </div>

        {/* Teacher Assignment Section - Only show in edit mode */}
        {!isCreateMode && schoolClass.id && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <i className='bx bxs-user-badge text-blue-600'></i>
              Enseignants Affectés
            </h3>

            {/* Current Assignments - Harmonized with Teacher Profile Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isLoadingTeachers ? (
                <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <i className='bx bx-loader-alt animate-spin text-3xl mb-2'></i>
                  <p className="text-sm font-medium">Chargement des affectations...</p>
                </div>
              ) : teacherAssignments.length > 0 ? (
                teacherAssignments.map(assignment => (
                  <div key={assignment.id} className="group flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-blue-200">
                        {assignment.teacher?.firstName?.[0]}{assignment.teacher?.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate leading-tight">
                          {assignment.teacher ? `${assignment.teacher.firstName} ${assignment.teacher.lastName}` : getTeacherName(assignment.teacherId)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {assignment.teacher?.subject || 'Enseignant'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeacher(assignment.teacherId)}
                      className="text-slate-300 hover:text-red-500 p-2 rounded-lg transition-colors"
                      title="Retirer"
                    >
                      <i className='bx bx-x text-xl'></i>
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-300">
                    <i className='bx bx-user-x text-2xl'></i>
                  </div>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest italic">Aucun enseignant affecté</p>
                </div>
              )}
            </div>

            {/* Add New Assignment - Bulk Selection */}
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 shadow-sm space-y-4">
              <div className="flex items-stretch gap-3">
                <div className="flex-1 relative">
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => handleStageTeacher(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium appearance-none min-h-[52px]"
                  >
                    <option value="">Sélectionner des enseignants...</option>
                    {availableTeachers
                      .filter(t => !teacherAssignments.some(a => a.teacherId === t.id) && !stagedTeacherIds.includes(t.id))
                      .map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName} ({teacher.subject})
                        </option>
                      ))}
                  </select>
                  <i className='bx bx-user-plus absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-xl'></i>
                </div>

                <button
                  type="button"
                  onClick={handleAssignTeacher}
                  disabled={stagedTeacherIds.length === 0 || isLoading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2 min-h-[52px] group"
                >
                  <i className='bx bxs-check-shield text-xl group-hover:scale-110 transition-transform'></i>
                  <span className="uppercase tracking-wider">Affecter {stagedTeacherIds.length > 0 ? `(${stagedTeacherIds.length})` : ''}</span>
                </button>
              </div>

              {/* Staged Teachers Tag Cloud */}
              {stagedTeacherIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100/50">
                  <p className="w-full text-[9px] font-black text-blue-400 uppercase tracking-tight mb-1">En attente d'affectation :</p>
                  {stagedTeacherIds.map(id => {
                    const teacher = availableTeachers.find(t => t.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 animate-in fade-in zoom-in duration-200">
                        <span className="text-xs font-bold">{teacher?.firstName} {teacher?.lastName}</span>
                        <button
                          type="button"
                          onClick={() => handleUnstageTeacher(id)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <i className='bx bx-x text-lg'></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all active:scale-95 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <i className='bx bx-loader-alt animate-spin'></i>
                Enregistrement...
              </>
            ) : (
              <>
                <i className='bx bxs-save text-lg'></i>
                Enregistrer la Classe
              </>
            )}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}} />
    </div>
  );
};

