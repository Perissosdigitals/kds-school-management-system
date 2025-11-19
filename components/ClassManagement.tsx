import React, { useState, useMemo, useEffect } from 'react';
import type { User, Page, SchoolClass, Student, TimetableSession, Evaluation, Grade, Teacher } from '../types';
import { getClassesData, ClassDetailData, getSingleClassData, ClassesService } from '../services/api/classes.service';
import { getSubjectColor } from '../utils/colorUtils';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ClassEditForm } from './ClassEditForm';

// --- Detail View Components ---

const DetailCard: React.FC<{ icon: string; title: string; children: React.ReactNode; className?: string }> = ({ icon, title, children, className }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className={`bx ${icon}`}></i> {title}
        </h3>
        {children}
    </div>
);

const CompactTimetable: React.FC<{ sessions: TimetableSession[] }> = ({ sessions }) => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    return (
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
            {days.map(day => (
                <div key={day} className="font-bold text-slate-600">{day}</div>
            ))}
            {days.map(day => (
                <div key={day} className="bg-slate-50 rounded p-1 space-y-1 min-h-[60px]">
                    {sessions.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(session => (
                        <div key={session.id} className={`p-1 rounded ${getSubjectColor(session.subject).bg} ${getSubjectColor(session.subject).text}`} title={`${session.subject} (${session.startTime}-${session.endTime})`}>
                            {session.subject.substring(0,4)}...
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const RecentEvaluations: React.FC<{ evaluations: Evaluation[], grades: Grade[] }> = ({ evaluations, grades }) => {
     if (evaluations.length === 0) {
        return <p className="text-sm text-gray-500 text-center py-4">Aucune évaluation récente pour cette classe.</p>;
    }
    return (
        <div className="space-y-3">
            {evaluations.map(evaluation => {
                const relevantGrades = grades.filter(g => g.evaluationId === evaluation.id && g.score !== null);
                const average = relevantGrades.length > 0
                    ? relevantGrades.reduce((sum, g) => sum + g.score!, 0) / relevantGrades.length
                    : null;
                return (
                    <div key={evaluation.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                        <div>
                            <p className="font-semibold text-slate-700">{evaluation.title}</p>
                            <p className="text-xs text-gray-500">{evaluation.subject} - {evaluation.date}</p>
                        </div>
                        <div className="font-bold text-slate-800">
                            {average !== null ? `${average.toFixed(1)} / ${evaluation.maxScore}` : 'N/A'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// --- Main Views ---

const ClassDetailView: React.FC<{ 
    classId: string;
    onBack: () => void;
    setActivePage: (page: Page) => void;
}> = ({ classId, onBack, setActivePage }) => {
    
    const [classData, setClassData] = useState<ClassDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadClassData = async () => {
            setIsLoading(true);
            const data = await getSingleClassData(classId);
            setClassData(data);
            setIsLoading(false);
        };
        loadClassData();
    }, [classId]);

    if (isLoading || !classData) {
        return <LoadingSpinner />;
    }

    const { classInfo, students, teacher, timetable, evaluations, grades } = classData;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
                    <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Tableau de Bord: {classInfo.name}</h2>
                    <p className="text-gray-500">Enseignant Principal: {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Non assigné'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DetailCard icon="bxs-group" title={`Élèves Inscrits (${students.length})`}>
                         <div className="max-h-60 overflow-y-auto pr-2">
                             <ul className="divide-y divide-slate-100">
                                {students.map(s => (
                                    <li key={s.id} className="py-2 flex justify-between items-center">
                                        <span className="text-slate-800">{s.firstName} {s.lastName}</span>
                                        <span className="text-xs text-gray-500">{s.id}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </DetailCard>
                     <DetailCard icon="bxs-time-five" title="Emploi du Temps de la Semaine">
                        <CompactTimetable sessions={timetable} />
                    </DetailCard>
                </div>
                <div className="space-y-6">
                     <DetailCard icon="bxs-pen" title="Dernières Évaluations">
                        <RecentEvaluations evaluations={evaluations} grades={grades} />
                    </DetailCard>
                     <DetailCard icon="bxs-rocket" title="Actions Rapides">
                        <div className="space-y-2">
                             <button onClick={() => setActivePage('school-life')} className="w-full text-left flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-semibold">
                                <i className='bx bxs-calendar-check'></i> Feuille d'Appel
                            </button>
                             <button onClick={() => setActivePage('grades-management')} className="w-full text-left flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors font-semibold">
                                <i className='bx bxs-pen'></i> Saisie des Notes
                            </button>
                        </div>
                    </DetailCard>
                </div>
            </div>
        </div>
    );
};


const ClassListView: React.FC<{ 
    classes: SchoolClass[];
    teachers: Teacher[];
    students: Student[];
    onSelectClass: (id: string) => void;
    onEditClass: (cls: SchoolClass) => void;
    onDeleteClass: (cls: SchoolClass) => void;
    onCreateClass: () => void;
}> = ({ classes, teachers, students, onSelectClass, onEditClass, onDeleteClass, onCreateClass }) => {
    
    const findTeacherName = (id?: string) => {
        if (!id) return 'N/A';
        const teacher = teachers.find(t => t.id === id);
        return teacher ? `M/Mme ${teacher.lastName}` : 'Non assigné';
    };

    const countStudents = (level: string) => students.filter(s => s.gradeLevel === level).length;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Gestion des Classes</h2>
                    <p className="text-gray-500">Sélectionnez une classe pour voir son tableau de bord détaillé.</p>
                </div>
                <button
                    onClick={onCreateClass}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                    <i className='bx bx-plus-circle'></i>
                    <span>Nouvelle Classe</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                    <div 
                        key={cls.id}
                        className="bg-white p-6 rounded-xl shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg border-l-4 border-blue-600 relative group"
                    >
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditClass(cls);
                                }}
                                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                                title="Modifier"
                            >
                                <i className='bx bxs-edit text-lg'></i>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteClass(cls);
                                }}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors"
                                title="Supprimer"
                            >
                                <i className='bx bxs-trash text-lg'></i>
                            </button>
                        </div>
                        <div onClick={() => onSelectClass(cls.id)} className="cursor-pointer">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{cls.name}</h3>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p className="flex items-center gap-2"><i className='bx bxs-user-badge'></i> {findTeacherName(cls.teacherId)}</p>
                                <p className="flex items-center gap-2"><i className='bx bxs-group'></i> {countStudents(cls.level)} élèves</p>
                                {cls.room && <p className="flex items-center gap-2"><i className='bx bxs-door-open'></i> {cls.room}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const ClassManagement: React.FC<{ currentUser: User; setActivePage: (page: Page) => void; }> = ({ currentUser, setActivePage }) => {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{ classes: SchoolClass[], teachers: Teacher[], students: Student[] } | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit' | 'create'>('list');
    const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const result = await getClassesData();
        setData(result);
        setIsLoading(false);
    };

    const handleCreateClass = () => {
        setSelectedClass(null);
        setViewMode('create');
    };

    const handleEditClass = (cls: SchoolClass) => {
        setSelectedClass(cls);
        setViewMode('edit');
    };

    const handleDeleteClass = async (cls: SchoolClass) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe ${cls.name} ?`)) {
            try {
                await ClassesService.deleteClass(cls.id);
                alert('Classe supprimée avec succès !');
                loadData(); // Refresh
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression de la classe.');
            }
        }
    };

    const handleSaveClass = (updatedClass: SchoolClass) => {
        setViewMode('list');
        setSelectedClass(null);
        loadData(); // Refresh
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedClassId(null);
        setSelectedClass(null);
    };

    const availableClasses = useMemo(() => {
        if (!data) return [];
        if (currentUser.role === 'Enseignant') {
            return data.classes.filter(c => c.teacherId === currentUser.id);
        }
        return data.classes;
    }, [currentUser, data]);

    if (isLoading || !data) {
        return <LoadingSpinner />;
    }

    // Show edit form
    if (viewMode === 'edit' && selectedClass) {
        return <ClassEditForm schoolClass={selectedClass} onSave={handleSaveClass} onCancel={handleBack} />;
    }

    // Show create form (we need to update ClassEditForm to support create mode)
    if (viewMode === 'create') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="bg-white p-2 rounded-full shadow-md hover:bg-slate-100 transition-colors">
                        <i className='bx bx-arrow-back text-2xl text-slate-700'></i>
                    </button>
                    <h2 className="text-3xl font-bold text-slate-800">Créer une Nouvelle Classe</h2>
                </div>
                <ClassEditForm 
                    schoolClass={{
                        id: '',
                        name: '',
                        level: '',
                        teacherId: '',
                        capacity: 30,
                        room: '',
                        academicYear: '2024-2025'
                    } as SchoolClass} 
                    onSave={handleSaveClass} 
                    onCancel={handleBack} 
                />
            </div>
        );
    }

    // Show detail view
    if (viewMode === 'detail' && selectedClassId) {
        return <ClassDetailView classId={selectedClassId} onBack={handleBack} setActivePage={setActivePage} />;
    }

    // Show list view
    return (
        <ClassListView 
            classes={availableClasses} 
            teachers={data.teachers} 
            students={data.students} 
            onSelectClass={(id) => {
                setSelectedClassId(id);
                setViewMode('detail');
            }}
            onEditClass={handleEditClass}
            onDeleteClass={handleDeleteClass}
            onCreateClass={handleCreateClass}
        />
    );
};

export default ClassManagement;
