import React, { useState, useMemo, useEffect } from 'react';
import type { User, Page, SchoolClass, Student, TimetableSession, Evaluation, Grade, Teacher } from '../types';
import { getClassesData, ClassDetailData, getSingleClassData, ClassesService, ClassQueryParams } from '../services/api/classes.service';
import { getSubjectColor } from '../utils/colorUtils';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ClassEditForm } from './ClassEditForm';
import { ClassDetailView as NewClassDetailView } from './ClassDetailView';
import { TeachersService } from '../services/api/teachers.service';
import { StudentsService } from '../services/api/students.service';
import { Modal } from './ui/Modal';

// --- Types ---

interface ClassFilters {
    search: string;
    level: string;
    academicYear: string;
    mainTeacherId: string;
    isActive?: boolean;
}

// --- Statistics Component ---

const ClassStatistics: React.FC<{
    classes: SchoolClass[];
    students: Student[];
}> = ({ classes, students }) => {

    const stats = useMemo(() => {
        const totalClasses = classes.length;
        const totalCapacity = classes.reduce((sum, cls) => sum + (cls.capacity || 0), 0);
        const totalOccupancy = classes.reduce((sum, cls) => sum + (cls.currentOccupancy || 0), 0);
        const occupancyRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

        // Classes par niveau
        const byLevel = classes.reduce((acc, cls) => {
            acc[cls.level] = (acc[cls.level] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Classe la plus remplie
        const fullestClass = classes.reduce((max, cls) =>
            (cls.currentOccupancy || 0) > (max.currentOccupancy || 0) ? cls : max
            , classes[0]);

        return {
            totalClasses,
            totalCapacity,
            totalOccupancy,
            occupancyRate,
            byLevel,
            fullestClass
        };
    }, [classes, students]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium">Total Classes</p>
                        <p className="text-3xl font-bold mt-1">{stats.totalClasses}</p>
                    </div>
                    <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                        <i className='bx bxs-school text-3xl'></i>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100 text-sm font-medium">Capacité Totale</p>
                        <p className="text-3xl font-bold mt-1">{stats.totalCapacity}</p>
                        <p className="text-xs text-green-100 mt-1">élèves maximum</p>
                    </div>
                    <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                        <i className='bx bxs-user-plus text-3xl'></i>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-purple-100 text-sm font-medium">Occupation</p>
                        <p className="text-3xl font-bold mt-1">{stats.totalOccupancy}</p>
                        <p className="text-xs text-purple-100 mt-1">{stats.occupancyRate.toFixed(0)}% de remplissage</p>
                    </div>
                    <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                        <i className='bx bxs-group text-3xl'></i>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-orange-100 text-sm font-medium">Plus remplie</p>
                        <p className="text-lg font-bold mt-1 truncate">{stats.fullestClass?.name || 'N/A'}</p>
                        <p className="text-xs text-orange-100 mt-1">
                            {stats.fullestClass?.currentOccupancy || 0}/{stats.fullestClass?.capacity || 0} élèves
                        </p>
                    </div>
                    <div className="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                        <i className='bx bxs-trophy text-3xl'></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                    {sessions.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(session => (
                        <div key={session.id} className={`p-1 rounded ${getSubjectColor(session.subject).bg} ${getSubjectColor(session.subject).text}`} title={`${session.subject} (${session.startTime}-${session.endTime})`}>
                            {session.subject.substring(0, 4)}...
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

const ClassListView: React.FC<{
    classes: SchoolClass[];
    teachers: Teacher[];
    students: Student[];
    totalClasses: number;
    filters: ClassFilters;
    onFilterChange: (filters: ClassFilters) => void;
    onSelectClass: (id: string) => void;
    onEditClass: (cls: SchoolClass) => void;
    onDeleteClass: (cls: SchoolClass) => void;
    onCreateClass: () => void;
}> = ({ classes, teachers, students, totalClasses, filters, onFilterChange, onSelectClass, onEditClass, onDeleteClass, onCreateClass }) => {

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const findTeacherName = (id?: string) => {
        if (!id) return 'N/A';
        const teacher = teachers.find(t => t.id === id);
        return teacher ? `M/Mme ${teacher.lastName}` : 'Non assigné';
    };

    // Compter les élèves d'une classe spécifique
    const countClassStudents = (cls: SchoolClass) => {
        // Utiliser currentOccupancy si disponible, sinon compter les students
        if (cls.currentOccupancy !== undefined) {
            return cls.currentOccupancy;
        }
        // Si la classe a un tableau students, le compter
        if (Array.isArray((cls as any).students)) {
            return (cls as any).students.length;
        }
        // Fallback: compter les élèves du niveau dans la liste globale
        return students.filter(s => s.gradeLevel === cls.level).length;
    };

    // Compter les filtres actifs
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.level) count++;
        if (filters.academicYear) count++;
        if (filters.mainTeacherId) count++;
        if (filters.isActive !== undefined) count++;
        return count;
    }, [filters]);

    const resetFilters = () => {
        onFilterChange({
            search: '',
            level: '',
            academicYear: '',
            mainTeacherId: '',
            isActive: undefined
        });
    };

    const removeFilter = (key: keyof ClassFilters) => {
        onFilterChange({ ...filters, [key]: key === 'isActive' ? undefined : '' });
    };

    // Niveaux scolaires disponibles
    const availableLevels = useMemo(() => {
        return Array.from(new Set(classes.map(c => c.level))).sort();
    }, [classes]);

    // Années scolaires disponibles
    const availableAcademicYears = useMemo(() => {
        return Array.from(new Set(classes.map(c => c.academicYear))).sort().reverse();
    }, [classes]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Gestion des Classes</h2>
                    <p className="text-gray-500">
                        {classes.length} classe{classes.length > 1 ? 's' : ''} affichée{classes.length > 1 ? 's' : ''}
                        {totalClasses > classes.length && ` sur ${totalClasses} au total`}
                    </p>
                </div>
                <button
                    onClick={onCreateClass}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                    <i className='bx bx-plus-circle'></i>
                    <span>Nouvelle Classe</span>
                </button>
            </div>

            {/* Statistiques */}
            <ClassStatistics classes={classes} students={students} />

            {/* Barre de recherche et filtres */}
            <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <i className='bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl'></i>
                        <input
                            type="text"
                            placeholder="Rechercher par nom de classe..."
                            value={filters.search}
                            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${showAdvancedFilters
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <i className={`bx ${showAdvancedFilters ? 'bx-filter-alt' : 'bx-slider-alt'} text-xl`}></i>
                        <span className="font-semibold">Filtres</span>
                        {activeFiltersCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filtres avancés */}
                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className='bx bxs-graduation'></i> Niveau Scolaire
                            </label>
                            <select
                                value={filters.level}
                                onChange={(e) => onFilterChange({ ...filters, level: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tous les niveaux</option>
                                {availableLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className='bx bxs-calendar'></i> Année Scolaire
                            </label>
                            <select
                                value={filters.academicYear}
                                onChange={(e) => onFilterChange({ ...filters, academicYear: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Toutes les années</option>
                                {availableAcademicYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className='bx bxs-user-badge'></i> Enseignant Principal
                            </label>
                            <select
                                value={filters.mainTeacherId}
                                onChange={(e) => onFilterChange({ ...filters, mainTeacherId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tous les enseignants</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.firstName} {teacher.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className='bx bxs-check-circle'></i> Statut
                            </label>
                            <select
                                value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
                                onChange={(e) => onFilterChange({
                                    ...filters,
                                    isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="true">Actif</option>
                                <option value="false">Inactif</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Badges des filtres actifs */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
                        <span className="text-sm text-gray-600 font-semibold">Filtres actifs:</span>
                        {filters.search && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                <i className='bx bx-search'></i>
                                "{filters.search}"
                                <button onClick={() => removeFilter('search')} className="ml-1 hover:text-blue-600">
                                    <i className='bx bx-x text-lg'></i>
                                </button>
                            </span>
                        )}
                        {filters.level && (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                <i className='bx bxs-graduation'></i>
                                {filters.level}
                                <button onClick={() => removeFilter('level')} className="ml-1 hover:text-purple-600">
                                    <i className='bx bx-x text-lg'></i>
                                </button>
                            </span>
                        )}
                        {filters.academicYear && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                <i className='bx bxs-calendar'></i>
                                {filters.academicYear}
                                <button onClick={() => removeFilter('academicYear')} className="ml-1 hover:text-green-600">
                                    <i className='bx bx-x text-lg'></i>
                                </button>
                            </span>
                        )}
                        {filters.mainTeacherId && (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                                <i className='bx bxs-user-badge'></i>
                                {teachers.find(t => t.id === filters.mainTeacherId)?.lastName || 'Enseignant'}
                                <button onClick={() => removeFilter('mainTeacherId')} className="ml-1 hover:text-orange-600">
                                    <i className='bx bx-x text-lg'></i>
                                </button>
                            </span>
                        )}
                        {filters.isActive !== undefined && (
                            <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                                <i className='bx bxs-check-circle'></i>
                                {filters.isActive ? 'Actif' : 'Inactif'}
                                <button onClick={() => removeFilter('isActive')} className="ml-1 hover:text-teal-600">
                                    <i className='bx bx-x text-lg'></i>
                                </button>
                            </span>
                        )}
                        <button
                            onClick={resetFilters}
                            className="ml-auto text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                            <i className='bx bx-x-circle'></i>
                            Réinitialiser tout
                        </button>
                    </div>
                )}
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
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
                                {cls.registrationNumber && (
                                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                        {cls.registrationNumber}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p className="flex items-center gap-2"><i className='bx bxs-user-badge'></i> {findTeacherName(cls.teacherId)}</p>
                                <p className="flex items-center gap-2"><i className='bx bxs-group'></i> {countClassStudents(cls)} élèves</p>
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
    const [totalClasses, setTotalClasses] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit' | 'create'>('list');
    const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
    const [filters, setFilters] = useState<ClassFilters>({
        search: '',
        level: '',
        academicYear: '',
        mainTeacherId: '',
        isActive: undefined
    });

    useEffect(() => {
        loadData();
    }, [filters]); // Recharger quand les filtres changent

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Construire les paramètres de requête
            const params: ClassQueryParams = {};
            if (filters.search) params.search = filters.search;
            if (filters.level) params.level = filters.level;
            if (filters.academicYear) params.academicYear = filters.academicYear;
            if (filters.mainTeacherId) params.mainTeacherId = filters.mainTeacherId;
            if (filters.isActive !== undefined) params.isActive = filters.isActive;

            // Fetch all data in parallel
            const [classesResult, teachersResult, studentsResult] = await Promise.all([
                ClassesService.getClasses(params),
                TeachersService.getTeachers(),
                StudentsService.getStudents({ limit: 1000 })
            ]);

            setData({
                classes: classesResult.data,
                teachers: teachersResult,
                students: studentsResult
            });
            setTotalClasses(classesResult.total);
        } catch (error) {
            console.error('Erreur lors du chargement des classes:', error);
            // Fallback empty state
            setData({ classes: [], teachers: [], students: [] });
            setTotalClasses(0);
        }
        setIsLoading(false);
    };

    const handleFilterChange = (newFilters: ClassFilters) => {
        setFilters(newFilters);
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

    // Show detail view
    if (viewMode === 'detail' && selectedClassId) {
        return <NewClassDetailView classId={selectedClassId} onBack={handleBack} currentUser={currentUser} />;
    }

    // Show list view
    return (
        <>
            <ClassListView
                classes={availableClasses}
                teachers={data.teachers}
                students={data.students}
                totalClasses={totalClasses}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSelectClass={(id) => {
                    setSelectedClassId(id);
                    setSelectedClass(data.classes.find(c => c.id === id) || null);
                    setViewMode('detail');
                }}
                onEditClass={handleEditClass}
                onDeleteClass={handleDeleteClass}
                onCreateClass={handleCreateClass}
            />

            {/* Modal pour Création/Édition */}
            <Modal
                isOpen={viewMode === 'edit' || viewMode === 'create'}
                onClose={handleBack}
                title={viewMode === 'edit' ? 'Modifier la classe' : 'Créer une nouvelle classe'}
                size="md"
            >
                <ClassEditForm
                    schoolClass={selectedClass || {
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
            </Modal>
        </>
    );
};

export default ClassManagement;
