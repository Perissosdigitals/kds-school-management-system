import React, { useState, useEffect } from 'react';
import { AttendanceService } from '../../services/api/attendance.service';

interface AttendanceStudentViewProps {
  studentId: string;
  days?: number;
}

export const AttendanceStudentView: React.FC<AttendanceStudentViewProps> = ({
  studentId,
  days = 60,
}) => {
  const [pattern, setPattern] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    const loadPattern = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await AttendanceService.getStudentPattern(studentId, days);
        setPattern(data);
        
        // Set current month as default
        const now = new Date();
        setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des présences';
        setError(errorMsg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadPattern();
    }
  }, [studentId, days]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⏰';
      default: return '❓';
    }
  };

  const filterRecordsByMonth = () => {
    if (!pattern?.records || !selectedMonth) return [];
    
    const [year, month] = selectedMonth.split('-');
    return pattern.records.filter((record: any) => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === parseInt(year) && 
             recordDate.getMonth() + 1 === parseInt(month);
    });
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
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

  if (!pattern) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucune donnée de présence disponible
      </div>
    );
  }

  const monthRecords = filterRecordsByMonth();

  return (
    <div className="attendance-student-view space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">📅 Mon Relevé de Présences</h1>
        <p className="text-blue-100">Historique sur {days} jours</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Taux de Présence</p>
              <p className="text-3xl font-bold text-green-600">
                {pattern.statistics?.presenceRate 
                  ? `${pattern.statistics.presenceRate.toFixed(1)}%` 
                  : '-'}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Jours Présents</p>
              <p className="text-3xl font-bold text-blue-600">
                {pattern.statistics?.totalPresent || 0}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-3xl">📘</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Absences</p>
              <p className="text-3xl font-bold text-red-600">
                {pattern.statistics?.totalAbsent || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pattern.statistics?.unjustifiedAbsences || 0} non justifiées
              </p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <span className="text-3xl">❌</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Retards</p>
              <p className="text-3xl font-bold text-yellow-600">
                {pattern.statistics?.totalLate || 0}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <span className="text-3xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Calendrier des Présences</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {generateMonthOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {monthRecords.map((record: any, idx: number) => {
            const date = new Date(record.date);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <div
                key={idx}
                className={`
                  ${getStatusColor(record.status)} 
                  rounded-lg p-4 text-center text-white
                  ${isWeekend ? 'opacity-50' : ''}
                  hover:shadow-lg transition-shadow cursor-pointer
                `}
                title={`${date.toLocaleDateString('fr-FR')} - ${record.status} ${
                  record.status === 'late' && record.arrivalTime 
                    ? `à ${record.arrivalTime}` 
                    : ''
                }${
                  record.status === 'absent' && record.isJustified 
                    ? ' (justifiée)' 
                    : ''
                }`}
              >
                <div className="text-xs font-semibold">{date.getDate()}</div>
                <div className="text-2xl mt-1">{getStatusEmoji(record.status)}</div>
                {record.status === 'late' && record.arrivalTime && (
                  <div className="text-xs mt-1">{record.arrivalTime}</div>
                )}
                {record.status === 'absent' && record.isJustified && (
                  <div className="text-xs mt-1">✓</div>
                )}
              </div>
            );
          })}
        </div>

        {monthRecords.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Aucune donnée de présence pour ce mois
          </p>
        )}
      </div>

      {/* Unjustified Absences */}
      {pattern.statistics?.unjustifiedAbsences > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">
                {pattern.statistics.unjustifiedAbsences} absence(s) non justifiée(s)
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Veuillez demander à vos parents de justifier ces absences auprès de l'administration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Report */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            // TODO: Implement download monthly report
            alert('Fonctionnalité de téléchargement à venir');
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Télécharger le relevé mensuel
        </button>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Légende</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Présent ✅</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Absent ❌</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Retard ⏰</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Pas de cours</span>
          </div>
        </div>
      </div>
    </div>
  );
};
