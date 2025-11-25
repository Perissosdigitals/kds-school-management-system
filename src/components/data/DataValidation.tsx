import React, { useState } from 'react';
import { DataManagementService } from '../../services/api/data-management.service';

interface DataValidationProps {
  onValidationComplete?: () => void;
}

export const DataValidation: React.FC<DataValidationProps> = ({
  onValidationComplete,
}) => {
  const [reports, setReports] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>('');

  const runValidation = async (dataType: string) => {
    setLoading({ ...loading, [dataType]: true });
    setError('');

    try {
      let report;
      switch (dataType) {
        case 'grades':
          report = await DataManagementService.validateGrades();
          break;
        case 'attendance':
          report = await DataManagementService.validateAttendance();
          break;
        case 'students':
          report = await DataManagementService.validateStudents();
          break;
        case 'all':
          report = await DataManagementService.validateAll();
          break;
        default:
          throw new Error(`Type non supporté: ${dataType}`);
      }

      setReports({ ...reports, [dataType]: report });

      if (onValidationComplete) {
        onValidationComplete();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || `Erreur lors de la validation ${dataType}`;
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading({ ...loading, [dataType]: false });
    }
  };

  const downloadReport = (dataType: string) => {
    const report = reports[dataType];
    if (!report) return;

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation_${dataType}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-50 text-red-700';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <div className="data-validation space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">🔍 Validation d'Intégrité des Données</h1>
        <p className="text-indigo-100">Vérification automatique des contraintes et cohérence</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Validation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grades Validation */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
            <h3 className="text-lg font-semibold text-gray-800">📊 Validation Notes</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Vérifie: notes dans plage valide, élèves/classes/matières existants, 
              pas de doublons, coefficients cohérents.
            </p>
            <button
              onClick={() => runValidation('grades')}
              disabled={loading.grades}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading.grades ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Validation en cours...
                </>
              ) : (
                '🔍 Lancer validation'
              )}
            </button>
          </div>
        </div>

        {/* Attendance Validation */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800">📅 Validation Présences</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Vérifie: pas de doublons date/session/élève, statuts valides, 
              heures retard cohérentes, justifications valides.
            </p>
            <button
              onClick={() => runValidation('attendance')}
              disabled={loading.attendance}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading.attendance ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Validation en cours...
                </>
              ) : (
                '🔍 Lancer validation'
              )}
            </button>
          </div>
        </div>

        {/* Students Validation */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-800">👨‍🎓 Validation Élèves</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Vérifie: matricules uniques, dates naissance valides, 
              classes assignées existantes, champs requis remplis.
            </p>
            <button
              onClick={() => runValidation('students')}
              disabled={loading.students}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading.students ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Validation en cours...
                </>
              ) : (
                '🔍 Lancer validation'
              )}
            </button>
          </div>
        </div>

        {/* All Validation */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
            <h3 className="text-lg font-semibold text-gray-800">🌐 Validation Globale</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Exécute toutes les validations + vérifications croisées: 
              orphelins, intégrité référentielle, cohérence globale.
            </p>
            <button
              onClick={() => runValidation('all')}
              disabled={loading.all}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading.all ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Validation en cours...
                </>
              ) : (
                '🔍 Validation complète'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Reports */}
      {Object.keys(reports).map((dataType) => {
        const report = reports[dataType];
        if (!report) return null;

        const criticalChecks = report.checks?.filter((c: any) => c.severity === 'critical' && !c.passed) || [];
        const errorChecks = report.checks?.filter((c: any) => c.severity === 'error' && !c.passed) || [];
        const warningChecks = report.checks?.filter((c: any) => c.severity === 'warning' && !c.passed) || [];
        const passedChecks = report.checks?.filter((c: any) => c.passed) || [];

        return (
          <div key={dataType} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Rapport de validation: {dataType}
              </h2>
              <button
                onClick={() => downloadReport(dataType)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger JSON
              </button>
            </div>

            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Critiques</p>
                  <p className="text-3xl font-bold text-red-600">
                    {criticalChecks.length}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Erreurs</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {errorChecks.length}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avertissements</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {warningChecks.length}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Vérifications OK</p>
                  <p className="text-3xl font-bold text-green-600">
                    {passedChecks.length}
                  </p>
                </div>
              </div>

              {/* Checks Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vérification
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sévérité
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enregistrements affectés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Détails
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.checks?.map((check: any, idx: number) => (
                      <tr key={idx} className={`hover:bg-gray-50 ${!check.passed ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {check.passed ? (
                            <span className="text-2xl">✅</span>
                          ) : (
                            <span className="text-2xl">{getSeverityIcon(check.severity)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {check.checkName}
                          </div>
                          {check.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {check.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(check.severity)}`}>
                            {check.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-semibold ${check.affectedCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {check.affectedCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {check.errors && check.errors.length > 0 && (
                            <details className="cursor-pointer">
                              <summary className="text-sm text-blue-600 hover:text-blue-800">
                                Voir détails ({check.errors.length})
                              </summary>
                              <ul className="mt-2 text-xs text-gray-700 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                                {check.errors.slice(0, 10).map((error: string, i: number) => (
                                  <li key={i}>{error}</li>
                                ))}
                                {check.errors.length > 10 && (
                                  <li className="text-gray-500">... et {check.errors.length - 10} autre(s)</li>
                                )}
                              </ul>
                            </details>
                          )}
                          {check.suggestions && check.suggestions.length > 0 && (
                            <div className="mt-2 text-xs text-blue-600">
                              💡 {check.suggestions.join(', ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Overall Status */}
              <div className="mt-6 p-4 rounded-lg border-2 ${criticalChecks.length > 0 || errorChecks.length > 0 ? 'bg-red-50 border-red-500' : warningChecks.length > 0 ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'}">
                <p className="font-semibold text-lg">
                  {criticalChecks.length > 0
                    ? '🚨 Problèmes critiques détectés - Action immédiate requise'
                    : errorChecks.length > 0
                    ? '❌ Erreurs détectées - Correction recommandée'
                    : warningChecks.length > 0
                    ? '⚠️ Avertissements - Révision suggérée'
                    : '✅ Toutes les vérifications ont réussi'}
                </p>
                {report.metadata && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Durée: {report.metadata.duration}ms</p>
                    <p>Date: {new Date(report.metadata.timestamp).toLocaleString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
