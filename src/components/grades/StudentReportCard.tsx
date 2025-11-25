import React, { useState, useEffect } from 'react';
import { GradesService } from '../../services/api/grades.service';
import type { ReportCard } from '../../types';

interface StudentReportCardProps {
  studentId: string;
  trimester: string;
  academicYear?: string;
  onError?: (error: string) => void;
}

export const StudentReportCard: React.FC<StudentReportCardProps> = ({
  studentId,
  trimester,
  academicYear,
  onError,
}) => {
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadReportCard = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await GradesService.getReportCard(
          studentId,
          trimester,
          academicYear
        );
        setReportCard(data);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erreur lors du chargement du bulletin';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && trimester) {
      loadReportCard();
    }
  }, [studentId, trimester, academicYear, onError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Chargement du bulletin...</p>
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

  if (!reportCard) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucun bulletin disponible pour ce trimestre
      </div>
    );
  }

  return (
    <div className="student-report-card bg-white rounded-lg shadow-md p-8">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          BULLETIN DE NOTES
        </h1>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Élève</p>
            <p className="font-semibold text-lg">{reportCard.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Classe</p>
            <p className="font-semibold text-lg">{reportCard.className}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trimestre</p>
            <p className="font-semibold text-lg">{reportCard.trimester}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Année Académique</p>
            <p className="font-semibold text-lg">{reportCard.academicYear}</p>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matière
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coefficient
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nb Notes
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moyenne /20
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appréciation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportCard.subjects.map((subject) => (
              <tr key={subject.subjectId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {subject.subjectName}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-900">
                    {subject.coefficient}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-900">
                    {subject.grades.length}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-semibold ${
                    subject.average >= 16 ? 'text-green-600' :
                    subject.average >= 14 ? 'text-blue-600' :
                    subject.average >= 10 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {subject.average.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subject.average >= 16 ? 'bg-green-100 text-green-800' :
                    subject.average >= 14 ? 'bg-blue-100 text-blue-800' :
                    subject.average >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {subject.average >= 16 ? 'Excellent' :
                     subject.average >= 14 ? 'Très Bien' :
                     subject.average >= 10 ? 'Bien' :
                     'Insuffisant'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">
                MOYENNE GÉNÉRALE :
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`text-xl font-bold ${
                  reportCard.generalAverage >= 16 ? 'text-green-600' :
                  reportCard.generalAverage >= 14 ? 'text-blue-600' :
                  reportCard.generalAverage >= 10 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {reportCard.generalAverage.toFixed(2)} / 20
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {reportCard.rank && reportCard.totalStudents && (
                  <span className="text-sm font-semibold text-gray-700">
                    {reportCard.rank}e / {reportCard.totalStudents}
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Grades Detail (Collapsible) */}
      <details className="mb-6">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-blue-600 mb-2">
          📊 Détail des notes par matière
        </summary>
        <div className="mt-4 space-y-4">
          {reportCard.subjects.map((subject) => (
            <div key={subject.subjectId} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                {subject.subjectName} - Moyenne: {subject.average.toFixed(2)}/20
              </h4>
              <div className="space-y-1">
                {subject.grades.map((grade, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{grade.title || 'Évaluation'}</span>
                    <span className="font-medium">
                      {grade.value}/{grade.maxValue} (coef {grade.coefficient})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Comments */}
      {reportCard.comments && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Commentaires du Professeur</h3>
          <p className="text-gray-700">{reportCard.comments}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>Document généré le {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="mt-2 text-xs">
          Formule moyenne: Σ(note/noteMax × 20 × coefficient) / Σcoefficients
        </p>
      </div>

      {/* Print Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer le bulletin
        </button>
      </div>
    </div>
  );
};
