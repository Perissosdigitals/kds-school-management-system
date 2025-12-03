import React, { useState } from 'react';
import { DataManagementService } from '../../services/api/data-management.service';
import type { ExportFormat, ExportFilters } from '../../types';
import { DATA_TYPES } from '../../constants/import-templates';

export const DataExportPanel: React.FC = () => {
  // State
  const [dataType, setDataType] = useState<string>('grades');
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [filters, setFilters] = useState<Partial<ExportFilters>>({
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Handle filter change
  const handleFilterChange = (field: keyof ExportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle export
  const handleExport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let blob: Blob;
      let filename: string;

      const exportFilters = {
        ...filters,
        format,
      };

      switch (dataType) {
        case 'grades':
          blob = await DataManagementService.exportGrades(exportFilters);
          filename = `grades_${filters.academicYear}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          break;
        case 'attendance':
          blob = await DataManagementService.exportAttendance(exportFilters);
          filename = `attendance_${filters.academicYear}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          break;
        case 'students':
          blob = await DataManagementService.exportStudents(exportFilters);
          filename = `students_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          break;
        case 'teachers':
          blob = await DataManagementService.exportTeachers(exportFilters);
          filename = `teachers_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          break;
        case 'classes':
          blob = await DataManagementService.exportClasses(exportFilters);
          filename = `classes_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          break;
        case 'enrollments':
          blob = await DataManagementService.exportEnrollments(exportFilters);
          filename = `enrollments_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          break;
        case 'all':
          blob = await DataManagementService.exportAll(exportFilters);
          filename = `ksp_export_all_${filters.academicYear}_${new Date().toISOString().split('T')[0]}.zip`;
          break;
      }

      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Export réussi! Le téléchargement a commencé.');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'export';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-export-panel bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Export de Données
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

      <div className="space-y-6">
        {/* Data Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de données *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ...DATA_TYPES,
              { value: 'all', label: 'Tout', icon: '📦', desc: 'Export complet' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setDataType(type.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${dataType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-semibold text-gray-900">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format d'export *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${format === 'excel'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📗</span>
                <div>
                  <div className="font-semibold text-gray-900">Excel (.xlsx)</div>
                  <div className="text-xs text-gray-500">Recommandé avec graphiques</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${format === 'csv'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📄</span>
                <div>
                  <div className="font-semibold text-gray-900">CSV (.csv)</div>
                  <div className="text-xs text-gray-500">Données brutes</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtres</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année académique
              </label>
              <input
                type="text"
                value={filters.academicYear || ''}
                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024-2025"
              />
            </div>

            {/* Trimester (for grades/attendance) */}
            {(dataType === 'grades' || dataType === 'attendance') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trimestre
                </label>
                <select
                  value={filters.trimester || ''}
                  onChange={(e) => handleFilterChange('trimester', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les trimestres</option>
                  <option value="Trimestre 1">Trimestre 1</option>
                  <option value="Trimestre 2">Trimestre 2</option>
                  <option value="Trimestre 3">Trimestre 3</option>
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date début
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date fin
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe (ID)
              </label>
              <input
                type="text"
                value={filters.classId || ''}
                onChange={(e) => handleFilterChange('classId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="UUID de la classe"
              />
            </div>

            {/* Student Filter (for grades/attendance) */}
            {(dataType === 'grades' || dataType === 'attendance') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Élève (ID)
                </label>
                <input
                  type="text"
                  value={filters.studentId || ''}
                  onChange={(e) => handleFilterChange('studentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UUID de l'élève"
                />
              </div>
            )}

            {/* Subject Filter (for grades) */}
            {dataType === 'grades' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matière (ID)
                </label>
                <input
                  type="text"
                  value={filters.subjectId || ''}
                  onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UUID de la matière"
                />
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFilters({
                academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
              });
              setError('');
              setSuccess('');
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Réinitialiser
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Export en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporter
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">Informations</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Excel:</strong> Inclut graphiques et statistiques</li>
            <li><strong>CSV:</strong> Compatible avec tous logiciels tableur</li>
            <li><strong>Export "Tout":</strong> Génère un fichier ZIP complet</li>
            <li><strong>Performance:</strong> ~2s pour 500 enregistrements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
