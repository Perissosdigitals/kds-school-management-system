/**
 * 📝 Import Template Generator Component
 * Generates CSV templates with real relational data
 */

import React, { useState } from 'react';
import { ImportTemplateService } from '../../services/api/import-template.service';

export function ImportTemplateGenerator() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerateTemplate = async (templateId: string) => {
    setGenerating(templateId);
    
    try {
      let template;
      
      switch (templateId) {
        case 'students':
          template = await ImportTemplateService.generateStudentsTemplate();
          break;
        case 'grades':
          template = await ImportTemplateService.generateGradesTemplate();
          break;
        case 'attendance':
          template = await ImportTemplateService.generateAttendanceTemplate();
          break;
        default:
          return;
      }

      ImportTemplateService.downloadTemplate(template);
      
      // Show success notification
      alert(`✅ Template "${template.filename}" téléchargé avec succès!${template.relationalInfo ? '\n\n' + template.relationalInfo : ''}`);
    } catch (error) {
      console.error('Failed to generate template:', error);
      alert('❌ Erreur lors de la génération du template');
    } finally {
      setGenerating(null);
    }
  };

  const templates = ImportTemplateService.getAvailableTemplates();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <i className='bx bx-download text-2xl text-blue-600'></i>
          Générateur de Templates d'Import
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Générez des templates CSV pré-remplis avec vos données réelles pour faciliter l'import
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <i className={`bx ${template.hasRelations ? 'bx-git-repo-forked' : 'bx-table'} text-2xl text-blue-600`}></i>
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
              </div>
              {template.hasRelations && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  Relationnel
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {template.description}
            </p>

            {template.hasRelations && (
              <div className="mb-4 p-2 bg-purple-50 border-l-2 border-purple-400 rounded">
                <p className="text-xs text-purple-800">
                  <i className='bx bx-info-circle'></i> Ce template inclut les noms d'élèves réels pour faciliter la saisie
                </p>
              </div>
            )}

            <button
              onClick={() => handleGenerateTemplate(template.id)}
              disabled={generating === template.id}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {generating === template.id ? (
                <>
                  <i className='bx bx-loader-alt bx-spin'></i>
                  Génération...
                </>
              ) : (
                <>
                  <i className='bx bx-download'></i>
                  Télécharger Template
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <i className='bx bx-bulb'></i>
          Comment utiliser les templates relationnels?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Les templates <strong>Notes</strong> et <strong>Présences</strong> incluent les noms d'élèves réels de votre base</li>
          <li>Le <code className="bg-blue-100 px-1 py-0.5 rounded">student_code</code> est utilisé pour faire la correspondance</li>
          <li>Les noms sont affichés pour faciliter la saisie et la vérification</li>
          <li>Vous pouvez modifier les exemples et ajouter vos propres données</li>
          <li>Assurez-vous que le <code className="bg-blue-100 px-1 py-0.5 rounded">student_code</code> existe dans votre base</li>
        </ul>
      </div>
    </div>
  );
}

export default ImportTemplateGenerator;
