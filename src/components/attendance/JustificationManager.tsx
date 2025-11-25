import React, { useState, useEffect } from 'react';
import { AttendanceService } from '../../services/api/attendance.service';

interface JustificationManagerProps {
  parentId: string;
  childrenIds: string[];
}

export const JustificationManager: React.FC<JustificationManagerProps> = ({
  parentId,
  childrenIds,
}) => {
  const [unjustified, setUnjustified] = useState<any[]>([]);
  const [justified, setJustified] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedAbsence, setSelectedAbsence] = useState<any>(null);
  const [justificationReason, setJustificationReason] = useState<string>('');
  const [justificationDocument, setJustificationDocument] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadAbsences();
  }, [childrenIds]);

  const loadAbsences = async () => {
    setLoading(true);
    setError('');

    try {
      const allAbsences: any[] = [];

      for (const childId of childrenIds) {
        const filters = {
          status: 'absent',
        };
        const childAbsences = await AttendanceService.getByStudent(childId, filters);
        allAbsences.push(...childAbsences);
      }

      // Separate unjustified and justified
      const unjustifiedList = allAbsences.filter((a: any) => !a.isJustified);
      const justifiedList = allAbsences.filter((a: any) => a.isJustified);

      setUnjustified(unjustifiedList);
      setJustified(justifiedList);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des absences';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJustify = async () => {
    if (!selectedAbsence || !justificationReason.trim()) {
      alert('Veuillez sélectionner une absence et fournir une raison.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Check RBAC: parent can only justify own children
      if (!childrenIds.includes(selectedAbsence.studentId)) {
        throw new Error('Vous ne pouvez justifier que les absences de vos propres enfants.');
      }

      const documentUrl = justificationDocument 
        ? await uploadDocument(justificationDocument) 
        : null;

      await AttendanceService.updateJustification(
        selectedAbsence.id, 
        justificationReason, 
        documentUrl
      );

      alert('✅ Absence justifiée avec succès');
      
      // Reset form
      setSelectedAbsence(null);
      setJustificationReason('');
      setJustificationDocument(null);

      // Reload absences
      await loadAbsences();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la justification';
      setError(errorMsg);
      
      // If 403 Forbidden, emphasize RBAC violation
      if (err.response?.status === 403) {
        alert('🚫 Accès refusé: Vous ne pouvez justifier que les absences de vos propres enfants.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const uploadDocument = async (file: File): Promise<string> => {
    // TODO: Implement actual file upload to server/S3
    // For now, return a mock URL
    return `https://storage.example.com/justifications/${Date.now()}_${file.name}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5 MB');
        return;
      }

      // Validate file type (images, PDF)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format accepté: JPG, PNG, PDF uniquement');
        return;
      }

      setJustificationDocument(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Chargement des absences...</p>
      </div>
    );
  }

  if (error && !selectedAbsence) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="justification-manager space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">📝 Justification d'Absences</h1>
        <p className="text-orange-100">
          {childrenIds.length} enfant(s) • {unjustified.length} absence(s) non justifiée(s)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <p className="font-medium text-blue-800">
              Informations importantes
            </p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
              <li>Vous pouvez justifier uniquement les absences de vos propres enfants</li>
              <li>Documents acceptés: JPG, PNG, PDF (max 5 MB)</li>
              <li>Les justifications sont envoyées pour validation à l'administration</li>
              <li>Délai recommandé: 48h après l'absence</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Unjustified Absences */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
          <h2 className="text-xl font-semibold text-gray-800">
            ⚠️ Absences Non Justifiées ({unjustified.length})
          </h2>
        </div>
        <div className="p-6">
          {unjustified.length > 0 ? (
            <div className="space-y-4">
              {unjustified.map((absence: any) => (
                <div
                  key={absence.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAbsence?.id === absence.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAbsence(absence)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedAbsence?.id === absence.id}
                        onChange={() => setSelectedAbsence(absence)}
                        className="mr-4 h-5 w-5 text-orange-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {absence.studentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(absence.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Session: {absence.session === 'morning' ? 'Matin ☀️' : 'Après-midi 🌙'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                      Non justifiée
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              ✅ Aucune absence non justifiée
            </p>
          )}
        </div>
      </div>

      {/* Justification Form */}
      {selectedAbsence && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Justifier l'absence sélectionnée
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de l'absence <span className="text-red-500">*</span>
              </label>
              <textarea
                value={justificationReason}
                onChange={(e) => setJustificationReason(e.target.value)}
                placeholder="Ex: Maladie (fièvre), Rendez-vous médical, Décès familial..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {justificationReason.length}/500 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document justificatif (optionnel)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {justificationDocument && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Fichier sélectionné: {justificationDocument.name} (
                  {(justificationDocument.size / 1024).toFixed(1)} KB)
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formats acceptés: JPG, PNG, PDF • Taille max: 5 MB
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleJustify}
                disabled={submitting || !justificationReason.trim()}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Envoi en cours...
                  </>
                ) : (
                  '✅ Justifier cette absence'
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedAbsence(null);
                  setJustificationReason('');
                  setJustificationDocument(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Justified Absences History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
          <h2 className="text-xl font-semibold text-gray-800">
            ✅ Absences Justifiées ({justified.length})
          </h2>
        </div>
        <div className="p-6">
          {justified.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raison
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {justified.map((absence: any) => (
                    <tr key={absence.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {absence.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(absence.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {absence.session === 'morning' ? '☀️ Matin' : '🌙 Après-midi'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {absence.justificationReason || 'Non spécifiée'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {absence.justificationDocument ? (
                          <a
                            href={absence.justificationDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            📄 Voir
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucun</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Aucune absence justifiée pour le moment
            </p>
          )}
        </div>
      </div>

      {/* RBAC Notice */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">🔒 Sécurité et Contrôle d'Accès</p>
        <p>
          Seuls les parents peuvent justifier les absences de leurs propres enfants. 
          Toute tentative d'accès non autorisé sera enregistrée et signalée (code HTTP 403).
        </p>
      </div>
    </div>
  );
};
