import React, { useState, useEffect } from 'react';
import { GradesService } from '../../services/api/grades.service';
import { ClassesService } from '../../services/api/classes.service';

interface AdminGradeDashboardProps {
  academicYear?: string;
}

export const AdminGradeDashboard: React.FC<AdminGradeDashboardProps> = ({
  academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedTrimester, setSelectedTrimester] = useState<string>('Trimestre 1');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await GradesService.getAdminStats(academicYear);
        setStats(data);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des statistiques';
        setError(errorMsg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [academicYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Chargement du dashboard administrateur...</p>
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
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="admin-grade-dashboard space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">🎓 Dashboard Administrateur</h1>
        <p className="text-purple-100">Vue d'ensemble - Année académique: {academicYear}</p>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalClasses || 0}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Élèves</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.totalStudents || 0}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Professeurs</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalTeachers || 0}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Notes Totales</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.totalGrades || 0}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Moyenne Établissement</p>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.schoolAverage ? stats.schoolAverage.toFixed(2) : '-'}/20
              </p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Trimester Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Filtrer par trimestre</h2>
          <select
            value={selectedTrimester}
            onChange={(e) => setSelectedTrimester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
          </select>
        </div>
      </div>

      {/* Classes Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Performing Classes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-800">🏆 Meilleures Classes</h3>
          </div>
          <div className="p-6">
            {stats.topClasses && stats.topClasses.length > 0 ? (
              <div className="space-y-3">
                {stats.topClasses.slice(0, 5).map((cls: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📊'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cls.className}</p>
                        <p className="text-xs text-gray-500">{cls.studentCount} élèves</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {cls.average.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Données insuffisantes</p>
            )}
          </div>
        </div>

        {/* Classes Needing Attention */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h3 className="text-lg font-semibold text-gray-800">⚠️ Classes en Difficulté</h3>
          </div>
          <div className="p-6">
            {stats.bottomClasses && stats.bottomClasses.length > 0 ? (
              <div className="space-y-3">
                {stats.bottomClasses.slice(0, 5).map((cls: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cls.className}</p>
                        <p className="text-xs text-gray-500">{cls.studentCount} élèves</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {cls.average.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Toutes les classes au-dessus de 10/20 ✅</p>
            )}
          </div>
        </div>
      </div>

      {/* Subjects Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Performance par Matière</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matière
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes Saisies
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moyenne
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note Min
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note Max
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.subjectsPerformance && stats.subjectsPerformance.map((subject: any) => (
                <tr key={subject.subjectId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subject.subjectName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900">
                      {subject.totalGrades}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-semibold ${
                      subject.average >= 14 ? 'text-green-600' :
                      subject.average >= 10 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subject.average.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900">
                      {subject.minGrade.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900">
                      {subject.maxGrade.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      subject.trend === 'up' ? 'bg-green-100 text-green-800' :
                      subject.trend === 'down' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {subject.trend === 'up' ? '📈 Hausse' :
                       subject.trend === 'down' ? '📉 Baisse' :
                       '➡️ Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => window.location.href = '/data/export'}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Exporter les notes</p>
              <p className="text-sm text-gray-500">Excel, CSV, PDF</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/data/backups'}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Sauvegardes</p>
              <p className="text-sm text-gray-500">Créer, restaurer</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/data/validate'}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Validation données</p>
              <p className="text-sm text-gray-500">Vérifier intégrité</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
