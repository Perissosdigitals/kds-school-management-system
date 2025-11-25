import React, { useState, useEffect } from 'react';
import { AttendanceService } from '../../services/api/attendance.service';
import { ClassesService } from '../../services/api/classes.service';
import type { Student, AttendanceRecord } from '../../types';

interface AttendanceDailyEntryProps {
  teacherId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  arrivalTime?: string;
}

export const AttendanceDailyEntry: React.FC<AttendanceDailyEntryProps> = ({
  teacherId,
  onSuccess,
  onError,
}) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, AttendanceEntry>>({});
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon'>('morning');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load teacher's classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await ClassesService.getAll({ teacherId });
        setClasses(response);
      } catch (err) {
        setError('Erreur lors du chargement des classes');
        console.error(err);
      }
    };
    
    if (teacherId) {
      loadClasses();
    }
  }, [teacherId]);

  // Load students when class is selected
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass) return;
      
      setLoadingStudents(true);
      try {
        const response = await ClassesService.getStudents(selectedClass);
        setStudents(response);
        
        // Initialize attendance entries (default: present)
        const entries: Record<string, AttendanceEntry> = {};
        response.forEach((student: Student) => {
          entries[student.id] = {
            studentId: student.id,
            status: 'present',
          };
        });
        setAttendanceEntries(entries);
      } catch (err) {
        setError('Erreur lors du chargement des élèves');
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    
    loadStudents();
  }, [selectedClass]);

  // Handle status change
  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        arrivalTime: status === 'late' ? new Date().toTimeString().slice(0, 5) : undefined,
      },
    }));
  };

  // Handle arrival time change
  const handleArrivalTimeChange = (studentId: string, time: string) => {
    setAttendanceEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        arrivalTime: time,
      },
    }));
  };

  // Submit attendance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setError('Veuillez sélectionner une classe');
      return;
    }

    const attendanceData = Object.values(attendanceEntries).map(entry => ({
      studentId: entry.studentId,
      classId: selectedClass,
      date: new Date(selectedDate).toISOString(),
      session: selectedSession,
      status: entry.status,
      arrivalTime: entry.arrivalTime,
      recordedBy: teacherId,
    }));

    setLoading(true);
    setError('');
    setSuccess('');

    const startTime = Date.now();

    try {
      await AttendanceService.createBulk(attendanceData);
      
      const duration = Date.now() - startTime;
      
      setSuccess(`Présences enregistrées avec succès! (${students.length} élèves en ${(duration/1000).toFixed(1)}s)`);
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'enregistrement des présences';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick actions
  const markAllPresent = () => {
    const entries: Record<string, AttendanceEntry> = {};
    students.forEach(student => {
      entries[student.id] = {
        studentId: student.id,
        status: 'present',
      };
    });
    setAttendanceEntries(entries);
  };

  const markAllAbsent = () => {
    const entries: Record<string, AttendanceEntry> = {};
    students.forEach(student => {
      entries[student.id] = {
        studentId: student.id,
        status: 'absent',
      };
    });
    setAttendanceEntries(entries);
  };

  return (
    <div className="attendance-daily-entry bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📅 Appel Journalier
      </h2>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p className="font-medium">Succès</p>
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.level}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Session Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session *
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value as 'morning' | 'afternoon')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="morning">🌅 Matin</option>
              <option value="afternoon">🌇 Après-midi</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        {selectedClass && students.length > 0 && (
          <div className="mb-4 flex space-x-2">
            <button
              type="button"
              onClick={markAllPresent}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none"
            >
              ✅ Tous présents
            </button>
            <button
              type="button"
              onClick={markAllAbsent}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none"
            >
              ❌ Tous absents
            </button>
          </div>
        )}

        {/* Students Attendance Table */}
        {selectedClass && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Élèves ({students.length})
            </h3>
            
            {loadingStudents ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Chargement des élèves...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom & Prénom
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heure d'arrivée
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.lastName} {student.firstName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.registrationNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                attendanceEntries[student.id]?.status === 'present'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ✅ Présent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'absent')}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                attendanceEntries[student.id]?.status === 'absent'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ❌ Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'late')}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                attendanceEntries[student.id]?.status === 'late'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              ⏰ Retard
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attendanceEntries[student.id]?.status === 'late' && (
                            <input
                              type="time"
                              value={attendanceEntries[student.id]?.arrivalTime || ''}
                              onChange={(e) => handleArrivalTimeChange(student.id, e.target.value)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !selectedClass || students.length === 0}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : (
              'Enregistrer les présences'
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Astuce:</strong> Utilisez les boutons "Tous présents" pour gagner du temps. 
          Vous pourrez ensuite marquer individuellement les absents/retards.
        </p>
        <p className="text-sm text-blue-800 mt-2">
          <strong>Performance:</strong> L'enregistrement de 30 élèves prend moins d'1 minute.
        </p>
      </div>
    </div>
  );
};
