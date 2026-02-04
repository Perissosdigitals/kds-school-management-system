import React, { useState, useEffect } from 'react';
import { AttendanceService } from '../../services/api/attendance.service';
import { ClassesService } from '../../services/api/classes.service';
import type { Student, AttendanceRecord } from '../../types';

interface AttendanceDailyEntryProps {
  teacherId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

import { AttendanceStatus } from '../../types';

interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  arrivalTime?: string;
}

export const AttendanceDailyEntry: React.FC<AttendanceDailyEntryProps> = ({
  teacherId,
  onSuccess,
  onError
}) => {
  const [classes, setClasses] = useState<any[]>([]);
  // Fix: Use local date string to avoid UTC shift issues
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon'>('morning');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, AttendanceEntry>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await ClassesService.getAll();
        setClasses(data);
      } catch (err) {
        console.error("Error loading classes", err);
        setError("Erreur lors du chargement des classes");
      }
    };
    fetchClasses();
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setAttendanceEntries({});
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const data = await ClassesService.getStudents(selectedClass);
        setStudents(data);

        // Initialize entries
        const initialEntries: Record<string, AttendanceEntry> = {};
        data.forEach((s: any) => {
          initialEntries[s.id] = {
            studentId: s.id,
            status: AttendanceStatus.PRESENT // Default to present
          };
        });
        setAttendanceEntries(initialEntries);
      } catch (err) {
        console.error("Error loading students", err);
        setError("Erreur lors du chargement des élèves");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Load existing attendance when class/date changes
  useEffect(() => {
    const loadAttendance = async () => {
      // ❌ REMOVED - This line was causing the perception of data loss!
      // Clear entries first to avoid stale data flashing
      // setAttendanceEntries({});

      if (!selectedClass || !selectedDate || students.length === 0) return;

      setLoadingAttendance(true);
      console.log(`[AttendanceDailyEntry] 🔄 Loading attendance for class=${selectedClass}, date=${selectedDate}, session=${selectedSession}`);

      try {
        const records = await AttendanceService.getDailyAttendance(selectedClass, selectedDate, selectedSession);
        console.log(`[AttendanceDailyEntry] ✅ Loaded ${records?.length || 0} attendance records:`, records);

        if (records && records.length > 0) {
          setAttendanceEntries(prev => {
            const next: Record<string, AttendanceEntry> = {};
            // Initialize with all students as present first (default state)
            students.forEach(s => {
              next[s.id] = {
                studentId: s.id,
                status: AttendanceStatus.PRESENT
              };
            });

            // Overlay existing records
            let updatedCount = 0;
            records.forEach((r: any) => {
              // Ensure loose comparison for IDs if needed, or strict if confident
              // Using strict string comparison
              if (next[r.studentId]) {
                console.log(`[Attendance] Updating ${r.student?.lastName}: ${r.status}`);
                next[r.studentId] = {
                  ...next[r.studentId],
                  status: r.status as AttendanceStatus,
                  arrivalTime: r.arrivalTime
                };
                updatedCount++;
              } else {
                console.warn(`[Attendance] WARNING: Record found for studentId ${r.studentId} but student not in list!`);
              }
            });
            console.log(`[Attendance] Automatically applied ${updatedCount} updates`);
            return next;
          });
        } else {
          // No records found for this period -> Reset to default (Present)
          const initialEntries: Record<string, AttendanceEntry> = {};
          students.forEach(s => {
            initialEntries[s.id] = {
              studentId: s.id,
              status: AttendanceStatus.PRESENT
            };
          });
          setAttendanceEntries(initialEntries);
        }
      } catch (err) {
        console.error("Error loading existing attendance", err);
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadAttendance();
  }, [selectedClass, selectedDate, selectedSession, students]);

  // Handle status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        arrivalTime: status === AttendanceStatus.LATE ? new Date().toTimeString().slice(0, 5) : undefined,
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

    const attendanceData = Object.values(attendanceEntries).map((entry: AttendanceEntry) => ({
      studentId: entry.studentId,
      classId: selectedClass,
      date: selectedDate, // Send strictly YYYY-MM-DD string to avoid timezone shifts
      session: selectedSession,
      period: selectedSession, // Send period to backend
      status: entry.status,
      arrivalTime: entry.arrivalTime,
      recordedBy: teacherId,
    }));

    console.log('🚀 [FRONTEND] Submitting Attendance Data:', {
      count: attendanceData.length,
      sample: attendanceData[0],
      period: selectedSession
    });

    setLoading(true);
    setError('');
    setSuccess('');

    const startTime = Date.now();

    try {
      const results = await AttendanceService.createBulk(attendanceData);

      const duration = Date.now() - startTime;
      const sentCount = attendanceData.length;
      const receivedCount = results.length;

      if (receivedCount === sentCount) {
        setSuccess(`Validé: ${receivedCount}/${sentCount} enregistrements confirmés par la base de données (${(duration / 1000).toFixed(1)}s)`);
        if (onSuccess) onSuccess();
      } else {
        // Partial success case (should be rare with transactions)
        setError(`Attention: Seuls ${receivedCount} sur ${sentCount} enregistrements ont été confirmés.`);
      }
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
        status: AttendanceStatus.PRESENT,
      };
    });
    setAttendanceEntries(entries);
  };

  const markAllAbsent = () => {
    const entries: Record<string, AttendanceEntry> = {};
    students.forEach(student => {
      entries[student.id] = {
        studentId: student.id,
        status: AttendanceStatus.ABSENT,
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
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                setLoadingAttendance(true);
                console.log(`[Manual Reload] Triggers for Class: ${selectedClass}, Date: ${selectedDate}`);
                try {
                  const records = await AttendanceService.getDailyAttendance(selectedClass, selectedDate, selectedSession);
                  console.log(`[Manual Reload] Records found: ${records?.length}`);
                  if (records && records.length > 0) {
                    setAttendanceEntries(prev => {
                      const next = { ...prev };
                      let matchCount = 0;
                      records.forEach((r: any) => {
                        if (next[r.studentId]) {
                          next[r.studentId] = {
                            ...next[r.studentId],
                            status: r.status as AttendanceStatus,
                            arrivalTime: r.arrivalTime
                          };
                          matchCount++;
                        } else {
                          console.warn(`[Manual Reload] Mismatch! Record for student ${r.studentId} not found in current student list`);
                        }
                      });
                      console.log(`[Manual Reload] Updated ${matchCount} entries from ${records.length} records`);
                      return next;
                    });
                    setSuccess("Données rechargées avec succès");
                    setTimeout(() => setSuccess(''), 3000);
                  } else {
                    setError("Aucune donnée trouvée pour cette date");
                    setTimeout(() => setError(''), 3000);
                  }
                } catch (e) {
                  console.error(e);
                  setError("Erreur lors du rechargement");
                } finally {
                  setLoadingAttendance(false);
                }
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none flex items-center"
            >
              🔄 Recharger Données
            </button>
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
                              onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${attendanceEntries[student.id]?.status === AttendanceStatus.PRESENT
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                              ✅ Présent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${attendanceEntries[student.id]?.status === AttendanceStatus.ABSENT
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                              ❌ Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${attendanceEntries[student.id]?.status === AttendanceStatus.LATE
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                              ⏰ Retard
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attendanceEntries[student.id]?.status === AttendanceStatus.LATE && (
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
