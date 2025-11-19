import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Student, User, PedagogicalNote } from '../types';
import { getPedagogicalFileData, PedagogicalFileData, PedagogicalFileService } from '../services/api/pedagogicalFile.service';
import { getSubjectColor } from '../utils/colorUtils';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { PedagogicalNotesHistory } from './PedagogicalNotesHistory';

interface StudentPedagogicalFileProps {
  student: Student;
  currentUser: User;
  onBack: () => void;
}

const DetailCard: React.FC<{ icon: string; title: string; children: React.ReactNode; className?: string }> = ({ icon, title, children, className }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className={`bx ${icon}`}></i> {title}
        </h3>
        {children}
    </div>
);

const SubjectAverageBar: React.FC<{ subject: string; average: number; maxAverage: number }> = ({ subject, average, maxAverage }) => {
    const percentage = maxAverage > 0 ? (average / maxAverage) * 100 : 0;
    const color = getSubjectColor(subject);
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">{subject}</span>
                <span className="font-semibold text-slate-800">{average.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${color.bg}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export const StudentPedagogicalFile: React.FC<StudentPedagogicalFileProps> = ({ student, currentUser, onBack }) => {
    const [data, setData] = useState<PedagogicalFileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pedagogicalNotes, setPedagogicalNotes] = useState<PedagogicalNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteError, setNoteError] = useState<string | null>(null);
    const [noteSuccess, setNoteSuccess] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const result = await getPedagogicalFileData(student.id);
            setData(result);
            setPedagogicalNotes(result.pedagogicalNotes);
            setIsLoading(false);
        };
        loadData();
    }, [student.id]);

    const handleAddNote = useCallback(async () => {
        if (!newNote.trim()) {
            setNoteError('La note ne peut pas être vide');
            return;
        }

        setIsAddingNote(true);
        setNoteError(null);
        setNoteSuccess(null);

        try {
            console.log('StudentPedagogicalFile: Ajout d\'une note pédagogique...');
            const addedNote = await PedagogicalFileService.addPedagogicalNote(student.id, {
                teacherId: currentUser.id,
                teacherName: `${currentUser.firstName} ${currentUser.lastName}`,
                timestamp: new Date().toISOString(),
                note: newNote.trim(),
                studentId: student.id,
            });
            setPedagogicalNotes(prev => [addedNote, ...prev]);
            setNoteSuccess('Note ajoutée avec succès!');
            setNewNote('');
            setTimeout(() => setNoteSuccess(null), 3000);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la note:', error);
            setNoteError('Erreur lors de l\'ajout de la note. Veuillez réessayer.');
        } finally {
            setIsAddingNote(false);
        }
    }, [newNote, student.id, currentUser]);

    const maxSubjectAverage = useMemo(() => {
      if (!data) return 100;
      return Math.max(...data.academicData.averagePerSubject.map(s => s.average), 100)
    }, [data]);

    if (isLoading || !data) {
        return <LoadingSpinner />;
    }

    const { academicData, attendanceData, recentGrades } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
                    <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Fiche Pédagogique</h2>
                    <p className="text-gray-500">Élève: <span className="font-semibold">{student.firstName} {student.lastName}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DetailCard icon="bxs-bar-chart-alt-2" title="Performance Académique">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Moyenne Générale</p>
                                <p className="text-4xl font-bold text-blue-700">{academicData.overallAverage.toFixed(1)}%</p>
                            </div>
                            <div className="space-y-3">
                                {academicData.averagePerSubject.map(s => (
                                    <SubjectAverageBar key={s.subject} subject={s.subject} average={s.average} maxAverage={maxSubjectAverage} />
                                ))}
                                {academicData.averagePerSubject.length === 0 && <p className="text-sm text-gray-500 text-center">Aucune note disponible.</p>}
                            </div>
                        </div>
                    </DetailCard>
                    <DetailCard icon="bxs-pen" title="Dernières Notes">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-gray-500 bg-slate-50">
                                    <tr>
                                        <th className="p-2 font-semibold">Date</th>
                                        <th className="p-2 font-semibold">Évaluation</th>
                                        <th className="p-2 font-semibold text-right">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentGrades.map(g => (
                                        <tr key={g.evaluationInfo!.id} className="border-t">
                                            <td className="p-2">{g.evaluationInfo!.date}</td>
                                            <td className="p-2">
                                                <p className="font-medium text-slate-700">{g.evaluationInfo!.title}</p>
                                                <p className="text-xs text-gray-500">{g.evaluationInfo!.subject}</p>
                                            </td>
                                            <td className="p-2 text-right font-bold text-slate-800">{g.score !== null ? `${g.score} / ${g.evaluationInfo!.maxScore}` : 'ABS'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DetailCard>
                </div>
                <div className="space-y-6">
                    <DetailCard icon="bxs-calendar-check" title="Résumé des Présences">
                        <div className="flex justify-around text-center">
                            <div>
                                <p className="text-3xl font-bold text-red-600">{attendanceData.absences}</p>
                                <p className="text-sm text-gray-500">Absence{attendanceData.absences > 1 ? 's' : ''}</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-amber-500">{attendanceData.lates}</p>
                                <p className="text-sm text-gray-500">Retard{attendanceData.lates > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </DetailCard>
                </div>
            </div>
            
            <DetailCard icon="bxs-conversation" title="Notes Pédagogiques et Suivi">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Ajouter une nouvelle note</h4>
                        
                        {noteError && (
                            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {noteError}
                            </div>
                        )}
                        
                        {noteSuccess && (
                            <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                                {noteSuccess}
                            </div>
                        )}
                        
                        <textarea 
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            disabled={isAddingNote}
                            rows={5} 
                            placeholder="Ajouter une observation sur le comportement, les progrès, ou tout autre point pertinent..."
                            className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        ></textarea>
                        <button 
                            onClick={handleAddNote} 
                            disabled={isAddingNote}
                            className="w-full mt-2 bg-blue-700 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isAddingNote ? (
                                <>
                                    <i className='bx bx-loader-alt animate-spin'></i>
                                    <span>Enregistrement...</span>
                                </>
                            ) : (
                                <>
                                    <i className='bx bx-plus-circle'></i>
                                    <span>Enregistrer la note</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div>
                         <h4 className="font-semibold text-slate-700 mb-2">Historique des notes ({pedagogicalNotes.length})</h4>
                         <PedagogicalNotesHistory notes={pedagogicalNotes} />
                    </div>
                </div>
            </DetailCard>
        </div>
    );
};

export default StudentPedagogicalFile;