/**
 * 🔍 Data Preview Modal
 * Browse and search through database tables with pagination
 * Supports relational data display (e.g., grades with student names)
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DataPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  table: string;
  title: string;
}

interface PreviewData {
  table: string;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function DataPreviewModal({ isOpen, onClose, table, title }: DataPreviewProps) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

  useEffect(() => {
    if (isOpen && table) {
      loadData(page, search);
    }
  }, [isOpen, table, page, search]);

  const loadData = async (currentPage: number, searchTerm: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/data/preview/${table}`, {
        params: {
          page: currentPage,
          limit: 50,
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to load preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderTableHeaders = () => {
    if (!data || data.data.length === 0) return null;

    const firstRow = data.data[0];
    const headers = Object.keys(firstRow);

    return (
      <tr>
        {headers.map((header) => (
          <th
            key={header}
            className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 sticky top-0"
          >
            {header.replace(/_/g, ' ')}
          </th>
        ))}
      </tr>
    );
  };

  const renderTableRows = () => {
    if (!data || data.data.length === 0) {
      return (
        <tr>
          <td colSpan={100} className="px-6 py-12 text-center text-gray-500">
            <i className='bx bx-data text-4xl mb-2'></i>
            <p>Aucune donnée trouvée</p>
          </td>
        </tr>
      );
    }

    return data.data.map((row, index) => (
      <tr key={index} className="border-b hover:bg-gray-50">
        {Object.entries(row).map(([key, value], cellIndex) => (
          <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900">
            {value !== null && value !== undefined
              ? typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)
              : '-'}
          </td>
        ))}
      </tr>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-7xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className='bx bx-table text-3xl text-white'></i>
                <div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="text-sm text-blue-100">
                    {data ? `${data.pagination.total} enregistrements` : 'Chargement...'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <i className='bx bx-x text-3xl'></i>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <i className='bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <i className='bx bx-search mr-2'></i>
                Rechercher
              </button>
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSearchInput('');
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  <i className='bx bx-x'></i>
                </button>
              )}
            </div>
          </div>

          {/* Table content */}
          <div className="max-h-[60vh] overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <i className='bx bx-loader-alt bx-spin text-4xl text-blue-600'></i>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>{renderTableHeaders()}</thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {data.pagination.page} sur {data.pagination.totalPages}
                <span className="ml-4">
                  ({((data.pagination.page - 1) * data.pagination.limit) + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} sur {data.pagination.total})
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className='bx bx-chevron-left'></i>
                  Précédent
                </button>
                <button
                  onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <i className='bx bx-chevron-right'></i>
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataPreviewModal;
