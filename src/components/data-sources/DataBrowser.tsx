import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TableData {
  columns: string[];
  rows: any[];
  total: number;
}

interface DataBrowserProps {
  tableName: string;
  apiUrl: string;
  onClose: () => void;
}

export default function DataBrowser({ tableName, apiUrl, onClose }: DataBrowserProps) {
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({});
  const limit = 50;

  useEffect(() => {
    loadData();
  }, [page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Map table names to actual API endpoints
      const endpointMap: Record<string, string> = {
        students: '/students',
        teachers: '/teachers',
        classes: '/classes',
        subjects: '/subjects',
        grades: '/grades',
        attendance: '/attendance',
        users: '/users',
        documents: '/documents',
        transactions: '/finance',
        school_events: '/school-life/events',
        school_incidents: '/school-life/incidents',
        school_associations: '/school-life/associations',
        inventory: '/inventory',
        timetable_slots: '/timetable',
      };

      const endpoint = endpointMap[tableName] || `/${tableName}`;
      const response = await axios.get(`${apiUrl}${endpoint}`, {
        params: {
          page,
          limit,
          search: search || undefined,
        },
      });

      // Handle different response formats
      const items = response.data.data || response.data.items || response.data || [];
      const total = response.data.total || response.data.meta?.total || items.length;

      if (items.length > 0) {
        const columns = Object.keys(items[0]);
        setData({
          columns,
          rows: items,
          total,
        });
      } else {
        setData({ columns: [], rows: [], total: 0 });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setData({ columns: [], rows: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rowIndex: number) => {
    setEditingRow(rowIndex);
    setEditedData({ ...data?.rows[rowIndex] });
  };

  const handleSave = async (rowIndex: number) => {
    try {
      const row = data?.rows[rowIndex];
      const id = row?.id || row?.uuid;

      if (!id) {
        alert('❌ Impossible de sauvegarder: ID manquant');
        return;
      }

      const endpointMap: Record<string, string> = {
        students: '/students',
        teachers: '/teachers',
        classes: '/classes',
        subjects: '/subjects',
        grades: '/grades',
        attendance: '/attendance',
        users: '/users',
        documents: '/documents',
        transactions: '/finance',
        school_events: '/school-life/events',
        school_incidents: '/school-life/incidents',
        school_associations: '/school-life/associations',
        inventory: '/inventory',
        timetable_slots: '/timetable',
      };

      const endpoint = endpointMap[tableName] || `/${tableName}`;
      await axios.put(`${apiUrl}${endpoint}/${id}`, editedData);

      alert('✅ Données sauvegardées avec succès!');
      setEditingRow(null);
      loadData();
    } catch (error: any) {
      console.error('Error saving data:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleDelete = async (rowIndex: number) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette ligne?')) {
      return;
    }

    try {
      const row = data?.rows[rowIndex];
      const id = row?.id || row?.uuid;

      if (!id) {
        alert('❌ Impossible de supprimer: ID manquant');
        return;
      }

      const endpointMap: Record<string, string> = {
        students: '/students',
        teachers: '/teachers',
        classes: '/classes',
        subjects: '/subjects',
        grades: '/grades',
        attendance: '/attendance',
        users: '/users',
        documents: '/documents',
        transactions: '/finance',
        school_events: '/school-life/events',
        school_incidents: '/school-life/incidents',
        school_associations: '/school-life/associations',
        inventory: '/inventory',
        timetable_slots: '/timetable',
      };

      const endpoint = endpointMap[tableName] || `/${tableName}`;
      await axios.delete(`${apiUrl}${endpoint}/${id}`);

      alert('✅ Ligne supprimée avec succès!');
      loadData();
    } catch (error: any) {
      console.error('Error deleting data:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  if (loading && !data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <i className='bx bx-loader-alt bx-spin text-4xl text-blue-600'></i>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i className='bx bx-table text-blue-600'></i>
              Table: {tableName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {data?.total || 0} enregistrements • Page {page} sur {totalPages}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className='bx bx-x text-2xl text-gray-600'></i>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <i className='bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => loadData()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <i className='bx bx-refresh'></i>
              Actualiser
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-6">
          {data && data.rows.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {data.columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                    {data.columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-gray-800">
                        {editingRow === rowIndex ? (
                          <input
                            type="text"
                            value={editedData[col] ?? row[col] ?? ''}
                            onChange={(e) =>
                              setEditedData({ ...editedData, [col]: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="truncate block max-w-xs">
                            {row[col]?.toString() || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {editingRow === rowIndex ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSave(rowIndex)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            <i className='bx bx-check'></i> Sauver
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                          >
                            <i className='bx bx-x'></i> Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(rowIndex)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          >
                            <i className='bx bx-edit'></i> Éditer
                          </button>
                          <button
                            onClick={() => handleDelete(rowIndex)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            <i className='bx bx-trash'></i> Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <i className='bx bx-data text-4xl mb-2'></i>
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Affichage {Math.min((page - 1) * limit + 1, data?.total || 0)} à{' '}
            {Math.min(page * limit, data?.total || 0)} sur {data?.total || 0}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors"
            >
              <i className='bx bx-chevron-left'></i> Précédent
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors"
            >
              Suivant <i className='bx bx-chevron-right'></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
