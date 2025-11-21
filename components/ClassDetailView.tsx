import React, { useState, useEffect, useMemo } from 'react';
import type { SchoolClass, Student, Teacher, TimetableSession } from '../types';
import { ClassesService } from '../services/api/classes.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { StudentRegistrationForm } from './StudentRegistrationForm';
import { StudentDetail } from './StudentDetail';
import { ClassEditForm } from './ClassEditForm';

interface ClassDetailViewProps {
    classId: string;
    onBack: () => void;
}

type TabType = 'overview' | 'students' | 'attendance' | 'timetable' | 'statistics' | 'grades';

export const ClassDetailView: React.FC<ClassDetailViewProps> = ({ classId, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [classData, setClassData] = useState<SchoolClass | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [timetable, setTimetable] = useState<TimetableSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        loadClassDetails();
    }, [classId]);

    const loadClassDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Charger les détails complets de la classe
            const fullClassData = await ClassesService.getClassById(classId);
            
            if (!fullClassData) {
                setError('Classe introuvable');
                return;
            }

            // Extraire les données
            setClassData(fullClassData.classInfo);
            setStudents(fullClassData.students || []);
            setTeacher(fullClassData.teacher || null);
            setTimetable(fullClassData.timetable || []);
            
            console.log('📅 EMPLOI DU TEMPS chargé:', fullClassData.timetable?.length || 0, 'sessions');
            if (fullClassData.timetable && fullClassData.timetable.length > 0) {
                console.log('📚 Exemple session:', fullClassData.timetable[0]);
            }

        } catch (err) {
            console.error('Error loading class details:', err);
            setError('Erreur lors du chargement des détails de la classe');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !classData) {
        return (
            <div className="text-center py-12">
                <i className='bx bx-error-circle text-6xl text-red-500 mb-4'></i>
                <p className="text-gray-600 mb-4">{error || 'Classe introuvable'}</p>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retour aux classes
                </button>
            </div>
        );
    }

    const occupancyPercentage = classData.capacity 
        ? Math.round((classData.currentOccupancy / classData.capacity) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <i className='bx bx-arrow-back text-xl'></i>
                        <span>Retour</span>
                    </button>
                    <button 
                        onClick={() => setShowEditForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <i className='bx bx-edit'></i>
                        Modifier
                    </button>
                </div>

                <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <i className='bx bxs-school text-4xl text-white'></i>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {classData.level}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <i className='bx bxs-user text-green-600 text-xl'></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Enseignant principal</p>
                                    <p className="font-semibold text-gray-900">
                                        {classData.teacherName || 'Non assigné'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <i className='bx bxs-group text-purple-600 text-xl'></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Effectif</p>
                                    <p className="font-semibold text-gray-900">
                                        {classData.currentOccupancy}/{classData.capacity} élèves
                                        <span className="text-xs text-gray-500 ml-2">({occupancyPercentage}%)</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <i className='bx bxs-door-open text-orange-600 text-xl'></i>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Salle</p>
                                    <p className="font-semibold text-gray-900">
                                        {classData.room || 'Non définie'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <i className='bx bx-calendar'></i>
                                Année académique: <strong>{classData.academicYear}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className='bx bx-info-circle mr-2'></i>
                            Vue d'ensemble
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'students'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className='bx bx-group mr-2'></i>
                            Élèves ({students.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'attendance'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className='bx bx-calendar-check mr-2'></i>
                            Présences
                        </button>
                        <button
                            onClick={() => setActiveTab('timetable')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'timetable'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className='bx bx-time-five mr-2'></i>
                            Emploi du temps
                        </button>
                        <button
                            onClick={() => setActiveTab('statistics')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'statistics'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className='bx bx-bar-chart mr-2'></i>
                            Statistiques
                        </button>
                        <button
                            onClick={() => setActiveTab('grades')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'grades'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className='bx bx-trophy mr-2'></i>
                            Notes
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && <OverviewTab classData={classData} teacher={teacher} students={students} />}
                    {activeTab === 'students' && (
                        <StudentsTab 
                            students={students} 
                            classData={classData}
                            onAddStudent={() => setShowStudentForm(true)}
                            onStudentAdded={loadClassDetails}
                            onStudentClick={(student) => setSelectedStudent(student)}
                        />
                    )}
                    {activeTab === 'attendance' && (
                        <AttendanceTab 
                            students={students}
                            classData={classData}
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            onStudentClick={(student) => setSelectedStudent(student)}
                        />
                    )}
                    {activeTab === 'timetable' && <TimetableTab timetable={timetable} />}
                    {activeTab === 'statistics' && <StatisticsTab students={students} classData={classData} />}
                    {activeTab === 'grades' && <GradesTab students={students} classData={classData} timetable={timetable} />}
                </div>
            </div>

            {/* Modal pour ajouter un élève */}
            {showStudentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                <i className='bx bx-user-plus mr-2'></i>
                                Ajouter un élève à {classData?.name}
                            </h2>
                            <button
                                onClick={() => setShowStudentForm(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className='bx bx-x text-2xl'></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <StudentRegistrationForm
                                onSuccess={(newStudent) => {
                                    setShowStudentForm(false);
                                    loadClassDetails(); // Recharger les données
                                }}
                                onCancel={() => setShowStudentForm(false)}
                                prefilledClassId={classId}
                                prefilledGradeLevel={classData?.level}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour afficher la fiche élève */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedStudent.studentCode} • {classData?.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className='bx bx-x text-2xl'></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <StudentDetail 
                                student={selectedStudent} 
                                onClose={() => setSelectedStudent(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour éditer la classe */}
            {showEditForm && classData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <ClassEditForm
                            schoolClass={classData}
                            onSave={() => {
                                setShowEditForm(false);
                                loadClassDetails();
                            }}
                            onCancel={() => setShowEditForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Tab Components ---

const OverviewTab: React.FC<{ 
    classData: SchoolClass; 
    teacher: Teacher | null;
    students: Student[];
}> = ({ classData, teacher, students }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations générales */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className='bx bx-info-circle text-blue-600'></i>
                        Informations générales
                    </h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm text-gray-500">Nom de la classe</dt>
                            <dd className="text-sm font-medium text-gray-900">{classData.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Niveau</dt>
                            <dd className="text-sm font-medium text-gray-900">{classData.level}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Année académique</dt>
                            <dd className="text-sm font-medium text-gray-900">{classData.academicYear}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Salle de classe</dt>
                            <dd className="text-sm font-medium text-gray-900">{classData.room || 'Non définie'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Capacité maximale</dt>
                            <dd className="text-sm font-medium text-gray-900">{classData.capacity} élèves</dd>
                        </div>
                    </dl>
                </div>

                {/* Enseignant principal */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className='bx bx-user text-green-600'></i>
                        Enseignant principal
                    </h3>
                    {teacher ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {teacher.firstName} {teacher.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{teacher.subject}</p>
                                </div>
                            </div>
                            <dl className="space-y-2 mt-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Email</dt>
                                    <dd className="text-sm font-medium text-gray-900">{teacher.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Téléphone</dt>
                                    <dd className="text-sm font-medium text-gray-900">{teacher.phone}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Statut</dt>
                                    <dd>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            teacher.status === 'Actif' 
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {teacher.status}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <i className='bx bx-user-x text-4xl mb-2'></i>
                            <p>Aucun enseignant assigné</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Effectif rapide */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Effectif de la classe</h3>
                <div className="flex items-center gap-8">
                    <div className="flex-1">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        Taux de remplissage
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        {Math.round((classData.currentOccupancy / classData.capacity) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                                <div
                                    style={{ width: `${(classData.currentOccupancy / classData.capacity) * 100}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">{classData.currentOccupancy}</p>
                            <p className="text-sm text-gray-600">Élèves inscrits</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-400">{classData.capacity - classData.currentOccupancy}</p>
                            <p className="text-sm text-gray-600">Places disponibles</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentsTab: React.FC<{ 
    students: Student[]; 
    classData: SchoolClass;
    onAddStudent: () => void;
    onStudentAdded: () => void;
    onStudentClick: (student: Student) => void;
}> = ({ students, classData, onAddStudent, onStudentClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'code' | 'enrollment'>('name');
    const [viewMode, setViewMode] = useState<'list' | 'seating'>('list');
    const [seatingArrangement, setSeatingArrangement] = useState<(Student | null)[][]>([]);
    const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Utility functions for export
    const generateStudentCSV = (studentsToExport: Student[]): string => {
        const headers = ['ID', 'Nom', 'Prénom', 'Genre', 'Date naissance', 'Date inscription', 'Niveau', 'Statut'];
        const rows = studentsToExport.map(s => {
            // Calculate age from dob
            const age = s.dob ? new Date().getFullYear() - new Date(s.dob).getFullYear() : '';
            return [
                s.id || '',
                s.lastName || '',
                s.firstName || '',
                s.gender || '',
                s.dob || '',
                s.registrationDate || '',
                s.gradeLevel || '',
                s.status || 'Actif'
            ];
        });
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csvContent;
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedStudents.size === filteredAndSortedStudents.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(filteredAndSortedStudents.map(s => s.id)));
        }
    };

    // Initialiser le plan de classe (5 rangées x 6 colonnes = 30 places)
    React.useEffect(() => {
        if (seatingArrangement.length === 0 && students.length > 0) {
            const rows = 5;
            const cols = 6;
            const arrangement: (Student | null)[][] = [];
            
            for (let i = 0; i < rows; i++) {
                const row: (Student | null)[] = [];
                for (let j = 0; j < cols; j++) {
                    const studentIndex = i * cols + j;
                    row.push(studentIndex < students.length ? students[studentIndex] : null);
                }
                arrangement.push(row);
            }
            
            setSeatingArrangement(arrangement);
        }
    }, [students]);

    // Handlers pour drag & drop
    const handleDragStart = (student: Student) => {
        setDraggedStudent(student);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (rowIndex: number, colIndex: number) => {
        if (!draggedStudent) return;

        const newArrangement = seatingArrangement.map(row => [...row]);
        
        // Trouver la position actuelle de l'élève
        let currentRow = -1;
        let currentCol = -1;
        
        for (let i = 0; i < newArrangement.length; i++) {
            for (let j = 0; j < newArrangement[i].length; j++) {
                if (newArrangement[i][j]?.id === draggedStudent.id) {
                    currentRow = i;
                    currentCol = j;
                    break;
                }
            }
            if (currentRow !== -1) break;
        }

        // Échanger les positions
        if (currentRow !== -1 && currentCol !== -1) {
            const temp = newArrangement[rowIndex][colIndex];
            newArrangement[rowIndex][colIndex] = draggedStudent;
            newArrangement[currentRow][currentCol] = temp;
        } else {
            // L'élève n'était pas encore placé
            newArrangement[rowIndex][colIndex] = draggedStudent;
        }

        setSeatingArrangement(newArrangement);
        setDraggedStudent(null);
    };

    const resetSeating = () => {
        setSeatingArrangement([]);
    };

    const filteredAndSortedStudents = useMemo(() => {
        let filtered = students.filter(student => 
            student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
                case 'code':
                    return (a.studentCode || '').localeCompare(b.studentCode || '');
                case 'enrollment':
                    return new Date(b.enrollmentDate || 0).getTime() - new Date(a.enrollmentDate || 0).getTime();
                default:
                    return 0;
            }
        });
    }, [students, searchTerm, sortBy]);

    if (students.length === 0) {
        return (
            <div className="text-center py-12">
                <i className='bx bx-user-x text-6xl text-gray-300 mb-4'></i>
                <p className="text-gray-500 mb-4">Aucun élève inscrit dans cette classe</p>
                <button 
                    onClick={onAddStudent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <i className='bx bx-plus mr-2'></i>
                    Ajouter des élèves
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* En-tête avec bouton d'ajout */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <i className='bx bx-group text-2xl text-blue-600'></i>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Liste des élèves ({students.length})
                        </h3>
                        <p className="text-sm text-gray-500">
                            {classData.capacity - classData.currentOccupancy} place(s) disponible(s)
                            {selectedStudents.size > 0 && ` • ${selectedStudents.size} sélectionné(s)`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedStudents.size > 0 && (
                        <div className="flex items-center gap-2 mr-2 border-r pr-4">
                            <button
                                onClick={() => {
                                    const csv = generateStudentCSV(students.filter(s => selectedStudents.has(s.id)));
                                    downloadFile(csv, `eleves_${classData.name}_selection.csv`, 'text/csv');
                                }}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm font-medium"
                                title="Exporter la sélection"
                            >
                                <i className='bx bx-download'></i>
                                Exporter
                            </button>
                            <button
                                onClick={() => {
                                    window.print();
                                }}
                                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm font-medium"
                                title="Imprimer la sélection"
                            >
                                <i className='bx bx-printer'></i>
                                Imprimer
                            </button>
                            <button
                                onClick={() => setSelectedStudents(new Set())}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
                                title="Désélectionner tout"
                            >
                                <i className='bx bx-x'></i>
                                Annuler
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            const csv = generateStudentCSV(students);
                            downloadFile(csv, `eleves_${classData.name}.csv`, 'text/csv');
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
                        title="Exporter tous les élèves"
                    >
                        <i className='bx bx-export'></i>
                        Tout exporter
                    </button>
                    <button
                        onClick={onAddStudent}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <i className='bx bx-user-plus'></i>
                        Ajouter un élève
                    </button>
                </div>
            </div>

            {/* Barre d'outils */}
            <div className="flex gap-4 items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <i className='bx bx-list-ul mr-2'></i>
                        Liste
                    </button>
                    <button
                        onClick={() => setViewMode('seating')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'seating'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <i className='bx bx-grid-alt mr-2'></i>
                        Plan de classe
                    </button>
                </div>
                
                {viewMode === 'seating' && (
                    <button
                        onClick={resetSeating}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium"
                    >
                        <i className='bx bx-reset mr-2'></i>
                        Réinitialiser
                    </button>
                )}
            </div>

            {/* Vue Liste */}
            {viewMode === 'list' && (
                <>
                    {/* Filtres et recherche */}
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedStudents.size === filteredAndSortedStudents.length && filteredAndSortedStudents.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                title="Tout sélectionner / Tout désélectionner"
                            />
                            <label className="text-sm text-gray-700 font-medium cursor-pointer" onClick={toggleSelectAll}>
                                Tout sélectionner
                            </label>
                        </div>
                        <div className="flex-1 relative">
                            <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
                            <input
                                type="text"
                                placeholder="Rechercher un élève..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="name">Trier par nom</option>
                            <option value="code">Trier par ID</option>
                            <option value="enrollment">Trier par inscription</option>
                        </select>
                    </div>

                    {/* Liste des élèves */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedStudents.map((student) => {
                            const isSelected = selectedStudents.has(student.id);
                            const studentAge = student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() : null;
                            
                            return (
                                <div 
                                    key={student.id} 
                                    className={`bg-white border-2 rounded-lg p-4 hover:shadow-md transition-all ${
                                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleStudentSelection(student.id);
                                            }}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
                                            title="Sélectionner cet élève"
                                        />
                                        <div 
                                            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 cursor-pointer"
                                            onClick={() => onStudentClick(student)}
                                        >
                                            {student.firstName?.[0]}{student.lastName?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onStudentClick(student)}>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                                                    {student.firstName} {student.lastName}
                                                </p>
                                                <i className='bx bx-link-external text-blue-500 text-sm'></i>
                                            </div>
                                            <p className="text-xs text-gray-500">{student.id.substring(0, 8)}...</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    student.gender === 'M' || student.gender === 'Masculin' || student.gender === 'male'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-pink-100 text-pink-700'
                                                }`}>
                                                    {student.gender === 'M' || student.gender === 'Masculin' || student.gender === 'male' ? 'Garçon' : 'Fille'}
                                                </span>
                                                {studentAge && (
                                                    <span className="text-xs text-gray-500">{studentAge} ans</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredAndSortedStudents.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <i className='bx bx-search-alt text-4xl mb-2'></i>
                            <p>Aucun élève trouvé</p>
                        </div>
                    )}
                </>
            )}

            {/* Vue Plan de Classe */}
            {viewMode === 'seating' && (
                <div className="space-y-6">
                    {/* Légende */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <i className='bx bx-info-circle text-blue-600 text-xl'></i>
                            <p className="font-semibold text-blue-900">Instructions</p>
                        </div>
                        <div className="space-y-1 text-sm text-blue-800">
                            <p>• <strong>Glissez-déposez</strong> les élèves pour organiser la disposition de la classe</p>
                            <p>• <strong>Double-cliquez</strong> sur un élève pour voir sa fiche complète</p>
                            <p>• Cliquez sur <strong>"Réinitialiser"</strong> pour revenir à la disposition initiale</p>
                        </div>
                    </div>

                    {/* Tableau d'enseignant */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg shadow-md">
                            <i className='bx bxs-chalkboard mr-2'></i>
                            <span className="font-semibold">Tableau</span>
                        </div>
                    </div>

                    {/* Grille de places */}
                    <div className="space-y-3">
                        {seatingArrangement.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-3 justify-center">
                                {row.map((student, colIndex) => (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`
                                            w-32 h-32 rounded-lg border-2 border-dashed
                                            flex flex-col items-center justify-center
                                            transition-all duration-200
                                            ${student 
                                                ? 'bg-white border-blue-300 shadow-sm hover:shadow-md cursor-move' 
                                                : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                            }
                                        `}
                                        draggable={!!student}
                                        onDragStart={() => student && handleDragStart(student)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(rowIndex, colIndex)}
                                        onDoubleClick={() => student && onStudentClick(student)}
                                        title={student ? `Double-cliquez pour voir la fiche de ${student.firstName} ${student.lastName}` : ''}
                                    >
                                        {student ? (
                                            <>
                                                <div className={`
                                                    w-12 h-12 rounded-full flex items-center justify-center
                                                    text-white font-bold text-sm mb-2
                                                    ${student.gender === 'M' || student.gender === 'Masculin' || student.gender === 'male'
                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                        : 'bg-gradient-to-br from-pink-500 to-pink-600'
                                                    }
                                                `}>
                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                </div>
                                                <p className="text-xs font-semibold text-gray-900 text-center px-1 truncate w-full">
                                                    {student.firstName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate w-full text-center px-1">
                                                    {student.lastName}
                                                </p>
                                            </>
                                        ) : (
                                            <div className="text-gray-400">
                                                <i className='bx bx-user-plus text-3xl'></i>
                                                <p className="text-xs mt-1">Place vide</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {seatingArrangement.flat().filter(s => s !== null).length}
                            </p>
                            <p className="text-sm text-gray-600">Places occupées</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-gray-400">
                                {seatingArrangement.flat().filter(s => s === null).length}
                            </p>
                            <p className="text-sm text-gray-600">Places libres</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {classData.capacity}
                            </p>
                            <p className="text-sm text-gray-600">Capacité totale</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TimetableTab: React.FC<{ timetable: TimetableSession[] }> = ({ timetable }) => {
    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSession, setEditingSession] = useState<TimetableSession | null>(null);
    const [localTimetable, setLocalTimetable] = useState<TimetableSession[]>(timetable);

    React.useEffect(() => {
        setLocalTimetable(timetable);
    }, [timetable]);
    
    const groupedByDay = useMemo(() => {
        const grouped: Record<string, TimetableSession[]> = {};
        daysOfWeek.forEach(day => {
            grouped[day] = localTimetable
                .filter(session => session.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return grouped;
    }, [localTimetable]);

    const handleDeleteSession = (sessionId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
            setLocalTimetable(prev => prev.filter(s => s.id !== sessionId));
            console.log('Session supprimée:', sessionId);
            // TODO: API call to delete
        }
    };

    const handleSaveSession = (session: Partial<TimetableSession>) => {
        if (editingSession) {
            // Edit existing
            setLocalTimetable(prev => prev.map(s => 
                s.id === editingSession.id ? { ...s, ...session } : s
            ));
            console.log('Session modifiée:', session);
        } else {
            // Add new
            const newSession: TimetableSession = {
                id: `tt-${Date.now()}`,
                day: session.day || 'Lundi',
                startTime: session.startTime || '08:00',
                endTime: session.endTime || '09:00',
                subject: session.subject || '',
                classId: session.classId || '',
                teacherId: session.teacherId,
                room: session.room
            };
            setLocalTimetable(prev => [...prev, newSession]);
            console.log('Nouvelle session ajoutée:', newSession);
        }
        setShowAddForm(false);
        setEditingSession(null);
        // TODO: API call to save
    };

    if (localTimetable.length === 0) {
        return (
            <div className="text-center py-12">
                <i className='bx bx-calendar-x text-6xl text-gray-300 mb-4'></i>
                <p className="text-gray-500 mb-4">Aucun emploi du temps configuré</p>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <i className='bx bx-plus mr-2'></i>
                    Créer l'emploi du temps
                </button>
                
                {showAddForm && (
                    <TimetableSessionForm
                        session={null}
                        onSave={handleSaveSession}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Add button */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Emploi du temps ({localTimetable.length} cours)
                </h3>
                <button
                    onClick={() => {
                        setEditingSession(null);
                        setShowAddForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <i className='bx bx-plus'></i>
                    Ajouter un cours
                </button>
            </div>

            {daysOfWeek.map(day => (
                <div key={day} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <i className='bx bx-calendar text-blue-600'></i>
                        {day}
                    </h4>
                    {groupedByDay[day]?.length > 0 ? (
                        <div className="space-y-2">
                            {groupedByDay[day].map((session) => (
                                <div key={session.id} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-4 hover:border-blue-300 transition-colors group">
                                    <div className="flex-shrink-0 text-center">
                                        <p className="text-sm font-semibold text-gray-900">{session.startTime}</p>
                                        <p className="text-xs text-gray-500">{session.endTime}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{session.subject}</p>
                                        {session.teacherId && (
                                            <p className="text-sm text-gray-500">Prof. {session.teacherId}</p>
                                        )}
                                    </div>
                                    {session.room && (
                                        <div className="flex-shrink-0 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            Salle {session.room}
                                        </div>
                                    )}
                                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditingSession(session);
                                                setShowAddForm(true);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                            title="Modifier"
                                        >
                                            <i className='bx bx-edit text-lg'></i>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSession(session.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                            title="Supprimer"
                                        >
                                            <i className='bx bx-trash text-lg'></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Aucun cours ce jour</p>
                    )}
                </div>
            ))}

            {/* Modal for add/edit session */}
            {showAddForm && (
                <TimetableSessionForm
                    session={editingSession}
                    onSave={handleSaveSession}
                    onCancel={() => {
                        setShowAddForm(false);
                        setEditingSession(null);
                    }}
                />
            )}
        </div>
    );
};

// Timetable Session Form Component
const TimetableSessionForm: React.FC<{
    session: TimetableSession | null;
    onSave: (session: Partial<TimetableSession>) => void;
    onCancel: () => void;
}> = ({ session, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        day: session?.day || 'Lundi',
        startTime: session?.startTime || '08:00',
        endTime: session?.endTime || '09:00',
        subject: session?.subject || '',
        teacherId: session?.teacherId || '',
        room: session?.room || ''
    });

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const subjects = [
        'Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie',
        'Anglais', 'Sport', 'Arts', 'Musique', 'Informatique', 'Éducation civique'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.startTime || !formData.endTime) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        <i className='bx bx-calendar-plus mr-2'></i>
                        {session ? 'Modifier le cours' : 'Ajouter un cours'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <i className='bx bx-x text-2xl'></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jour <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.day}
                                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                {daysOfWeek.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Matière <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner...</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Heure début <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Heure fin <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enseignant (ID)
                            </label>
                            <input
                                type="text"
                                value={formData.teacherId}
                                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                placeholder="teacher-001"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Salle
                            </label>
                            <input
                                type="text"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                placeholder="A101"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <i className='bx bx-save'></i>
                            {session ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AttendanceTab: React.FC<{
    students: Student[];
    classData: SchoolClass;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onStudentClick: (student: Student) => void;
}> = ({ students, classData, selectedDate, onDateChange, onStudentClick }) => {
    const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [showHistory, setShowHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Format de la date pour l'affichage
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    // Changement de date
    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    };

    // Toggle présence
    const toggleAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === status ? 'present' : status
        }));
    };

    // Sauvegarder la fiche d'appel
    const saveAttendance = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // Préparer les données pour l'API
            const attendanceRecords = students.map(student => ({
                studentId: student.id,
                classId: classData.id,
                date: selectedDate.toISOString().split('T')[0], // Format YYYY-MM-DD
                status: attendanceData[student.id] || 'present',
                note: notes[student.id] || '',
                recordedBy: 'current-user', // À remplacer par l'utilisateur connecté
                recordedAt: new Date().toISOString()
            }));

            console.log('📝 Sauvegarde de la fiche d\'appel:', {
                date: selectedDate.toISOString().split('T')[0],
                classe: classData.name,
                totalEleves: students.length,
                presents: Object.values(attendanceData).filter(s => s === 'present').length,
                absents: Object.values(attendanceData).filter(s => s === 'absent').length,
                retards: Object.values(attendanceData).filter(s => s === 'late').length,
                justifies: Object.values(attendanceData).filter(s => s === 'excused').length,
                records: attendanceRecords
            });

            // Tentative de sauvegarde via l'API
            try {
                const response = await fetch('http://localhost:3001/api/v1/attendance/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        date: selectedDate.toISOString().split('T')[0],
                        classId: classData.id,
                        records: attendanceRecords
                    })
                });

                if (response.ok) {
                    setSaveMessage({ 
                        type: 'success', 
                        text: `✅ Fiche d'appel enregistrée avec succès pour le ${formatDate(selectedDate)}` 
                    });
                    console.log('✅ Fiche d\'appel sauvegardée avec succès');
                } else {
                    throw new Error('Erreur API: ' + response.statusText);
                }
            } catch (apiError) {
                console.warn('⚠️ API non disponible, sauvegarde locale:', apiError);
                
                // Fallback: Sauvegarde locale dans localStorage
                const localStorageKey = `attendance_${classData.id}_${selectedDate.toISOString().split('T')[0]}`;
                localStorage.setItem(localStorageKey, JSON.stringify(attendanceRecords));
                
                setSaveMessage({ 
                    type: 'success', 
                    text: `✅ Fiche d'appel sauvegardée localement (${attendanceRecords.length} élèves marqués)` 
                });
                console.log('💾 Sauvegarde locale effectuée');
            }

            // Masquer le message après 5 secondes
            setTimeout(() => setSaveMessage(null), 5000);

        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            setSaveMessage({ 
                type: 'error', 
                text: '❌ Erreur lors de l\'enregistrement. Veuillez réessayer.' 
            });
            
            // Masquer le message d'erreur après 7 secondes
            setTimeout(() => setSaveMessage(null), 7000);
        } finally {
            setIsSaving(false);
        }
    };

    // Statistiques du jour
    const stats = useMemo(() => {
        const present = Object.values(attendanceData).filter(s => s === 'present').length;
        const absent = Object.values(attendanceData).filter(s => s === 'absent').length;
        const late = Object.values(attendanceData).filter(s => s === 'late').length;
        const excused = Object.values(attendanceData).filter(s => s === 'excused').length;
        const total = students.length;
        const marked = present + absent + late + excused;
        
        return { present, absent, late, excused, total, marked };
    }, [attendanceData, students.length]);

    return (
        <div className="space-y-6">
            {/* Message de sauvegarde */}
            {saveMessage && (
                <div className={`rounded-lg p-4 flex items-center gap-3 ${
                    saveMessage.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <i className={`bx text-2xl ${
                        saveMessage.type === 'success' ? 'bx-check-circle' : 'bx-error-circle'
                    }`}></i>
                    <p className="flex-1 font-medium">{saveMessage.text}</p>
                    <button 
                        onClick={() => setSaveMessage(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className='bx bx-x text-xl'></i>
                    </button>
                </div>
            )}

            {/* En-tête avec calendrier */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Fiche d'appel</h3>
                        <p className="text-sm text-gray-600">{classData.name} • {classData.level}</p>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <i className='bx bx-history'></i>
                        {showHistory ? 'Appel du jour' : 'Historique'}
                    </button>
                </div>

                {/* Sélecteur de date */}
                <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <i className='bx bx-chevron-left text-2xl'></i>
                    </button>
                    <div className="flex-1 text-center">
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                            {formatDate(selectedDate)}
                        </p>
                        {selectedDate.toDateString() === new Date().toDateString() && (
                            <span className="text-xs text-green-600 font-medium">Aujourd'hui</span>
                        )}
                    </div>
                    <button
                        onClick={() => changeDate(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <i className='bx bx-chevron-right text-2xl'></i>
                    </button>
                    <button
                        onClick={() => onDateChange(new Date())}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Aujourd'hui
                    </button>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                        <p className="text-xs text-gray-600">Présents</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                        <p className="text-xs text-gray-600">Absents</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                        <p className="text-xs text-gray-600">Retards</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                        <p className="text-xs text-gray-600">Justifiés</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.marked}/{stats.total}</p>
                        <p className="text-xs text-gray-600">Marqués</p>
                    </div>
                </div>
            </div>

            {!showHistory ? (
                <>
                    {/* Liste des élèves pour l'appel */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Liste des élèves ({students.length})</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const allPresent: Record<string, 'present'> = {};
                                        students.forEach(s => { allPresent[s.id] = 'present'; });
                                        setAttendanceData(allPresent);
                                    }}
                                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                    Tous présents
                                </button>
                                <button
                                    onClick={saveAttendance}
                                    disabled={isSaving}
                                    className={`px-4 py-1 text-xs rounded flex items-center gap-1 transition-all ${
                                        isSaving 
                                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    <i className={`bx ${isSaving ? 'bx-loader-alt animate-spin' : 'bx-save'}`}></i>
                                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {students.map((student) => {
                                const status = attendanceData[student.id] || 'present';
                                return (
                                    <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div 
                                                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                                                onClick={() => onStudentClick(student)}
                                                title="Voir la fiche élève"
                                            >
                                                {student.firstName?.[0]}{student.lastName?.[0]}
                                            </div>

                                            {/* Info élève */}
                                            <div className="flex-1">
                                                <p 
                                                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                                    onClick={() => onStudentClick(student)}
                                                >
                                                    {student.firstName} {student.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">{student.studentCode}</p>
                                            </div>

                                            {/* Boutons de statut */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleAttendance(student.id, 'present')}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                                        status === 'present'
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                                                    }`}
                                                >
                                                    <i className='bx bx-check-circle mr-1'></i>
                                                    Présent
                                                </button>
                                                <button
                                                    onClick={() => toggleAttendance(student.id, 'absent')}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                                        status === 'absent'
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                                                    }`}
                                                >
                                                    <i className='bx bx-x-circle mr-1'></i>
                                                    Absent
                                                </button>
                                                <button
                                                    onClick={() => toggleAttendance(student.id, 'late')}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                                        status === 'late'
                                                            ? 'bg-orange-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                                                    }`}
                                                >
                                                    <i className='bx bx-time mr-1'></i>
                                                    Retard
                                                </button>
                                                <button
                                                    onClick={() => toggleAttendance(student.id, 'excused')}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                                        status === 'excused'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-blue-100'
                                                    }`}
                                                >
                                                    <i className='bx bx-file mr-1'></i>
                                                    Justifié
                                                </button>
                                            </div>
                                        </div>

                                        {/* Note pour cet élève */}
                                        {(status === 'absent' || status === 'late' || status === 'excused') && (
                                            <div className="mt-2 ml-14">
                                                <input
                                                    type="text"
                                                    placeholder="Ajouter une remarque..."
                                                    value={notes[student.id] || ''}
                                                    onChange={(e) => setNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                /* Historique des présences */
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Historique des présences</h4>
                    <div className="text-center py-12 text-gray-500">
                        <i className='bx bx-calendar-event text-6xl mb-4'></i>
                        <p>L'historique des présences sera disponible prochainement</p>
                        <p className="text-sm mt-2">Intégration avec l'API en cours...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatisticsTab: React.FC<{ students: Student[]; classData: SchoolClass }> = ({ students, classData }) => {
    const stats = useMemo(() => {
        const genderStats = students.reduce((acc, student) => {
            const gender = student.gender || 'Non spécifié';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const avgAge = students.reduce((sum, s) => sum + (s.age || 0), 0) / (students.length || 1);

        const ageGroups = students.reduce((acc, student) => {
            if (!student.age) return acc;
            const group = student.age < 8 ? '< 8 ans' :
                         student.age < 12 ? '8-11 ans' :
                         student.age < 15 ? '12-14 ans' : '15+ ans';
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: students.length,
            genderStats,
            avgAge: avgAge.toFixed(1),
            ageGroups,
            occupancyRate: Math.round((students.length / classData.capacity) * 100)
        };
    }, [students, classData]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total élèves</p>
                            <p className="text-4xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <i className='bx bxs-group text-5xl text-blue-300 opacity-50'></i>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Âge moyen</p>
                            <p className="text-4xl font-bold mt-1">{stats.avgAge}</p>
                            <p className="text-xs text-green-100 mt-1">ans</p>
                        </div>
                        <i className='bx bxs-cake text-5xl text-green-300 opacity-50'></i>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Taux de remplissage</p>
                            <p className="text-4xl font-bold mt-1">{stats.occupancyRate}%</p>
                        </div>
                        <i className='bx bxs-pie-chart-alt-2 text-5xl text-purple-300 opacity-50'></i>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Répartition par genre */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className='bx bx-male-female text-purple-600'></i>
                        Répartition par genre
                    </h4>
                    <div className="space-y-3">
                        {Object.entries(stats.genderStats).map(([gender, count]) => {
                            const numCount = Number(count);
                            const percentage = Math.round((numCount / stats.total) * 100);
                            const isMale = gender === 'M' || gender === 'Masculin' || gender === 'male';
                            const isFemale = gender === 'F' || gender === 'Féminin' || gender === 'female';
                            const displayLabel = isMale ? 'Garçons' : isFemale ? 'Filles' : gender;
                            
                            return (
                                <div key={gender}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">
                                            {displayLabel}
                                        </span>
                                        <span className="font-semibold text-gray-900">{numCount} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                isMale ? 'bg-blue-500' : 'bg-pink-500'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Répartition par âge */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className='bx bx-bar-chart text-orange-600'></i>
                        Répartition par âge
                    </h4>
                    <div className="space-y-3">
                        {Object.entries(stats.ageGroups).map(([group, count]) => {
                            const numCount = Number(count);
                            const percentage = Math.round((numCount / stats.total) * 100);
                            return (
                                <div key={group}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{group}</span>
                                        <span className="font-semibold text-gray-900">{numCount} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GradesTab: React.FC<{ 
    students: Student[]; 
    classData: SchoolClass;
    timetable: TimetableSession[];
}> = ({ students, classData, timetable }) => {
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('T1');
    const [gradesData, setGradesData] = useState<Record<string, Record<string, number>>>({});
    const [showAddGradeForm, setShowAddGradeForm] = useState(false);
    const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<Student | null>(null);

    // Extract unique subjects from timetable
    const subjects = useMemo(() => {
        const uniqueSubjects = new Set<string>();
        timetable.forEach(session => {
            if (session.subject) uniqueSubjects.add(session.subject);
        });
        return Array.from(uniqueSubjects);
    }, [timetable]);

    const periods = ['T1', 'T2', 'T3'];

    // Calculate statistics for selected subject
    const subjectStats = useMemo(() => {
        const grades = Object.values(gradesData)
            .map(studentGrades => studentGrades[selectedSubject])
            .filter(grade => grade !== undefined);

        if (grades.length === 0) {
            return { average: 0, min: 0, max: 0, count: 0 };
        }

        const sum = grades.reduce((a, b) => a + b, 0);
        return {
            average: (sum / grades.length).toFixed(2),
            min: Math.min(...grades),
            max: Math.max(...grades),
            count: grades.length
        };
    }, [gradesData, selectedSubject]);

    const handleAddGrade = (studentId: string, subject: string, grade: number) => {
        setGradesData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subject]: grade
            }
        }));
        setShowAddGradeForm(false);
        setSelectedStudentForGrade(null);
        console.log('Note ajoutée:', { studentId, subject, grade, period: selectedPeriod });
        // TODO: API call to save grade
    };

    const exportGrades = () => {
        const headers = ['Élève', ...subjects, 'Moyenne'];
        const rows = students.map(student => {
            const studentGrades = gradesData[student.id] || {};
            const gradeValues = subjects.map(subject => studentGrades[subject] || '-');
            const validGrades = gradeValues.filter(g => g !== '-').map(Number);
            const average = validGrades.length > 0 
                ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2)
                : '-';
            
            return [
                `${student.firstName} ${student.lastName}`,
                ...gradeValues,
                average
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notes_${classData.name}_${selectedPeriod}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (students.length === 0) {
        return (
            <div className="text-center py-12">
                <i className='bx bx-trophy text-6xl text-gray-300 mb-4'></i>
                <p className="text-gray-500">Aucun élève dans cette classe</p>
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div className="text-center py-12">
                <i className='bx bx-book text-6xl text-gray-300 mb-4'></i>
                <p className="text-gray-500 mb-2">Aucune matière configurée</p>
                <p className="text-sm text-gray-400">Ajoutez des cours à l'emploi du temps pour commencer</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with filters and actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Période</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {periods.map(period => (
                                <option key={period} value={period}>Trimestre {period.substring(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Matière</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Toutes les matières</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={exportGrades}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    <i className='bx bx-download'></i>
                    Exporter
                </button>
            </div>

            {/* Statistics cards */}
            {selectedSubject !== 'all' && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-xs text-blue-600 font-medium">Moyenne</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">{subjectStats.average}/20</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-xs text-green-600 font-medium">Note max</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">{subjectStats.max}/20</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-xs text-orange-600 font-medium">Note min</p>
                        <p className="text-2xl font-bold text-orange-700 mt-1">{subjectStats.min}/20</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-xs text-purple-600 font-medium">Élèves notés</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{subjectStats.count}/{students.length}</p>
                    </div>
                </div>
            )}

            {/* Grades table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                                    Élève
                                </th>
                                {(selectedSubject === 'all' ? subjects : [selectedSubject]).map(subject => (
                                    <th key={subject} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {subject}
                                    </th>
                                ))}
                                {selectedSubject === 'all' && (
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Moyenne
                                    </th>
                                )}
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => {
                                const studentGrades = gradesData[student.id] || {};
                                const displaySubjects = selectedSubject === 'all' ? subjects : [selectedSubject];
                                const gradeValues = displaySubjects.map(subject => studentGrades[subject]);
                                const validGrades = gradeValues.filter(g => g !== undefined);
                                const average = validGrades.length > 0
                                    ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2)
                                    : null;

                                return (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {displaySubjects.map(subject => {
                                            const grade = studentGrades[subject];
                                            const gradeColor = grade !== undefined
                                                ? grade >= 16 ? 'text-green-700 bg-green-100'
                                                : grade >= 14 ? 'text-blue-700 bg-blue-100'
                                                : grade >= 10 ? 'text-orange-700 bg-orange-100'
                                                : 'text-red-700 bg-red-100'
                                                : 'text-gray-500';

                                            return (
                                                <td key={subject} className="px-6 py-4 whitespace-nowrap text-center">
                                                    {grade !== undefined ? (
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${gradeColor}`}>
                                                            {grade}/20
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        {selectedSubject === 'all' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {average ? (
                                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700">
                                                        {average}/20
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedStudentForGrade(student);
                                                    setShowAddGradeForm(true);
                                                }}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                                            >
                                                <i className='bx bx-plus mr-1'></i>
                                                Note
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add grade modal */}
            {showAddGradeForm && selectedStudentForGrade && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                Ajouter une note
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddGradeForm(false);
                                    setSelectedStudentForGrade(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className='bx bx-x text-2xl'></i>
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const subject = formData.get('subject') as string;
                                const grade = parseFloat(formData.get('grade') as string);
                                
                                if (grade < 0 || grade > 20) {
                                    alert('La note doit être entre 0 et 20');
                                    return;
                                }
                                
                                handleAddGrade(selectedStudentForGrade.id, subject, grade);
                            }}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Élève: <strong>{selectedStudentForGrade.firstName} {selectedStudentForGrade.lastName}</strong>
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Période: <strong>Trimestre {selectedPeriod.substring(1)}</strong>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Matière <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="subject"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note /20 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="grade"
                                    min="0"
                                    max="20"
                                    step="0.25"
                                    required
                                    placeholder="15.5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddGradeForm(false);
                                        setSelectedStudentForGrade(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <i className='bx bx-check'></i>
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

