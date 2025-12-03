/**
 * 📊 Data Sources Management Component
 * Provides complete visibility and control over database connections
 * Shows active data source, available sources, and import options
 */

import React, { useState, useEffect } from 'react';
import { APIConfigService, type DataSource, type APIConfiguration } from '../../services/api/config.service';
import { DataPreviewModal } from './DataPreviewModal';
import { ImportTemplateGenerator } from './ImportTemplateGenerator';
import axios from 'axios';

export function DataSourcesManagement() {
  const [config, setConfig] = useState<APIConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'database' | 'files' | 'environment' | 'templates'>('sources');
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; table: string; title: string }>({
    isOpen: false,
    table: '',
    title: '',
  });
  const [verifyingStudent, setVerifyingStudent] = useState(false);
  const [studentVerification, setStudentVerification] = useState<any>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const cfg = APIConfigService.getConfiguration();
      setConfig(cfg);

      // Load database info
      const dbInfo = await APIConfigService.getDatabaseInfo();
      setDatabaseInfo(dbInfo);

      // Load available data files
      const files = await APIConfigService.getAvailableDataFiles();
      setAvailableFiles(files);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAllConnections = async () => {
    if (!config) return;
    
    setChecking(true);
    try {
      const results = await Promise.all(
        config.availableDataSources.map(async (ds) => {
          const isConnected = await APIConfigService.checkDataSourceStatus(ds);
          return { ...ds, status: isConnected ? 'active' : 'inactive' };
        })
      );

      setConfig({
        ...config,
        availableDataSources: results as DataSource[],
      });
    } catch (error) {
      console.error('Failed to check connections:', error);
    } finally {
      setChecking(false);
    }
  };

  const openPreview = (table: string, title: string) => {
    setPreviewModal({ isOpen: true, table, title });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, table: '', title: '' });
  };

  const verifyStudent = async (studentCode: string) => {
    if (!config) return;
    
    setVerifyingStudent(true);
    setStudentVerification(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${config.apiBaseUrl}/data/search-student/${studentCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setStudentVerification({
        found: response.data.found,
        student: response.data.student,
        message: response.data.found 
          ? `✅ Élève trouvé: ${response.data.student.first_name} ${response.data.student.last_name}` 
          : '❌ Élève non trouvé dans la base de données',
      });
    } catch (error: any) {
      setStudentVerification({
        found: false,
        message: error.response?.status === 404 
          ? '❌ Élève non trouvé dans la base de données' 
          : '❌ Erreur lors de la vérification',
      });
    } finally {
      setVerifyingStudent(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'cloudflare-d1':
        return <i className='bx bxs-cloud text-lg'></i>;
      case 'postgresql':
        return <i className='bx bxs-data text-lg'></i>;
      case 'local':
        return <i className='bx bxs-hdd text-lg'></i>;
      default:
        return <i className='bx bxs-server text-lg'></i>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <i className='bx bx-check-circle mr-1'></i>
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            <i className='bx bx-x-circle mr-1'></i>
            Inactive
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <i className='bx bx-error-circle mr-1'></i>
            Unknown
          </span>
        );
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <i className='bx bx-loader-alt bx-spin text-4xl text-blue-600'></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Configuration Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <div className="flex items-start">
          <i className='bx bxs-data text-2xl text-blue-600 mr-3'></i>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Source de Données Active</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {getIconForType(config.activeDataSource.type)}
                <span className="font-semibold text-blue-900">{config.activeDataSource.name}</span>
                {getStatusBadge(config.activeDataSource.status)}
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <div><span className="font-medium">Environnement:</span> <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">{config.currentEnvironment}</span></div>
                <div><span className="font-medium">API URL:</span> <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs break-all">{config.apiBaseUrl}</span></div>
                <div><span className="font-medium">Description:</span> {config.activeDataSource.description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {['sources', 'database', 'templates', 'files', 'environment'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'sources' && 'Sources de Données'}
                {tab === 'database' && 'Base de Données'}
                {tab === 'templates' && 'Templates Import'}
                {tab === 'files' && 'Fichiers d\'Import'}
                {tab === 'environment' && 'Environnement'}
              </button>
            ))}
          </nav>
        </div>

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Sources de Données Disponibles</h3>
                <p className="text-sm text-gray-500">Toutes les connexions de base de données configurées</p>
              </div>
              <button
                onClick={checkAllConnections}
                disabled={checking}
                className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <i className={`bx bx-refresh ${checking ? 'bx-spin' : ''}`}></i>
                Vérifier les Connexions
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Nom</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Environnement</th>
                    <th scope="col" className="px-6 py-3">Statut</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {config.availableDataSources.map((source) => (
                    <tr
                      key={source.id}
                      className={`border-b ${source.id === config.activeDataSource.id ? 'bg-blue-50' : 'bg-white'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getIconForType(source.type)}
                          <span className="font-medium">{source.name}</span>
                          {source.id === config.activeDataSource.id && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500 text-white">Actuel</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{source.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {source.environment}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(source.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {source.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Student Verification Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <i className='bx bx-search-alt text-2xl text-blue-600'></i>
                Vérifier les Données Réelles
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Vérifiez que vous n'êtes pas en mode mock data en recherchant un élève spécifique.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => verifyStudent('KDS24001')}
                  disabled={verifyingStudent}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  <i className={`bx ${verifyingStudent ? 'bx-loader-alt bx-spin' : 'bx-search'}`}></i>
                  Vérifier Jean KOUASSI (KDS24001)
                </button>
              </div>

              {studentVerification && (
                <div className={`mt-4 p-4 rounded-lg ${studentVerification.found ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                  <div className="flex items-start gap-3">
                    <i className={`bx ${studentVerification.found ? 'bx-check-circle text-green-600' : 'bx-x-circle text-red-600'} text-2xl`}></i>
                    <div className="flex-1">
                      <p className={`font-semibold ${studentVerification.found ? 'text-green-900' : 'text-red-900'}`}>
                        {studentVerification.message}
                      </p>
                      {studentVerification.found && studentVerification.student && (
                        <div className="mt-2 text-sm text-green-800 space-y-1">
                          <p><strong>Classe:</strong> {studentVerification.student.class_name || 'Non assigné'}</p>
                          <p><strong>Date de naissance:</strong> {studentVerification.student.birth_date}</p>
                          <p><strong>Genre:</strong> {studentVerification.student.gender}</p>
                          <p className="mt-2 text-xs text-green-700">
                            ✅ Vous utilisez bien les données réelles de Cloudflare D1!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Informations Base de Données</h3>
              {databaseInfo ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500 mb-1">Nom de la Base</div>
                      <div className="text-lg font-semibold text-gray-900">{databaseInfo.name}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500 mb-1">Type</div>
                      <div className="text-lg font-semibold text-gray-900">{databaseInfo.type}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Tables Disponibles</div>
                    <div className="flex flex-wrap gap-2">
                      {databaseInfo.tables.map((table: string) => (
                        <button
                          key={table}
                          onClick={() => openPreview(table, `Aperçu: ${table}`)}
                          className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                          {table}
                          <i className='bx bx-show text-sm'></i>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      <i className='bx bx-info-circle'></i> Cliquez sur une table pour voir son contenu
                    </p>
                  </div>

                  {databaseInfo.recordCounts && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Nombre d'Enregistrements</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left">Table</th>
                              <th className="px-6 py-3 text-right">Enregistrements</th>
                              <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(databaseInfo.recordCounts).map(([table, count]) => (
                              <tr key={table} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium">{table}</td>
                                <td className="px-6 py-3 text-right font-semibold text-blue-600">{count as number}</td>
                                <td className="px-6 py-3 text-center">
                                  <button
                                    onClick={() => openPreview(table, `Aperçu: ${table}`)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded transition-colors"
                                  >
                                    <i className='bx bx-show'></i>
                                    Aperçu
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <i className='bx bx-data text-4xl mb-2'></i>
                  <p>Aucune information de base de données disponible</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <ImportTemplateGenerator />
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Fichiers de Données Disponibles</h3>
            <p className="text-sm text-gray-500 mb-6">Fichiers CSV, JSON et SQL prêts pour l'importation</p>
            
            {availableFiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">Nom du Fichier</th>
                      <th className="px-6 py-3 text-left">Type</th>
                      <th className="px-6 py-3 text-left">Statut</th>
                      <th className="px-6 py-3 text-left">Dernière Modification</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableFiles.map((file) => (
                      <tr key={file.filename} className="border-b">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <i className='bx bx-file'></i>
                            <span className="font-mono text-sm">{file.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">
                            {file.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(file.status)}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(file.lastModified).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm">
                            <i className='bx bx-upload'></i>
                            Importer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <i className='bx bx-file text-4xl mb-2'></i>
                <p>Aucun fichier de données disponible pour l'importation</p>
              </div>
            )}
          </div>
        )}

        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Variables d'Environnement</h3>
            <p className="text-sm text-gray-500 mb-6">Configuration actuelle de l'environnement</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Variable</th>
                    <th className="px-6 py-3 text-left">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(APIConfigService.getEnvironmentInfo()).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="px-6 py-4 font-mono text-sm font-medium">{key}</td>
                      <td className="px-6 py-4 font-mono text-sm bg-gray-50">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview Modal */}
      <DataPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        table={previewModal.table}
        title={previewModal.title}
      />
    </div>
  );
}

export default DataSourcesManagement;
