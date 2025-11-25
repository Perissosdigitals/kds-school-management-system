import React, { useState, useEffect } from 'react';
import { AttendanceService } from '../../services/api/attendance.service';

interface AttendanceStatsDashboardProps {
  academicYear?: string;
}

export const AttendanceStatsDashboard: React.FC<AttendanceStatsDashboardProps> = ({
  academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [mostAbsent, setMostAbsent] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - selectedPeriod);

        const filters = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        };

        // Load global stats
        const statsData = await AttendanceService.getStats(filters);
        setStats(statsData);

        // Load most absent students (global, no specific class)
        const absentData = await AttendanceService.getMostAbsentStudents(null, 10);
        setMostAbsent(absentData);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des statistiques';
        setError(errorMsg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod, academicYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Chargement des statistiques...</p>
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

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucune donnée statistique disponible
      </div>
    );
  }

  return (
    <div className="attendance-stats-dashboard space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">📊 Statistiques de Présence Globales</h1>
        <p className="text-indigo-100">Année académique: {academicYear}</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Période d'analyse</h2>
          <div className="flex space-x-2">
            {[7, 30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedPeriod === days
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {days} jours
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Taux Présence École</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.schoolPresenceRate ? `${stats.schoolPresenceRate.toFixed(1)}%` : '-'}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <span className="text-3xl">✅</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalPresent || 0} présences sur {stats.totalRecords || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Absences</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.totalAbsent || 0}
              </p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <span className="text-3xl">❌</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.unjustifiedAbsences || 0} non justifiées
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Retards</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.totalLate || 0}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <span className="text-3xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sessions Enregistrées</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalSessions || 0}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-3xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📈 Évolution du Taux de Présence
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="font-medium">Graphique d'évolution</p>
            <p className="text-sm mt-1">Intégration Chart.js à venir</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {/* Sample trend indicators */}
          {[92, 94, 91, 95, 93, 96, 94].map((rate, idx) => (
            <div key={idx} className="text-center">
              <div className={`h-20 rounded-t-lg ${rate >= 95 ? 'bg-green-400' : rate >= 90 ? 'bg-green-300' : 'bg-yellow-300'}`} style={{height: `${rate}%`}}></div>
              <p className="text-xs text-gray-600 mt-1">{rate}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Most Absent Students */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
          <h2 className="text-xl font-semibold text-gray-800">
            ⚠️ Top 10 Élèves Absentéistes
          </h2>
        </div>
        <div className="p-6">
          {mostAbsent && mostAbsent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classe
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absences
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Non Justifiées
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taux Présence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mostAbsent.map((student: any, idx: number) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${
                          idx < 3 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.studentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.registrationNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-red-600">
                          {student.totalAbsences}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.unjustifiedCount > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {student.unjustifiedCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-sm font-semibold ${
                          student.presenceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {student.presenceRate ? `${student.presenceRate.toFixed(1)}%` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => alert(`Ouvrir fiche élève ${student.studentId}`)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Voir détails →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun élève absentéiste identifié ✅</p>
          )}
        </div>
      </div>

      {/* Session Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">☀️ Matinée</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux de présence</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.morningPresenceRate ? `${stats.morningPresenceRate.toFixed(1)}%` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absences</span>
              <span className="text-lg font-semibold text-red-600">
                {stats.morningAbsences || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retards</span>
              <span className="text-lg font-semibold text-yellow-600">
                {stats.morningLate || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🌙 Après-midi</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux de présence</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.afternoonPresenceRate ? `${stats.afternoonPresenceRate.toFixed(1)}%` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absences</span>
              <span className="text-lg font-semibold text-red-600">
                {stats.afternoonAbsences || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retards</span>
              <span className="text-lg font-semibold text-yellow-600">
                {stats.afternoonLate || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {stats.schoolPresenceRate && stats.schoolPresenceRate < 85 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🚨</span>
            <div>
              <p className="font-medium text-red-800">
                Alerte: Taux de présence école en dessous du seuil (85%)
              </p>
              <p className="text-sm text-red-700 mt-1">
                Taux actuel: {stats.schoolPresenceRate.toFixed(1)}%. 
                Actions recommandées: Réunion conseil pédagogique, campagne de sensibilisation parents, 
                identification causes principales (santé, transport, désintérêt).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
