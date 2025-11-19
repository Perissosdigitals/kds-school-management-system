import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, SchoolClass, Evaluation, Student, Grade } from '../types';
import { FilterSelect } from './ui/FilterControls';
import { getGradesData, GradesData } from '../services/api/grades.service';
import { LoadingSpinner } from './ui/LoadingSpinner';

const GradeRow = React.memo(({ student, grade, onGradeChange, maxScore }: { student: Student, grade: Grade, onGradeChange: (studentId: string, score: number | null, comment: string) => void, maxScore: number }) => {
    
    const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            onGradeChange(student.id, null, grade.comment);
            return;
        }
        const score = parseFloat(value);
        if (!isNaN(score) && score >= 0 && score <= maxScore) {
            onGradeChange(student.id, score, grade.comment);
        } else if (score > maxScore) {
            onGradeChange(student.id, maxScore, grade.comment);
        }
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onGradeChange(student.id, grade.score, e.target.value);
    };

    const scoreInputClass = useMemo(() => {
        if (grade.score === null) return "border-slate-300";
        const percentage = (grade.score / maxScore) * 100;
        if (percentage < 50) return "border-red-400 focus:border-red-600 focus:ring-red-600";
        if (percentage < 75) return "border-amber-400 focus:border-amber-600 focus:ring-amber-600";
        return "border-green-400 focus:border-green-600 focus:ring-green-600";
    }, [grade.score, maxScore]);
    
    return (
        <tr className="bg-white border-b hover:bg-slate-50">
            <td className="px-6 py-3 font-medium text-slate-800 whitespace-nowrap">
                {student.lastName} {student.firstName}
            </td>
            <td className="px-6 py-3">
                <div className="relative">
                    <input 
                        type="number"
                        value={grade.score ?? ''}
                        onChange={handleScoreChange}
                        placeholder="Note"
                        className={`w-24 text-center px-2 py-1.5 border-2 rounded-lg focus:outline-none focus:ring-1 transition ${scoreInputClass}`}
                        min="0"
                        max={maxScore}
                        step="0.5"
                    />
                    <span className="absolute right-20 text-slate-400">/ {maxScore}</span>
                </div>
            </td>
            <td className="px-6 py-3">
                 <input 
                    type="text"
                    value={grade.comment}
                    onChange={handleCommentChange}
                    placeholder="Ajouter un commentaire..."
                    className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
            </td>
        </tr>
    );
});


