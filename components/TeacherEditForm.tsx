import React, { useState, useEffect } from 'react';
import type { Teacher, SchoolClass, TeacherClassAssignment } from '../types';
import { TeachersService } from '../services/api/teachers.service';
import { ClassesService, assignTeacherToClass, removeTeacherFromClass, getClassTeachers } from '../services/api/classes.service';

interface TeacherEditFormProps {
  teacher: Teacher;
  onSave: (updatedTeacher: Teacher) => void;
  onCancel: () => void;
}

export const TeacherEditForm: React.FC<TeacherEditFormProps> = ({ teacher, onSave, onCancel }) => {
  const [formData, setFormData] = useState(teacher);
  const [isLoading, setIsLoading] = useState(false); // Teacher assignment state
  const [availableClasses, setAvailableClasses] = useState<SchoolClass[]>([]);
  const [classAssignments, setClassAssignments] = useState<TeacherClassAssignment[]>(
    teacher.classAssignments || []
  );
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [stagedClassIds, setStagedClassIds] = useState<string[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await ClassesService.getClasses();
        setAvailableClasses(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des classes:', err);
      }
    };

    const fetchAssignments = async () => {
      if (!teacher.id || teacher.id === '') return;
      try {
        const fullTeacher = await TeachersService.getTeacherById(teacher.id);
        if (fullTeacher && fullTeacher.classAssignments) {
          setClassAssignments(fullTeacher.classAssignments);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des affectations:', err);
      }
    };

    fetchClasses();
    fetchAssignments();
  }, [teacher.id]);

  const isCreateMode = !teacher.id || teacher.id === '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Teacher assignment handlers
  const handleStageClass = (classId: string) => {
    if (!classId || stagedClassIds.includes(classId)) return;
    setStagedClassIds(prev => [...prev, classId]);
    setSelectedClassId('');
  };

  const handleUnstageClass = (classId: string) => {
    setStagedClassIds(prev => prev.filter(id => id !== classId));
  };

  const handleAssignClass = async () => {
    if (stagedClassIds.length === 0 || !teacher?.id) return;

    setIsLoading(true);
    try {
      const results = await Promise.all(
        stagedClassIds.map(classId => assignTeacherToClass(classId, teacher.id!, 'other'))
      );

      setClassAssignments(prev => [...prev, ...results]);
      setStagedClassIds([]);
      setSuccessMessage(`${stagedClassIds.length} classe(s) affectée(s) avec succès!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error assigning classes:', err);
      setError('Erreur lors de l\'affectation des classes');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveClass = async (classId: string) => {
    if (!teacher.id) return;

    try {
      await removeTeacherFromClass(classId, teacher.id);
      setClassAssignments(prev => prev.filter(a => a.classId !== classId));
      setSuccessMessage('Classe retirée avec succès!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error removing class:', err);
      setError('Erreur lors du retrait de la classe');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isCreateMode) {
        console.log('TeacherEditForm: Création d\'un nouvel enseignant...', formData);
        const newTeacher = await TeachersService.createTeacher(formData);
        setSuccessMessage('Enseignant créé avec succès!');
        setTimeout(() => {
          onSave(newTeacher);
        }, 1500);
      } else {
        console.log('TeacherEditForm: Mise à jour de l\'enseignant...', formData);
        const updatedTeacher = await TeachersService.updateTeacher(teacher.id, formData);
        setSuccessMessage('Enseignant mis à jour avec succès!');
        setTimeout(() => {
          onSave(updatedTeacher);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      const apiErrorMessage = err.response?.data?.message;
      const displayMessage = Array.isArray(apiErrorMessage)
        ? apiErrorMessage.join(', ')
        : apiErrorMessage || `Erreur lors de ${isCreateMode ? 'la création' : 'la mise à jour'} de l'enseignant. Veuillez réessayer.`;
      setError(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {isCreateMode ? 'Nouvel Enseignant' : 'Modifier le Profil'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">Gérez les informations détaillées du professeur</p>
        </div>
        <button
          onClick={onCancel}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <i className='bx bx-x text-2xl'></i>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-shake flex items-center gap-3">
          <i className='bx bx-error-circle text-2xl'></i>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-bounce-subtle flex items-center gap-3">
          <i className='bx bx-check-circle text-2xl'></i>
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* SECTION 1: IDENTITÉ & CONTACT */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className='bx bxs-user-badge text-xl'></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none">Identité & Contact</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Informations de base et coordonnées</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Personnel</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse de Résidence</label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  placeholder="Quartier, Rue, Porte..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
                />
                <i className='bx bx-map absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'></i>
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact d'Urgence</label>
              <div className="relative">
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact || ''}
                  onChange={handleInputChange}
                  placeholder="Nom & Téléphone du proche..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
                />
                <i className='bx bx-phone-call absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'></i>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PARCOURS PROFESSIONNEL (DOSSIER DE STAGE) */}
        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className='bx bxs-file-doc text-xl'></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none">Dossier de Stage & Carrière</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Parcours, Diplômes et Spécialisation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matricule</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber || ''}
                readOnly
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-500 cursor-not-allowed"
                placeholder="Auto-génééré"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date d'Embauche</label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spécialisation</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization || ''}
                onChange={handleInputChange}
                placeholder="Ex: Pédagogie active, FLE..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualifications & Diplômes</label>
              <textarea
                name="qualifications"
                value={formData.qualifications || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                rows={3}
                placeholder="Détaillez le cursus académique et les certifications professionnelles..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: EXPERTISE & AFFECTATIONS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <i className='bx bxs-graduation text-xl'></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none">Expertise & Affectations</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Gestion des classes et matières</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matière Principale</label>
                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Ex: Mathématiques"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700"
                  />
                  <i className='bx bxs-book-bookmark absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500'></i>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut du Profil</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                >
                  <option value="Actif">✓ Actif</option>
                  <option value="Inactif">✕ Inactif</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classes Affectées (Multi-sélection)</label>

              {!isCreateMode ? (
                <div className="space-y-6">
                  {/* Selection & Staging Area */}
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 shadow-sm space-y-4">
                    <div className="flex items-stretch gap-3">
                      <div className="flex-1 relative">
                        <select
                          value={selectedClassId}
                          onChange={(e) => handleStageClass(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold appearance-none min-h-[52px]"
                        >
                          <option value="">Sélectionner des classes...</option>
                          {availableClasses
                            .filter(c => !classAssignments.some(a => a.classId === c.id) && !stagedClassIds.includes(c.id))
                            .map(cls => (
                              <option key={cls.id} value={cls.id}>
                                {cls.name} ({cls.level})
                              </option>
                            ))}
                        </select>
                        <i className='bx bx-buildings absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-xl'></i>
                      </div>

                      <button
                        type="button"
                        onClick={handleAssignClass}
                        disabled={stagedClassIds.length === 0 || isLoading}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2 min-h-[52px] group"
                      >
                        <i className='bx bxs-check-shield text-xl group-hover:scale-110 transition-transform'></i>
                        <span className="uppercase tracking-wider">Affecter {stagedClassIds.length > 0 ? `(${stagedClassIds.length})` : ''}</span>
                      </button>
                    </div>

                    {/* Staged Classes View */}
                    {stagedClassIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100/50">
                        <p className="w-full text-[9px] font-black text-blue-400 uppercase tracking-tighter mb-1">Prêt pour affectation :</p>
                        {stagedClassIds.map(id => {
                          const cls = availableClasses.find(c => c.id === id);
                          return (
                            <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/50 text-blue-700 rounded-lg border border-blue-200 animate-in fade-in zoom-in duration-200">
                              <span className="text-xs font-bold">{cls?.name}</span>
                              <button
                                type="button"
                                onClick={() => handleUnstageClass(id)}
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

                  {/* Assigned Classes Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classAssignments.length > 0 ? (
                      classAssignments.map(assignment => {
                        // Enrich assignment with class details if missing
                        const clsInfo = assignment.class || availableClasses.find(c => c.id === assignment.classId);

                        return (
                          <div key={assignment.id} className="group flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all hover:shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                                {clsInfo?.name.substring(0, 2).toUpperCase() || 'CL'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{clsInfo?.name || 'Classe'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{clsInfo?.level || 'Niveau'}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveClass(assignment.classId)}
                              className="text-slate-300 hover:text-red-500 p-2 rounded-lg transition-colors"
                              title="Retirer"
                            >
                              <i className='bx bx-x text-2xl'></i>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <i className='bx bx-建物 text-4xl text-slate-200 mb-2'></i>
                        <p className="text-sm text-slate-400 font-medium italic">Aucune classe affectée</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                    <i className='bx bxs-lock-alt text-2xl'></i>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Affectation Requise après Création</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto italic">Veuillez d'abord enregistrer le profil pour pouvoir affecter des classes.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
          >
            {isLoading ? (
              <><i className='bx bx-loader-alt animate-spin'></i> Enregistrement...</>
            ) : (
              <><i className='bx bxs-save text-xl'></i> Valider le Dossier Professionnel</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
