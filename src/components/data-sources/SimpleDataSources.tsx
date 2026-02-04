import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { APIConfigService } from '../../services/api/config.service';
import DataBrowser from './DataBrowser';

interface DataSource {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'active' | 'inactive' | 'unknown';
  description: string;
  environment: string;
}

interface Stats {
  students: number;
  teachers: number;
  classes: number;
}

export default function SimpleDataSources() {
  const [config, setConfig] = useState(APIConfigService.getConfiguration());
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [browserOpen, setBrowserOpen] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apiUrl = config.apiBaseUrl;

      // Fetch actual counts from NestJS endpoints
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        axios.get(`${apiUrl}/students/stats/count`).catch(() => ({ data: { count: -1 } })),
        axios.get(`${apiUrl}/teachers/stats/count`).catch(() => ({ data: { count: -1 } })),
        axios.get(`${apiUrl}/classes/stats/count`).catch(() => ({ data: { count: -1 } }))
      ]);

      setStats({
        students: studentsRes.data.count !== -1 ? studentsRes.data.count : 0,
        teachers: teachersRes.data.count !== -1 ? teachersRes.data.count : 0,
        classes: classesRes.data.count !== -1 ? classesRes.data.count : 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setStats({
        students: 0,
        teachers: 0,
        classes: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnections = async () => {
    setChecking(true);
    try {
      const response = await axios.get(`${config.apiBaseUrl}/health`);
      if (response.data) {
        alert('✅ Connexion réussie!\n\nLe backend PostgreSQL + NestJS est opérationnel.');
      }
    } catch (error) {
      alert('❌ Erreur de connexion\n\nLe backend ne répond pas.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <i className='bx bx-loader-alt bx-spin text-4xl text-blue-600'></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sources de Données</h2>
            <p className="text-blue-100">Gérez et visualisez vos connexions de base de données</p>
          </div>
          <i className='bx bxs-data text-5xl opacity-30'></i>
        </div>
      </div>

      {/* Active Source Info */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <i className='bx bxs-server text-3xl text-blue-600'></i>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {config.activeDataSource.name}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Type:</strong> {config.activeDataSource.type.toUpperCase()}</p>
              <p><strong>Environnement:</strong> {config.activeDataSource.environment}</p>
              <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{config.activeDataSource.url}</code></p>
              <p className="text-gray-500">{config.activeDataSource.description}</p>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                <i className='bx bx-check-circle'></i>
                Actif
              </span>
            </div>
          </div>
          <button
            onClick={checkConnections}
            disabled={checking}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <i className={`bx bx-refresh ${checking ? 'bx-spin' : ''}`}></i>
            Vérifier
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className='bx bxs-user-detail text-2xl text-blue-600'></i>
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.students}</span>
            </div>
            <h4 className="text-gray-600 font-medium">Élèves</h4>
            <p className="text-sm text-gray-500 mt-1">Total élèves inscrits</p>
            <button
              onClick={() => setBrowserOpen('students')}
              className="mt-3 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
            >
              <i className='bx bx-search'></i>
              Parcourir les données
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className='bx bxs-chalkboard text-2xl text-green-600'></i>
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.teachers}</span>
            </div>
            <h4 className="text-gray-600 font-medium">Enseignants</h4>
            <p className="text-sm text-gray-500 mt-1">Personnel enseignant actif</p>
            <button
              onClick={() => setBrowserOpen('teachers')}
              className="mt-3 w-full text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
            >
              <i className='bx bx-search'></i>
              Parcourir les données
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className='bx bxs-school text-2xl text-purple-600'></i>
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.classes}</span>
            </div>
            <h4 className="text-gray-600 font-medium">Classes</h4>
            <p className="text-sm text-gray-500 mt-1">Classes disponibles</p>
            <button
              onClick={() => setBrowserOpen('classes')}
              className="mt-3 w-full text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
            >
              <i className='bx bx-search'></i>
              Parcourir les données
            </button>
          </div>
        </div>
      )}

      {/* 3-Tier Data Architecture */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Architecture 3-Tiers</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">PostgreSQL → D1 → CSV</span>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1 text-center">
              <div className="text-2xl mb-1">🗄️</div>
              <div className="font-bold text-blue-900">Local PostgreSQL</div>
              <div className="text-xs text-blue-700">Développement</div>
            </div>
            <div className="text-blue-400 text-2xl mx-2">→</div>
            <div className="flex-1 text-center">
              <div className="text-2xl mb-1">☁️</div>
              <div className="font-bold text-purple-900">Cloudflare D1</div>
              <div className="text-xs text-purple-700">Production Cloud</div>
            </div>
            <div className="text-purple-400 text-2xl mx-2">⇄</div>
            <div className="flex-1 text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="font-bold text-green-900">CSV Files</div>
              <div className="text-xs text-green-700">Export/Import</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {config.availableDataSources.map((source) => {
            const getIcon = () => {
              if (source.type === 'postgresql') return 'bxs-data';
              if (source.type === 'cloudflare-d1') return 'bxs-cloud';
              return 'bx-file-blank';
            };

            const getColor = () => {
              if (source.type === 'postgresql') return 'blue';
              if (source.type === 'cloudflare-d1') return 'purple';
              return 'green';
            };

            const color = getColor();

            return (
              <div
                key={source.id}
                className={`p-4 rounded-lg border-2 border-${color}-200 bg-${color}-50`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-${color}-100`}>
                      <i className={`bx ${getIcon()} text-2xl text-${color}-600`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{source.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-${color}-200 text-${color}-800`}>
                          {source.environment}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span><strong>Type:</strong> {source.type.toUpperCase()}</span>
                        {source.url.startsWith('http') && (
                          <span><strong>URL:</strong> <code className="bg-white px-1 rounded">{source.url.split('/api')[0]}</code></span>
                        )}
                      </div>

                      {/* Migration Actions */}
                      {source.id === 'postgresql-local' && (
                        <div className="mt-3 flex gap-2">
                          <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                            <i className='bx bx-cloud-upload'></i>
                            Migrer vers D1
                          </button>
                          <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                            <i className='bx bx-export'></i>
                            Export CSV
                          </button>
                        </div>
                      )}

                      {source.id === 'cloudflare-d1-prod' && (
                        <div className="mt-3 flex gap-2">
                          <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                            <i className='bx bx-export'></i>
                            Export CSV
                          </button>
                          <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                            <i className='bx bx-sync'></i>
                            Sync depuis PostgreSQL
                          </button>
                        </div>
                      )}

                      {source.id === 'csv-export-import' && (
                        <div className="mt-3 flex gap-2">
                          <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                            <i className='bx bx-import'></i>
                            Import vers PostgreSQL
                          </button>
                          <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                            <i className='bx bx-import'></i>
                            Import vers D1
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap bg-green-200 text-green-800`}
                  >
                    ✓ Actif
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Migration Scripts */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className='bx bx-git-branch text-indigo-600'></i>
          Scripts de Migration Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <i className='bx bx-transfer text-purple-600'></i>
              <code className="text-sm font-mono">export-to-d1-normalized.ts</code>
            </div>
            <p className="text-xs text-gray-600">Export PostgreSQL → D1 (schéma normalisé)</p>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <i className='bx bx-import text-purple-600'></i>
              <code className="text-sm font-mono">import-to-d1-direct.ts</code>
            </div>
            <p className="text-xs text-gray-600">Import direct PostgreSQL → D1</p>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <i className='bx bx-export text-green-600'></i>
              <code className="text-sm font-mono">export-to-csv.ts</code>
            </div>
            <p className="text-xs text-gray-600">Export tables ou DB complète en CSV</p>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <i className='bx bx-refresh text-blue-600'></i>
              <code className="text-sm font-mono">reset-d1-schema.sh</code>
            </div>
            <p className="text-xs text-gray-600">Réinitialiser schéma Cloudflare D1</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 flex items-start gap-2">
            <i className='bx bx-info-circle text-blue-600 mt-0.5'></i>
            <span>
              <strong>Note:</strong> Les scripts sont disponibles dans le dossier <code className="bg-white px-1 rounded">/scripts</code>.
              Exécutez-les avec <code className="bg-white px-1 rounded">npm run</code> ou directement avec <code className="bg-white px-1 rounded">tsx</code>.
            </span>
          </p>
        </div>
      </div>

      {/* Tech Stack Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i className='bx bx-code-alt text-purple-600'></i>
          Stack Technique
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🗄️</div>
            <div className="font-semibold text-gray-700">PostgreSQL</div>
            <div className="text-xs text-gray-500">DB Locale</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">☁️</div>
            <div className="font-semibold text-gray-700">Cloudflare D1</div>
            <div className="text-xs text-gray-500">DB Cloud</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🚀</div>
            <div className="font-semibold text-gray-700">NestJS</div>
            <div className="text-xs text-gray-500">Backend API</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚛️</div>
            <div className="font-semibold text-gray-700">React + Vite</div>
            <div className="text-xs text-gray-500">Frontend</div>
          </div>
        </div>
      </div>

      {/* Tables Quick Access */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className='bx bx-table text-indigo-600'></i>
          Accès Rapide aux Tables
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: 'students', label: 'Élèves', icon: 'bx-user', color: 'blue' },
            { name: 'teachers', label: 'Enseignants', icon: 'bx-chalkboard', color: 'green' },
            { name: 'classes', label: 'Classes', icon: 'bx-door-open', color: 'purple' },
            { name: 'subjects', label: 'Matières', icon: 'bx-book', color: 'orange' },
            { name: 'grades', label: 'Notes', icon: 'bx-star', color: 'yellow' },
            { name: 'attendance', label: 'Présences', icon: 'bx-check-circle', color: 'teal' },
            { name: 'users', label: 'Utilisateurs', icon: 'bx-group', color: 'indigo' },
            { name: 'documents', label: 'Documents', icon: 'bx-file', color: 'pink' },
            { name: 'transactions', label: 'Transactions', icon: 'bx-money', color: 'red' },
            { name: 'school_events', label: 'Événements', icon: 'bx-calendar', color: 'cyan' },
            { name: 'school_incidents', label: 'Incidents', icon: 'bx-error', color: 'rose' },
            { name: 'school_associations', label: 'Associations', icon: 'bx-group', color: 'violet' },
            { name: 'inventory', label: 'Inventaire', icon: 'bx-box', color: 'amber' },
            { name: 'timetable_slots', label: 'Emplois du temps', icon: 'bx-time', color: 'lime' },
          ].map((table) => (
            <button
              key={table.name}
              onClick={() => setBrowserOpen(table.name)}
              className={`p-3 border-2 border-${table.color}-200 hover:border-${table.color}-400 bg-${table.color}-50 hover:bg-${table.color}-100 rounded-lg transition-all hover:scale-105 text-left`}
            >
              <i className={`bx ${table.icon} text-${table.color}-600 text-xl mb-1 block`}></i>
              <div className="text-sm font-semibold text-gray-800">{table.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">Cliquer pour parcourir</div>
            </button>
          ))}
        </div>
      </div>

      {/* DataBrowser Modal */}
      {browserOpen && (
        <DataBrowser
          tableName={browserOpen}
          apiUrl={config.apiBaseUrl}
          onClose={() => setBrowserOpen(null)}
        />
      )}
    </div>
  );
}
