import React, { useState } from 'react';
import { DataManagementService } from '../../services/api/data-management.service';

interface MigrationWizardProps {
  onMigrationComplete?: () => void;
}

export const MigrationWizard: React.FC<MigrationWizardProps> = ({
  onMigrationComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [currentYear, setCurrentYear] = useState<string>(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [newYear, setNewYear] = useState<string>(`${new Date().getFullYear() + 1}-${new Date().getFullYear() + 2}`);
  const [options, setOptions] = useState({
    archiveGrades: true,
    createNewClasses: true,
    promotionMapping: {} as Record<string, string>,
  });
  const [preview, setPreview] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const levelTransitions: Record<string, string> = {
    'CP': 'CE1',
    'CE1': 'CE2',
    'CE2': 'CM1',
    'CM1': 'CM2',
    'CM2': '6ème',
    '6ème': '5ème',
    '5ème': '4ème',
    '4ème': '3ème',
    '3ème': '2nde',
    '2nde': '1ère',
    '1ère': 'Terminale',
  };

  const handlePreview = async () => {
    setLoading(true);
    setError('');

    try {
      const previewData = await DataManagementService.previewMigration(currentYear, newYear);
      setPreview(previewData);
      setStep(3);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement de l\'aperçu';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    const confirmed = window.confirm(
      `⚠️ ATTENTION: Cette action est IRRÉVERSIBLE\n\n` +
      `Migration: ${currentYear} → ${newYear}\n\n` +
      `Opérations prévues:\n` +
      `- ${preview?.classesToCreate || 0} nouvelles classes créées\n` +
      `- ${preview?.studentsToMigrate || 0} élèves migrés\n` +
      `- ${preview?.gradesToArchive || 0} notes archivées\n\n` +
      `⚠️ Assurez-vous d'avoir créé une SAUVEGARDE récente.\n\n` +
      `Voulez-vous continuer ?`
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      const startTime = Date.now();
      const executionResult = await DataManagementService.executeMigration(
        currentYear,
        newYear,
        options
      );
      const duration = Date.now() - startTime;

      setResult({ ...executionResult, duration });
      setStep(5);

      if (onMigrationComplete) {
        onMigrationComplete();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'exécution de la migration';
      setError(errorMsg);
      setStep(6); // Error step
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    const confirmed = window.confirm(
      'Voulez-vous vraiment annuler cette migration ?\n\n' +
      'Les données migrées seront supprimées et l\'année précédente sera restaurée.'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      await DataManagementService.rollbackMigration(result.migrationId);
      alert('✅ Migration annulée avec succès');
      setStep(1);
      setResult(null);
      setPreview(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du rollback';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="migration-wizard space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">🔄 Assistant de Migration d'Année Scolaire</h1>
        <p className="text-purple-100">Étape {step}/6 - Migration automatisée avec prévisualisation</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {s === 1 && 'Années'}
                {s === 2 && 'Options'}
                {s === 3 && 'Aperçu'}
                {s === 4 && 'Confirmation'}
                {s === 5 && 'Exécution'}
                {s === 6 && 'Résultat'}
              </p>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Select Years */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📅 Étape 1: Sélection des Années Scolaires
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année académique actuelle
              </label>
              <input
                type="text"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                placeholder="2024-2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle année académique
              </label>
              <input
                type="text"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2025-2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">ℹ️</span>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Format attendu</p>
                  <p>Les années scolaires doivent être au format: AAAA-AAAA (ex: 2024-2025)</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!currentYear || !newYear}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Suivant: Options de migration →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Migration Options */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ⚙️ Étape 2: Options de Migration
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="archiveGrades"
                checked={options.archiveGrades}
                onChange={(e) => setOptions({ ...options, archiveGrades: e.target.checked })}
                className="h-5 w-5 text-purple-600 border-gray-300 rounded"
              />
              <label htmlFor="archiveGrades" className="ml-3 text-sm text-gray-900">
                Archiver les notes de l'année actuelle
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="createNewClasses"
                checked={options.createNewClasses}
                onChange={(e) => setOptions({ ...options, createNewClasses: e.target.checked })}
                className="h-5 w-5 text-purple-600 border-gray-300 rounded"
              />
              <label htmlFor="createNewClasses" className="ml-3 text-sm text-gray-900">
                Créer automatiquement les nouvelles classes (promotion automatique)
              </label>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Mapping des transitions de niveau (promotion automatique)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(levelTransitions).map(([from, to]) => (
                  <div key={from} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{from}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium text-purple-600">{to}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Attention</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Les élèves de Terminale ne seront pas migrés automatiquement (fin de scolarité)</li>
                    <li>Les redoublants devront être gérés manuellement après la migration</li>
                    <li>Créez une sauvegarde complète avant de continuer</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                ← Retour
              </button>
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-300"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Chargement...
                  </>
                ) : (
                  'Prévisualiser la migration →'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && preview && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            👁️ Étape 3: Aperçu de la Migration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Classes actuelles</p>
              <p className="text-3xl font-bold text-blue-600">{preview.currentClasses || 0}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Nouvelles classes à créer</p>
              <p className="text-3xl font-bold text-green-600">{preview.classesToCreate || 0}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Élèves à migrer</p>
              <p className="text-3xl font-bold text-purple-600">{preview.studentsToMigrate || 0}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Notes à archiver</p>
              <p className="text-3xl font-bold text-yellow-600">{preview.gradesToArchive || 0}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Fin de scolarité</p>
              <p className="text-3xl font-bold text-red-600">{preview.endOfSchooling || 0}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Redoublants (manuel)</p>
              <p className="text-3xl font-bold text-orange-600">{preview.toReview || 0}</p>
            </div>
          </div>

          {/* Transitions Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Détail des transitions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classe actuelle
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      →
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nouvelle classe
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Élèves
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.transitions?.map((transition: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transition.fromClass}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-purple-600">→</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                        {transition.toClass}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {transition.studentCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              ← Modifier options
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Continuer vers confirmation →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ✅ Étape 4: Confirmation Finale
          </h2>

          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <span className="text-4xl mr-4">⚠️</span>
              <div>
                <p className="text-lg font-bold text-red-800 mb-2">
                  ATTENTION: Action Irréversible
                </p>
                <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                  <li>Cette migration va modifier la base de données de manière permanente</li>
                  <li>Assurez-vous d'avoir créé une sauvegarde complète AVANT de continuer</li>
                  <li>En cas d'erreur, seul un rollback manuel sera possible (si sauvegarde disponible)</li>
                  <li>Prévoyez une fenêtre de maintenance (durée estimée: 5-10 minutes)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="font-medium text-blue-800 mb-2">Récapitulatif de la migration:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Année source: <strong>{currentYear}</strong></li>
              <li>• Année cible: <strong>{newYear}</strong></li>
              <li>• {preview?.classesToCreate || 0} classes à créer</li>
              <li>• {preview?.studentsToMigrate || 0} élèves à migrer</li>
              <li>• {preview?.gradesToArchive || 0} notes à archiver</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              ← Retour à l'aperçu
            </button>
            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-300"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Migration en cours...
                </>
              ) : (
                '🚀 LANCER LA MIGRATION'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success Result */}
      {step === 5 && result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ✅ Étape 5: Migration Réussie!
          </h2>

          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <span className="text-4xl mr-4">🎉</span>
              <div>
                <p className="text-lg font-bold text-green-800 mb-2">
                  Migration terminée avec succès
                </p>
                <p className="text-sm text-green-700">
                  Toutes les opérations ont été exécutées correctement. L'année scolaire {newYear} est maintenant active.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Classes créées</p>
              <p className="text-3xl font-bold text-blue-600">{result.classesCreated || 0}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Élèves migrés</p>
              <p className="text-3xl font-bold text-green-600">{result.studentsMigrated || 0}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Notes archivées</p>
              <p className="text-3xl font-bold text-yellow-600">{result.gradesArchived || 0}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Durée de la migration: <strong>{result.duration}ms</strong></p>
            <p className="text-sm text-gray-600">ID de migration: <strong>{result.migrationId}</strong></p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
            >
              Retour au tableau de bord
            </button>
            {result.errors && result.errors.length > 0 && (
              <button
                onClick={handleRollback}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:bg-gray-300"
              >
                {loading ? 'Rollback...' : 'Annuler la migration'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 6: Error Result */}
      {step === 6 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ❌ Erreur lors de la Migration
          </h2>

          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <span className="text-4xl mr-4">🚨</span>
              <div>
                <p className="text-lg font-bold text-red-800 mb-2">
                  La migration a échoué
                </p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Recommencer depuis le début
            </button>
            <button
              onClick={handleRollback}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:bg-gray-300"
            >
              {loading ? 'Rollback...' : 'Annuler la migration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
