import React, { useState, useRef, useCallback } from 'react';
import type { Student, User } from '../types';
import { RelationalLink, RelationalCard } from './ui/RelationalLink';
import { StudentsService } from '../services/api/students.service';
import { config } from '../config';

interface StudentDetailProps {
  student: Student;
  onBack: () => void;
  onViewDocuments: (student: Student) => void;
  onViewPedagogicalFile: (student: Student) => void;
  onNavigateToTeacher?: (teacherId: string) => void;
  onNavigateToClass?: (classId: string) => void;
  onNavigateToTimetable?: () => void;
  onNavigateToGrades?: () => void;
  currentUser?: User;
}

const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-slate-800">{value || 'N/A'}</p>
  </div>
);

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-blue-700 mb-3 pb-2 border-b border-slate-200 uppercase tracking-wider text-sm">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);


export const StudentDetail: React.FC<StudentDetailProps> = ({
  student: initialStudent,
  onBack,
  onViewDocuments,
  onViewPedagogicalFile,
  onNavigateToTeacher,
  onNavigateToClass,
  onNavigateToTimetable,
  onNavigateToGrades,
  currentUser
}) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const updatedStudent = await StudentsService.uploadPhoto(student.id, file);
      setStudent(updatedStudent);
      alert("Photo mise à jour avec succès !");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload de la photo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [student.id]);

  const photoUrl = student.photoUrl
    ? (student.photoUrl.startsWith('http') ? student.photoUrl : `${config.API_URL.replace(/\/api\/v1$/, '')}${student.photoUrl}`)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
          <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
        </button>

        <div className="relative group">
          <div
            onClick={handlePhotoClick}
            className={`w-36 h-48 rounded-lg border-2 border-slate-200 shadow-sm overflow-hidden cursor-pointer bg-slate-50 flex items-center justify-center transition-all ${isUploading ? 'opacity-50' : 'hover:border-blue-400'}`}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Photo de l'élève" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <i className={`bx bxs-user text-6xl ${isUploading ? 'animate-pulse' : ''}`}></i>
                <span className="text-[10px] mt-2 font-bold tracking-wider uppercase">Photo Passport</span>
              </div>
            )}

            <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 flex items-center justify-center transition-all">
              <div className="bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <i className="bx bxs-camera text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-800">{student.firstName} {student.lastName}</h2>
          <p className="text-gray-500">
            Profil de l'élève -
            <span className="font-mono ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              {student.registrationNumber || 'ID non attribué'}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-end gap-3 mb-4">
          <button
            onClick={() => onViewPedagogicalFile(student)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <i className='bx bxs-user-detail'></i>
            <span>Voir la Fiche Pédagogique</span>
          </button>
        </div>

        <DetailSection title="Informations Personnelles">
          <DetailItem label="Matricule" value={student.registrationNumber} />
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
          <DetailItem label="Niveau Scolaire" value={student.class?.name || student.gradeLevel} />
          <DetailItem label="Établissement Antérieur" value={student.previousSchool} />
          <RelationalLink
            label="Classe"
            value={student.class?.name}
            onClick={student.classId && onNavigateToClass ? () => onNavigateToClass(student.classId!) : undefined}
            icon="bx-chalkboard"
          />
          <RelationalLink
            label="Enseignant Principal"
            value={student.teacher ? `${student.teacher.firstName} ${student.teacher.lastName}` : undefined}
            onClick={student.teacherId && onNavigateToTeacher ? () => onNavigateToTeacher(student.teacherId!) : undefined}
            icon="bx-user"
          />
        </DetailSection>

        <DetailSection title="Contact d'Urgence et Santé">
          <DetailItem label="Nom du Contact d'Urgence" value={student.emergencyContactName} />
          <DetailItem label="Téléphone d'Urgence" value={student.emergencyContactPhone} />
          <DetailItem label="Informations Médicales" value={student.medicalInfo} />
        </DetailSection>


        {/* Relational Navigation Cards */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Accès Rapide aux Données Associées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={onNavigateToTimetable}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <i className='bx bx-calendar text-3xl text-blue-600 group-hover:scale-110 transition-transform'></i>
                <div className="text-left">
                  <p className="font-semibold text-blue-900">Emploi du Temps</p>
                  <p className="text-xs text-blue-700">Voir le planning</p>
                </div>
              </div>
            </button>

            <button
              onClick={onNavigateToGrades}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <i className='bx bx-bar-chart text-3xl text-green-600 group-hover:scale-110 transition-transform'></i>
                <div className="text-left">
                  <p className="font-semibold text-green-900">Notes & Évaluations</p>
                  <p className="text-xs text-green-700">Consulter les résultats</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onViewPedagogicalFile(student)}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <i className='bx bxs-user-detail text-3xl text-purple-600 group-hover:scale-110 transition-transform'></i>
                <div className="text-left">
                  <p className="font-semibold text-purple-900">Fiche Pédagogique</p>
                  <p className="text-xs text-purple-700">Notes des enseignants</p>
                </div>
              </div>
            </button>

            {(['fondatrice', 'directrice', 'agent_admin', 'admin', 'ADMIN'].includes(currentUser?.role || '')) && (
              <button
                onClick={() => onViewDocuments(initialStudent)}
                className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <i className='bx bxs-file-doc text-3xl text-amber-600 group-hover:scale-110 transition-transform'></i>
                  <div className="text-left">
                    <p className="font-semibold text-amber-900">Documents</p>
                    <p className="text-xs text-amber-700">Gérer les fichiers</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Show attendance records if available */}
        {
          student.attendanceRecords && student.attendanceRecords.length > 0 && (
            <div className="mt-6">
              <RelationalCard
                title="Historique d'Absences/Retards"
                icon="bx-time"
                items={student.attendanceRecords.map(record => ({
                  id: record.id,
                  label: `${record.status} - ${record.date}`,
                  sublabel: record.studentId
                }))}
                emptyMessage="Aucun retard ou absence enregistré"
              />
            </div>
          )
        }
      </div >
    </div >
  );
};