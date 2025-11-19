
import React, { useState, useMemo, useEffect, useCallback, DragEvent } from 'react';
import type { TimetableSession, SchoolClass, Teacher, SpecialEvent, User, TimetableLog } from '../types';
import { FilterInput, FilterSelect } from './ui/FilterControls';
import { SpecialEventModal } from './ui/SpecialEventModal';
import { TimetableHistoryModal } from './ui/TimetableHistoryModal';
import { TimetableSummary } from './ui/TimetableSummary';
import { getTimetableData } from '../services/api/timetable.service';
import { getSubjectColor } from '../utils/colorUtils';
import { LoadingSpinner } from './ui/LoadingSpinner';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const daysOfWeek: TimetableSession['day'][] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const SessionBlock = React.memo(({ session, viewType, findClassName, findTeacherName, onEdit, onDragStart, canDrag }: { session: TimetableSession, viewType: string, findClassName: (id: string) => string, findTeacherName: (id: string) => string, onEdit: (session: TimetableSession) => void, onDragStart: (e: DragEvent<HTMLDivElement>, sessionId: string) => void, canDrag: boolean }) => {
    const startRow = timeSlots.indexOf(session.startTime) + 2;
    const endRow = timeSlots.indexOf(session.endTime) + 2;
    const dayCol = daysOfWeek.indexOf(session.day) + 2;

    if (startRow === 1 || endRow === 1 || dayCol === 1) return null;

    const style = {
        gridColumnStart: dayCol,
        gridRowStart: startRow,
        gridRowEnd: endRow,
    };

    const colorClasses = getSubjectColor(session.subject);
    const duration = (timeSlots.indexOf(session.endTime) - timeSlots.indexOf(session.startTime));

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click-through
        onEdit(session);
    }

    return (
        <div
            draggable={canDrag}
            onDragStart={(e) => onDragStart(e, session.id)}
            className={`absolute inset-px p-2 rounded-md border-l-4 flex flex-col shadow-sm overflow-hidden group transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:z-20 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text} ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={style}
            title={`${session.subject} | ${session.startTime} - ${session.endTime} | ${session.room}`}
        >
            {canDrag && (
                <button onClick={handleEditClick} className="absolute top-1 right-1 bg-white/50 p-1 rounded-full text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className='bx bxs-pencil text-xs'></i>
                </button>
            )}
            <p className="font-bold leading-tight">{session.subject}</p>
            <p className="text-xs mt-1 opacity-80">{session.startTime} - {session.endTime}</p>
            {duration > 0 && <div className="flex-grow"></div>}
            <div className="text-xs mt-1 truncate">
                <p>{viewType === 'teacher' ? findClassName(session.classId) : `M/Mme ${findTeacherName(session.teacherId)}`}</p>
                <p className="italic opacity-70">{session.room}</p>
            </div>
        </div>
    );
});


const EditSessionBlock = React.memo(({ session, onSave, onCancel }: { session: TimetableSession, onSave: (id: string, newSubject: string) => void, onCancel: () => void }) => {
    const [newSubject, setNewSubject] = useState(session.subject);
    
    const startRow = timeSlots.indexOf(session.startTime) + 2;
    const endRow = timeSlots.indexOf(session.endTime) + 2;
    const dayCol = daysOfWeek.indexOf(session.day) + 2;
    
    if (startRow === 1 || endRow === 1 || dayCol === 1) return null;

    const style = {
        gridColumnStart: dayCol,
        gridRowStart: startRow,
        gridRowEnd: endRow,
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave(session.id, newSubject);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCancel();
    };

    return (
        <div
            className="absolute inset-px p-2 rounded-md border-l-4 border-blue-500 bg-blue-100 flex flex-col shadow-lg z-30"
            style={style}
        >
            <input 
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full text-sm font-bold border border-blue-300 rounded px-1 py-0.5 mb-2"
                autoFocus
                onClick={e => e.stopPropagation()}
            />
            <div className="flex justify-end gap-2">
                <button onClick={handleCancel} className="text-red-600 p-1 rounded-full hover:bg-red-100"><i className='bx bx-x'></i></button>
                <button onClick={handleSave} className="text-green-600 p-1 rounded-full hover:bg-green-100"><i className='bx bx-check'></i></button>
            </div>
        </div>
    );
});


const EventBlock = React.memo(({ event }: { event: SpecialEvent }) => {
    const startRow = timeSlots.indexOf(event.startTime) + 2;
    const endRow = timeSlots.indexOf(event.endTime) + 2;
    const dayCol = daysOfWeek.indexOf(event.day) + 2;

    if (startRow === 1 || endRow === 1 || dayCol === 1) return null;

    const style = {
        gridColumnStart: dayCol,
        gridRowStart: startRow,
        gridRowEnd: endRow,
    };
    
    const colorMap: Record<SpecialEvent['color'], { bg: string; border: string; text: string; pattern: string }> = {
        blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', pattern: 'bg-[radial-gradient(#a3bffa_1px,transparent_1px)] [background-size:10px_10px]' },
        green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', pattern: 'bg-[radial-gradient(#a7f3d0_1px,transparent_1px)] [background-size:10px_10px]' },
        yellow: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800', pattern: 'bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:10px_10px]' },
        purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800', pattern: 'bg-[radial-gradient(#d8b4fe_1px,transparent_1px)] [background-size:10px_10px]' },
        gray: { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-800', pattern: 'bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:10px_10px]' },
    };

    const colorClasses = colorMap[event.color];

    return (
        <div
            className={`absolute inset-px p-2 rounded-md border-l-4 flex flex-col shadow-sm overflow-hidden z-20 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}`}
            style={style}
            title={`${event.title} | ${event.startTime} - ${event.endTime}`}
        >
            <div className={`absolute inset-0 opacity-20 ${colorClasses.pattern}`}></div>
            <div className="relative z-10">
                 <div className="flex items-center gap-1.5 font-bold">
                    <i className='bx bxs-star text-xs'></i>
                    <p className="leading-tight">{event.title}</p>
                 </div>
                <p className="text-xs mt-1 opacity-80">{event.startTime} - {event.endTime}</p>
            </div>
        </div>
    );
});

const CurrentTimeIndicator = React.memo(({ isCurrentWeek }: { isCurrentWeek: boolean }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    if (!isCurrentWeek) return null;

    const now = currentTime;
    const currentDayIndex = now.getDay() - 1; // 0=Mon, 1=Tue...
    if (currentDayIndex < 0 || currentDayIndex > 4) return null; // Only show on weekdays

    const startHour = 8;
    const endHour = 17; // Total grid duration is 9 hours (8am to 5pm)
    const totalMinutes = (endHour - startHour) * 60;
    const minutesFromStart = (now.getHours() - startHour) * 60 + now.getMinutes();

    if (minutesFromStart < 0 || minutesFromStart > totalMinutes) return null;

    const topPercentage = (minutesFromStart / totalMinutes) * 100;

    const style = {
        gridColumn: currentDayIndex + 2,
        gridRow: `2 / span ${timeSlots.length}`,
        top: `${topPercentage}%`,
    };

    return (
        <div className="absolute w-full h-full pointer-events-none" style={style}>
            <div className="relative w-full h-full">
                <div className="absolute left-0 w-full h-0.5 bg-red-500 z-10">
                    <div className="absolute -left-1.5 -top-1 w-3 h-3 rounded-full bg-red-500"></div>
                </div>
            </div>
        </div>
    );
});


export const Timetable: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [localSchedule, setLocalSchedule] = useState<TimetableSession[]>([]);
    const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [isLegendVisible, setIsLegendVisible] = useState(false);
    const [dragOverCell, setDragOverCell] = useState<{ day: string, time: string } | null>(null);
    const [subjectSearchTerm, setSubjectSearchTerm] = useState<string>('');
    
    const canChangeView = currentUser.role !== 'Enseignant';
    const [viewType, setViewType] = useState<'teacher' | 'class'>('teacher');

    const defaultView = useMemo(() => {
        if (!canChangeView) return `teacher-${currentUser.id}`;
        return ''; // No default for admins, prompt them to select.
    }, [currentUser, canChangeView]);

    const [view, setView] = useState(defaultView);
    const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [logs, setLogs] = useState<TimetableLog[]>([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const { schedule, classes, teachers } = await getTimetableData();
            setLocalSchedule(schedule);
            setAllClasses(classes);
            setAllTeachers(teachers);
            setIsLoading(false);
        };
        loadData();
    }, []);
    
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };
    
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));

    const handlePreviousWeek = useCallback(() => {
        setCurrentWeekStart(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
    }, []);

    const handleNextWeek = useCallback(() => {
        setCurrentWeekStart(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
    }, []);
    
    const handleGoToToday = useCallback(() => {
        setCurrentWeekStart(getStartOfWeek(new Date()));
    }, []);

    const weekRangeDisplay = useMemo(() => {
        const start = currentWeekStart;
        const end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000); // Friday
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric' });
        const endStr = end.toLocaleDateString('fr-FR', options);
        return `Semaine du ${startStr} au ${endStr}`;
    }, [currentWeekStart]);
    
    const isThisCurrentWeek = useMemo(() => {
        const todayStartOfWeek = getStartOfWeek(new Date());
        return currentWeekStart.getTime() === todayStartOfWeek.getTime();
    }, [currentWeekStart]);


    const addLog = useCallback((action: string) => {
        const newLog: TimetableLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUser.name,
            action: action,
        };
        setLogs(prev => [newLog, ...prev]);
    }, [currentUser.name]);

    const canEditSchedule = useMemo(() => {
        if (!view) return false;
        if (currentUser.role === 'Fondatrice' || currentUser.role === 'Directrice') return true;
        if (currentUser.role === 'Enseignant') {
            const [type, id] = view.split('-');
            return type === 'teacher' && id === currentUser.id;
        }
        return false;
    }, [currentUser, view]);

    useEffect(() => {
        setView(defaultView);
    }, [defaultView]);

    const findTeacherName = useCallback((id: string) => allTeachers.find(t => t.id === id)?.lastName || 'N/A', [allTeachers]);
    const findClassName = useCallback((id: string) => allClasses.find(c => c.id === id)?.name || 'N/A', [allClasses]);
    
    const unfilteredScheduleForView = useMemo(() => {
        if (!view) return [];
        const [type, id] = view.split('-');
        if (!id) return [];

        if (type === 'teacher') return localSchedule.filter(session => session.teacherId === id);
        if (type === 'class') return localSchedule.filter(session => session.classId === id);
        return [];
    }, [view, localSchedule]);

    const filteredSchedule = useMemo(() => {
        if (subjectSearchTerm.trim() === '') {
            return unfilteredScheduleForView;
        }
        return unfilteredScheduleForView.filter(session =>
            session.subject.toLowerCase().includes(subjectSearchTerm.toLowerCase())
        );
    }, [unfilteredScheduleForView, subjectSearchTerm]);

    const uniqueSubjects = useMemo(() => {
        const subjects = new Set(unfilteredScheduleForView.map(session => session.subject));
        return Array.from(subjects).sort();
    }, [unfilteredScheduleForView]);

    const handleAddSpecialEvent = useCallback((eventData: Omit<SpecialEvent, 'id'>) => {
        const newEvent: SpecialEvent = { ...eventData, id: `evt-${Date.now()}` };
        setSpecialEvents(prev => [...prev, newEvent]);
        addLog(`Événement spécial '${newEvent.title}' ajouté le ${newEvent.day} de ${newEvent.startTime} à ${newEvent.endTime}.`);
    }, [addLog]);

    const handleSaveSubject = useCallback((id: string, newSubject: string) => {
        const session = localSchedule.find(s => s.id === id);
        if (session && session.subject !== newSubject) {
             addLog(`Matière du cours '${session.subject}' changée en '${newSubject}' pour le ${session.day} à ${session.startTime}.`);
        }
        setLocalSchedule(prev => prev.map(s => s.id === id ? { ...s, subject: newSubject } : s));
        setEditingSessionId(null);
    }, [addLog, localSchedule]);
    
    const handleViewTypeChange = useCallback((type: 'teacher' | 'class') => {
        if (viewType !== type) {
            setViewType(type);
            setView(''); // Reset specific selection when type changes
            setSubjectSearchTerm(''); // Also reset subject filter
        }
    }, [viewType]);

    const handleViewSelectionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setSubjectSearchTerm(''); // Reset subject filter on view change
        if (selectedId) {
            setView(`${viewType}-${selectedId}`);
        } else {
            setView('');
        }
    }, [viewType]);

    const handleDragStart = (e: DragEvent<HTMLDivElement>, sessionId: string) => {
        e.dataTransfer.setData('sessionId', sessionId);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const target = e.target as HTMLDivElement;
        const day = target.dataset.day;
        const time = target.dataset.time;
        if(day && time) {
            setDragOverCell({ day, time });
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOverCell(null);
        const sessionId = e.dataTransfer.getData('sessionId');
        const target = e.target as HTMLDivElement;
        const newDay = target.dataset.day as TimetableSession['day'] | undefined;
        const newStartTimeStr = target.dataset.time;

        if (!sessionId || !newDay || !newStartTimeStr) return;

        setLocalSchedule(prev => {
            const session = prev.find(s => s.id === sessionId);
            if (!session) return prev;

            const oldStartTimeIndex = timeSlots.indexOf(session.startTime);
            const oldEndTimeIndex = timeSlots.indexOf(session.endTime);
            const duration = oldEndTimeIndex - oldStartTimeIndex;

            const newStartTimeIndex = timeSlots.indexOf(newStartTimeStr);
            const newEndTimeIndex = newStartTimeIndex + duration;

            if (newEndTimeIndex >= timeSlots.length) return prev; // Cannot drop if it overflows

            const newEndTime = timeSlots[newEndTimeIndex];

            addLog(`Le cours '${session.subject}' a été déplacé du ${session.day} ${session.startTime} au ${newDay} ${newStartTimeStr}.`);
            
            return prev.map(s => s.id === sessionId ? { ...s, day: newDay, startTime: newStartTimeStr, endTime: newEndTime } : s);
        });
    };


    const viewTitle = useMemo(() => {
        if (!view) {
            return 'Emploi du Temps';
        }
        const [type, id] = view.split('-');
        if (type === 'teacher' && id) {
            const teacherName = findTeacherName(id);
            return `Emploi du Temps | M/Mme ${teacherName}`;
        }
        if (type === 'class' && id) {
            const className = findClassName(id);
            return `Emploi du Temps | ${className}`;
        }
        return 'Emploi du Temps';
    }, [view, findTeacherName, findClassName]);

    const editingSession = editingSessionId ? localSchedule.find(s => s.id === editingSessionId) : null;
    
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800">{viewTitle}</h3>
                    <p className="text-sm text-gray-500">{weekRangeDisplay}</p>
                </div>
                <div className="flex items-end gap-2 flex-wrap">
                    <div className="flex items-center rounded-lg p-1 bg-slate-100 h-[42px]">
                        <button onClick={handlePreviousWeek} title="Semaine précédente" className="px-2 py-1 text-slate-600 hover:bg-white hover:text-blue-700 rounded-md transition-colors"><i className='bx bx-chevron-left'></i></button>
                        <button onClick={handleGoToToday} className="px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-white hover:text-blue-700 rounded-md transition-colors">Aujourd'hui</button>
                        <button onClick={handleNextWeek} title="Semaine suivante" className="px-2 py-1 text-slate-600 hover:bg-white hover:text-blue-700 rounded-md transition-colors"><i className='bx bx-chevron-right'></i></button>
                    </div>

                    {canChangeView ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div>
                                <label className="text-sm font-medium text-slate-600 block mb-1">Afficher par</label>
                                <div className="flex rounded-lg p-1 bg-slate-100">
                                    <button
                                        onClick={() => handleViewTypeChange('teacher')}
                                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewType === 'teacher' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        Professeur
                                    </button>
                                    <button
                                        onClick={() => handleViewTypeChange('class')}
                                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewType === 'class' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        Classe
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 block mb-1">Sélectionner</label>
                                <FilterSelect
                                    value={view.split('-')[1] || ''}
                                    onChange={handleViewSelectionChange}
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {viewType === 'teacher' ? (
                                        allTeachers.map(t => <option key={t.id} value={t.id}>M/Mme {t.lastName}</option>)
                                    ) : (
                                        allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    )}
                                </FilterSelect>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-medium text-slate-600 block mb-1">Mon emploi du temps</label>
                            <p className="font-semibold text-slate-800 h-[42px] flex items-center">{currentUser.name}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="subject-search" className="text-sm font-medium text-slate-600 block mb-1">Rechercher une matière</label>
                        <FilterInput
                            id="subject-search"
                            type="text"
                            value={subjectSearchTerm}
                            onChange={(e) => setSubjectSearchTerm(e.target.value)}
                            placeholder="Ex: Mathématiques..."
                            disabled={!view}
                        />
                    </div>
                     <button 
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="h-[42px] flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition-all duration-300"
                        title="Afficher l'historique des modifications"
                    >
                        <i className='bx bx-history'></i>
                        <span className="hidden sm:inline">Historique</span>
                    </button>
                     <button 
                        onClick={() => setIsLegendVisible(prev => !prev)}
                        className="h-[42px] flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition-all duration-300"
                        title="Afficher la légende des couleurs"
                    >
                        <i className='bx bxs-palette'></i>
                        <span className="hidden sm:inline">Légende</span>
                    </button>
                    {canEditSchedule && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="h-[42px] flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                        title="Ajouter un événement spécial"
                    >
                        <i className='bx bxs-star'></i>
                        <span className="hidden sm:inline">Ajouter Événement</span>
                    </button>
                    )}
                </div>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isLegendVisible ? 'max-h-96 mb-6' : 'max-h-0'}`}>
                <div className="p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-semibold text-slate-700 mb-2">Légende des couleurs</h4>
                    {uniqueSubjects.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                            {uniqueSubjects.map(subject => {
                                const color = getSubjectColor(subject);
                                const isFiltered = subjectSearchTerm.trim() !== '' && !subject.toLowerCase().includes(subjectSearchTerm.toLowerCase());
                                return (
                                    <div key={subject} className={`flex items-center gap-2 transition-opacity ${isFiltered ? 'opacity-40' : 'opacity-100'}`}>
                                        <span className={`w-3 h-3 rounded-full ${color.bg} border ${color.border}`}></span>
                                        <span className="text-sm text-slate-600">{subject}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Aucune matière à afficher dans la vue actuelle.</p>
                    )}
                </div>
            </div>

            {view && unfilteredScheduleForView.length > 0 && (
                <div className="mb-6">
                    <TimetableSummary sessions={unfilteredScheduleForView} />
                </div>
            )}

            <div className="relative">
                <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] grid-rows-[auto_repeat(9,minmax(64px,auto))] gap-0 text-xs sm:text-sm">
                    <div className="sticky top-0 z-10 bg-white"></div>
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-center font-bold text-slate-700 py-2 sticky top-0 bg-white z-10 border-b-2 border-slate-200">
                            {day}
                        </div>
                    ))}
                    {timeSlots.map((time) => (
                        <React.Fragment key={time}>
                            <div className="text-right pr-4 font-mono text-slate-400 text-xs flex items-center justify-end">
                                <span>{time}</span>
                            </div>
                            {daysOfWeek.map((day) => (
                                <div 
                                    key={`${day}-${time}`} 
                                    className={`relative border-t border-l border-slate-100 transition-colors duration-150 ${time === '12:00' ? 'bg-slate-50' : ''} ${dragOverCell?.day === day && dragOverCell.time === time ? 'bg-blue-100/75 ring-2 ring-blue-500 ring-inset' : ''}`}
                                    data-day={day}
                                    data-time={time}
                                    onDragOver={canEditSchedule ? handleDragOver : undefined}
                                    onDrop={canEditSchedule ? handleDrop : undefined}
                                    onDragLeave={() => setDragOverCell(null)}
                                ></div>
                            ))}
                        </React.Fragment>
                    ))}

                    {!view && canChangeView ? (
                         <div className="col-start-2 col-span-5 row-start-2 row-span-9 flex items-center justify-center text-center text-slate-500 bg-slate-50/50 rounded-lg">
                            <div>
                                <i className='bx bx-search-alt text-5xl mb-2'></i>
                                <p className="font-semibold text-lg">Veuillez sélectionner une vue</p>
                                <p>Choisissez un type de vue, puis un professeur ou une classe.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {filteredSchedule.map(session => (
                               <SessionBlock 
                                    key={session.id}
                                    session={session}
                                    viewType={view.split('-')[0]}
                                    findClassName={findClassName}
                                    findTeacherName={findTeacherName}
                                    onEdit={() => setEditingSessionId(session.id)}
                                    onDragStart={handleDragStart}
                                    canDrag={canEditSchedule}
                               />
                            ))}
                            
                            {specialEvents.map(event => (
                                <EventBlock key={event.id} event={event} />
                            ))}
                            
                            {editingSession && canEditSchedule && (
                                <EditSessionBlock 
                                    session={editingSession}
                                    onSave={handleSaveSubject}
                                    onCancel={() => setEditingSessionId(null)}
                                />
                            )}
                        </>
                    )}
                </div>
                <CurrentTimeIndicator isCurrentWeek={isThisCurrentWeek} />
            </div>
            
            <SpecialEventModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddSpecialEvent}
                timeSlots={timeSlots}
                daysOfWeek={daysOfWeek}
            />

            <TimetableHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                logs={logs}
            />
        </div>
    );
};

export default Timetable;