const GradesManagement: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [data, setData] = useState<GradesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [savedClassAverage, setSavedClassAverage] = useState<string | null>(null);
    const [localGrades, setLocalGrades] = useState<Grade[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const result = await getGradesData();
            setData(result);
            setLocalGrades(result.grades);
            setIsLoading(false);
        };
        loadData();
    }, []);
    
    const availableClasses = useMemo(() => {
        if (!data) return [];
        if (currentUser.role === 'Enseignant') {
            return data.classes.filter(c => c.teacherId === currentUser.id);
        }
        return data.classes;
    }, [currentUser, data]);
    
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    useEffect(() => {
        if (availableClasses.length > 0 && !selectedClassId) {
            setSelectedClassId(availableClasses[0].id);
        }
    }, [availableClasses, selectedClassId]);

    const evaluationsForClass = useMemo(() => {
        if (!data) return [];
        return data.evaluations.filter(e => e.classId === selectedClassId);
    }, [selectedClassId, data]);

    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');

    useEffect(() => {
        const firstEvalId = evaluationsForClass[0]?.id || '';
        setSelectedEvaluationId(firstEvalId);
        setSavedClassAverage(null); // Clear average on class change
    }, [selectedClassId, evaluationsForClass]);

    useEffect(() => {
      setSavedClassAverage(null); // Clear average on evaluation change
    }, [selectedEvaluationId]);

    const selectedEvaluation = useMemo(() => {
        return data?.evaluations.find(e => e.id === selectedEvaluationId);
    }, [selectedEvaluationId, data]);

    const studentsInClass = useMemo(() => {
        if (!data) return [];
        const classLevel = data.classes.find(c => c.id === selectedClassId)?.level;
        return data.students.filter(s => s.gradeLevel === classLevel);
    }, [selectedClassId, data]);

    const gradesForEvaluation = useMemo((): Record<string, Grade> => {
        if (!selectedEvaluationId) return {};
        const relevantGrades = localGrades.filter(g => g.evaluationId === selectedEvaluationId);
        
        const gradeMap: Record<string, Grade> = {};
        studentsInClass.forEach(student => {
            const existingGrade = relevantGrades.find(g => g.studentId === student.id);
            if(existingGrade) {
                gradeMap[student.id] = existingGrade;
            } else {
                gradeMap[student.id] = { studentId: student.id, evaluationId: selectedEvaluationId, score: null, comment: '' };
            }
        });
        return gradeMap;

    }, [selectedEvaluationId, studentsInClass, localGrades]);

    const handleGradeChange = useCallback((studentId: string, score: number | null, comment: string) => {
        if (!selectedEvaluationId) return;
        
        setLocalGrades(prevGrades => {
            const updatedGrades = prevGrades.filter(g => !(g.studentId === studentId && g.evaluationId === selectedEvaluationId));
            updatedGrades.push({ studentId, evaluationId: selectedEvaluationId, score, comment });
            return updatedGrades;
        });
        setIsSaved(false);
        setSavedClassAverage(null);

    }, [selectedEvaluationId]);
    
    const handleSaveGrades = useCallback(async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Saving grades:', Object.values(gradesForEvaluation));

        if (selectedEvaluation) {
            const gradedStudents = (Object.values(gradesForEvaluation) as Grade[]).filter(g => g.score !== null);
            if (gradedStudents.length > 0) {
                const totalScore = gradedStudents.reduce((sum, g) => sum + (g.score || 0), 0);
                const average = totalScore / gradedStudents.length;
                setSavedClassAverage(`${average.toFixed(2)} / ${selectedEvaluation.maxScore}`);
            } else {
                setSavedClassAverage('N/A');
            }
        }

        setIsSaving(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    }, [gradesForEvaluation, selectedEvaluation]);

    if (isLoading) return <LoadingSpinner />;
    if (!data) return <p>Erreur de chargement des données.</p>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Saisie des Notes</h2>
                <p className="text-gray-500">Sélectionnez une classe et une évaluation pour saisir ou modifier les notes.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
                    <div>
                        <label htmlFor="class-select" className="text-sm font-medium text-slate-600 block mb-1">Classe</label>
                        <FilterSelect id="class-select" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                            {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </FilterSelect>
                    </div>
                    <div>
                        <label htmlFor="eval-select" className="text-sm font-medium text-slate-600 block mb-1">Évaluation</label>
                        <FilterSelect id="eval-select" value={selectedEvaluationId} onChange={e => setSelectedEvaluationId(e.target.value)} disabled={evaluationsForClass.length === 0}>
                            {evaluationsForClass.length > 0 ? (
                                evaluationsForClass.map(e => <option key={e.id} value={e.id}>{e.title} ({e.subject})</option>)
                            ) : (
                                <option>Aucune évaluation pour cette classe</option>
                            )}
                        </FilterSelect>
                    </div>
                    <div className="flex items-end">
                        <button 
                          onClick={handleSaveGrades} 
                          disabled={isSaving || isSaved || !selectedEvaluationId}
                          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                          {isSaving && <i className='bx bx-loader-alt animate-spin'></i>}
                          {isSaved && <i className='bx bx-check-circle'></i>}
                          <span>{isSaving ? 'Sauvegarde...' : isSaved ? 'Enregistré !' : 'Enregistrer les Notes'}</span>
                        </button>
                    </div>
                </div>

                {selectedEvaluation ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nom de l'Élève</th>
                                        <th scope="col" className="px-6 py-3">Note</th>
                                        <th scope="col" className="px-6 py-3">Commentaire</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsInClass.map(student => (
                                        <GradeRow 
                                            key={student.id}
                                            student={student}
                                            grade={gradesForEvaluation[student.id]}
                                            onGradeChange={handleGradeChange}
                                            maxScore={selectedEvaluation.maxScore}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {savedClassAverage && (
                            <div className="mt-6 p-4 bg-slate-100 rounded-lg flex justify-end items-center border-t-4 border-blue-500">
                                <span className="font-bold text-slate-800 text-lg">Moyenne de la classe :</span>
                                <span className="ml-4 font-bold text-xl text-blue-700">{savedClassAverage}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <i className='bx bx-select-multiple text-4xl mb-2'></i>
                        <p>Veuillez sélectionner une classe et une évaluation pour commencer.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradesManagement;