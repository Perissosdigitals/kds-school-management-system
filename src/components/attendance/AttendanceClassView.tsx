import React, { useState, useEffect } from 'react';
import { AttendanceService } from '../../services/api/attendance.service';
import { ClassesService } from '../../services/api/classes.service';

interface AttendanceClassViewProps {
  classId: string;
  startDate?: string;
  endDate?: string;
}

export const AttendanceClassView: React.FC<AttendanceClassViewProps> = ({
  classId,
  startDate,
  endDate,
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    startDate: startDate || '',
    endDate: endDate || '',
    session: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        // Load class info
        const classData = await ClassesService.getById(classId);
        setClassInfo(classData);

        // Load students
        const studentsData = await ClassesService.getStudents(classId);
        setStudents(studentsData);

        // Load attendance records
        const attendanceData = await AttendanceService.getByClass(classId, filters);
        setAttendance(attendanceData);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des données';
        setError(errorMsg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      loadData();
    }
  }, [classId, filters]);

  const getStudentStats = (studentId: string) => {
    const studentRecords = attendance.filter((a: any) => a.studentId === studentId);
    const total = studentRecords.length;
    const present = studentRecords.filter((a: any) => a.status === 'present').length;
    const absent = studentRecords.filter((a: any) => a.status === 'absent').length;
    const late = studentRecords.filter((a: any) => a.status === 'late').length;
    const presenceRate = total > 0 ? (present / total) * 100 : 0;

    return { total, present, absent, late, presenceRate };
  };

  const getRecentStatus = (studentId: string) => {
    const studentRecords = attendance
      .filter((a: any) => a.studentId === studentId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return studentRecords[0]?.status || 'N/A';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export
    alert('Fonctionnalité d\'export Excel à venir');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Chargement des présences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="attendance-class-view space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          📊 Présences de la Classe {classInfo?.name || ''}
        </h1>
        <p className="text-purple-100">{students.length} élèves</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session
            </label>
            <select
              value={filters.session}
              onChange={(e) => setFilters({ ...filters, session: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Toutes</option>
              <option value="morning">Matin</option>
              <option value="afternoon">Après-midi</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ startDate: '', endDate: '', session: '' })}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Liste des Élèves</h2>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom Complet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Présences
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absences
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retards
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux Présence
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student: any, idx: number) => {
                const stats = getStudentStats(student.id);
                const recentStatus = getRecentStatus(student.id);

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.lastName} {student.firstName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-green-600">
                        {stats.present}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-semibold ${
                        stats.absent > 5 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stats.absent}
                        {stats.absent > 5 && ' ⚠️'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-yellow-600">
                        {stats.late}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-semibold ${
                        stats.presenceRate >= 90 ? 'text-green-600' :
                        stats.presenceRate >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stats.presenceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(recentStatus)}`}>
                        {recentStatus === 'present' ? '✅ Présent' :
                         recentStatus === 'absent' ? '❌ Absent' :
                         recentStatus === 'late' ? '⏰ Retard' :
                         'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-Risk Students Alert */}
      {students.filter((s: any) => getStudentStats(s.id).absent > 5).length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-medium text-red-800">
                Élèves à surveiller ({students.filter((s: any) => getStudentStats(s.id).absent > 5).length})
              </p>
              <p className="text-sm text-red-700 mt-1">
                Ces élèves ont plus de 5 absences. Intervention recommandée.
              </p>
              <ul className="mt-2 text-sm text-red-700">
                {students
                  .filter((s: any) => getStudentStats(s.id).absent > 5)
                  .map((s: any) => (
                    <li key={s.id}>
                      • {s.lastName} {s.firstName} - {getStudentStats(s.id).absent} absences
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
