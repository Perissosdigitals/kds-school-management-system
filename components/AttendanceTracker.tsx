import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Student, SchoolClass, AttendanceStatus, AttendanceRecord, User } from '../types';
import { FilterInput, FilterSelect } from './ui/FilterControls';
import { getAttendanceData } from '../services/api/attendance.service';
import { LoadingSpinner } from './ui/LoadingSpinner';

const AttendanceRow = React.memo(({ student, attendanceStatus, onMarkAttendance }: { student: Student, attendanceStatus: AttendanceStatus, onMarkAttendance: (studentId: string, status: AttendanceStatus) => void }) => {
  return (
    <tr className="bg-white border-t hover:bg-slate-50">
      <td className="p-3 font-medium text-slate-800">{student.lastName} {student.firstName}</td>
      <td className="p-3">
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {(['Présent', 'Absent', 'En retard'] as AttendanceStatus[]).map(status => (
            <button
              key={status}
              onClick={() => onMarkAttendance(student.id, status)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                attendanceStatus === status 
                  ? status === 'Présent' ? 'bg-green-600 text-white shadow' : status === 'Absent' ? 'bg-red-600 text-white shadow' : 'bg-amber-500 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
});

export const AttendanceTracker: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  const availableClasses = useMemo(() => {
    if (currentUser.role === 'teacher') {
        return allClasses.filter(c => c.teacherId === currentUser.id);
    }
    return allClasses; // Admins see all classes
  }, [currentUser, allClasses]);

  const [selectedClass, setSelectedClass] = useState<string>('');
  
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const { classes, students } = await getAttendanceData();
        setAllClasses(classes);
        setAllStudents(students);
        
        const firstAvailableClass = currentUser.role === 'teacher' 
            ? classes.find(c => c.teacherId === currentUser.id) 
            : classes[0];
            
        if (firstAvailableClass) {
            setSelectedClass(firstAvailableClass.id);
        }
        setIsLoading(false);
    };
    loadData();
  }, [currentUser]);

  const studentsInClass = useMemo(() => {
    const classLevel = allClasses.find(c => c.id === selectedClass)?.level;
    if (!classLevel) return [];
    return allStudents.filter(s => s.gradeLevel === classLevel);
  }, [selectedClass, allClasses, allStudents]);
  
  // Initialize or load attendance for the selected class and date
  useEffect(() => {
    // In a real app, you would fetch this from the API
    const initialAttendance = studentsInClass.reduce((acc, student) => {
      acc[student.id] = { studentId: student.id, status: 'Présent' };
      return acc;
    }, {} as Record<string, AttendanceRecord>);
    setAttendance(initialAttendance);
    setIsSaved(false); // Reset saved state when class or date changes
  }, [selectedClass, date, studentsInClass]);

  const handleMarkAttendance = useCallback((studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { studentId, status },
    }));
    setIsSaved(false);
  }, []);

  const handleSaveAttendance = useCallback(async () => {
    setIsSaving(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving attendance:', { classId: selectedClass, date, records: Object.values(attendance) });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }, [selectedClass, date, attendance]);
  
  const attendanceSummary = useMemo(() => {
    const summary: Record<AttendanceStatus, number> = { 'Présent': 0, 'Absent': 0, 'En retard': 0 };
    (Object.values(attendance) as AttendanceRecord[]).forEach(record => {
        summary[record.status]++;
    });
    return summary;
  }, [attendance]);

  if (isLoading) {
      return (
          <div className="bg-white p-6 rounded-xl shadow-lg">
              <LoadingSpinner />
          </div>
      );
  }

  return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Feuille d'Appel du Jour</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
          <div>
            <label htmlFor="class-select" className="text-sm font-medium text-slate-600 block mb-1">Classe</label>
            <FilterSelect id="class-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={availableClasses.length === 0}>
              {availableClasses.length > 0 ? (
                availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              ) : (
                <option>Aucune classe</option>
              )}
            </FilterSelect>
          </div>
          <div>
            <label htmlFor="date-select" className="text-sm font-medium text-slate-600 block mb-1">Date</label>
            <FilterInput type="date" id="date-select" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleSaveAttendance} 
              disabled={isSaving || isSaved || studentsInClass.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSaving && <i className='bx bx-loader-alt animate-spin'></i>}
              {isSaved && <i className='bx bx-check-circle'></i>}
              <span>{isSaving ? 'Sauvegarde...' : isSaved ? 'Enregistré !' : 'Enregistrer l\'Appel'}</span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-center gap-6 mb-6 text-center">
            <div><span className="font-bold text-2xl text-green-600">{attendanceSummary['Présent']}</span><p className="text-sm text-gray-500">Présents</p></div>
            <div><span className="font-bold text-2xl text-red-600">{attendanceSummary['Absent']}</span><p className="text-sm text-gray-500">Absents</p></div>
            <div><span className="font-bold text-2xl text-amber-500">{attendanceSummary['En retard']}</span><p className="text-sm text-gray-500">En retard</p></div>
        </div>

        <div className="overflow-x-auto">
          {studentsInClass.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 bg-slate-50">
                <tr>
                  <th className="p-3 font-semibold">Élève</th>
                  <th className="p-3 text-center font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {studentsInClass.map(student => (
                  <AttendanceRow
                    key={student.id}
                    student={student}
                    attendanceStatus={attendance[student.id]?.status || 'Présent'}
                    onMarkAttendance={handleMarkAttendance}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">
                <i className='bx bx-info-circle text-4xl mb-2'></i>
                <p>Aucun élève trouvé pour cette classe.</p>
                {currentUser.role === 'teacher' && availableClasses.length === 0 && <p className="text-xs mt-1">Aucune classe ne vous est assignée.</p>}
            </div>
          )}
        </div>
      </div>
  );
};

export default AttendanceTracker;
