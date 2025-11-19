import React from 'react';
import type { SchoolClass, Teacher } from '../../types';

export interface StudentFilters {
  searchText: string;
  selectedClass: string;
  selectedTeacher: string;
  selectedStatus: string;
  selectedGender: string;
  startDate: string;
  endDate: string;
}

interface AdvancedStudentFiltersProps {
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  classes: SchoolClass[];
  teachers: Teacher[];
}

export const AdvancedStudentFilters: React.FC<AdvancedStudentFiltersProps> = ({
  filters,
  onFiltersChange,
  classes,
  teachers
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const updateFilter = (key: keyof StudentFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchText: '',
      selectedClass: '',
      selectedTeacher: '',
      selectedStatus: '',
      selectedGender: '',
      startDate: '',
      endDate: ''
    });
  };

  const activeFiltersCount = [
    filters.searchText,
    filters.selectedClass,
    filters.selectedTeacher,
    filters.selectedStatus,
    filters.selectedGender,
    filters.startDate || filters.endDate
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      {/* Header with Search and Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <i className='bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl'></i>
          <input
            type="text"
            placeholder="Rechercher par nom ou prénom..."
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            isExpanded 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className={`bx ${isExpanded ? 'bx-chevron-up' : 'bx-filter-alt'} text-xl`}></i>
          <span>Filtres avancés</span>
          {activeFiltersCount > 0 && !isExpanded && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
            title="Réinitialiser tous les filtres"
          >
            <i className='bx bx-x text-xl'></i>
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Filter by Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className='bx bx-book-reader mr-1'></i>
              Classe
            </label>
            <select
              value={filters.selectedClass}
              onChange={(e) => updateFilter('selectedClass', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.level}>
                  {cls.level} - {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Teacher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className='bx bx-user-circle mr-1'></i>
              Professeur
            </label>
            <select
              value={filters.selectedTeacher}
              onChange={(e) => updateFilter('selectedTeacher', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les professeurs</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} - {teacher.subject}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className='bx bx-info-circle mr-1'></i>
              Statut
            </label>
            <select
              value={filters.selectedStatus}
              onChange={(e) => updateFilter('selectedStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="En attente">En attente</option>
            </select>
          </div>

          {/* Filter by Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className='bx bx-male-female mr-1'></i>
              Genre
            </label>
            <select
              value={filters.selectedGender}
              onChange={(e) => updateFilter('selectedGender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les genres</option>
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
              <option value="M">Masculin (M)</option>
              <option value="F">Féminin (F)</option>
            </select>
          </div>

          {/* Filter by Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className='bx bx-calendar mr-1'></i>
              Date d'inscription (début)
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className='bx bx-calendar mr-1'></i>
              Date d'inscription (fin)
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-600">Filtres actifs:</span>
          
          {filters.searchText && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <i className='bx bx-search-alt'></i>
              "{filters.searchText}"
              <button onClick={() => updateFilter('searchText', '')} className="ml-1 hover:text-blue-900">
                <i className='bx bx-x'></i>
              </button>
            </span>
          )}
          
          {filters.selectedClass && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              <i className='bx bx-book-reader'></i>
              {filters.selectedClass}
              <button onClick={() => updateFilter('selectedClass', '')} className="ml-1 hover:text-purple-900">
                <i className='bx bx-x'></i>
              </button>
            </span>
          )}
          
          {filters.selectedTeacher && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <i className='bx bx-user-circle'></i>
              {teachers.find(t => t.id === filters.selectedTeacher)?.firstName || 'Professeur'}
              <button onClick={() => updateFilter('selectedTeacher', '')} className="ml-1 hover:text-green-900">
                <i className='bx bx-x'></i>
              </button>
            </span>
          )}
          
          {filters.selectedStatus && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
              <i className='bx bx-info-circle'></i>
              {filters.selectedStatus}
              <button onClick={() => updateFilter('selectedStatus', '')} className="ml-1 hover:text-amber-900">
                <i className='bx bx-x'></i>
              </button>
            </span>
          )}
          
          {filters.selectedGender && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
              <i className='bx bx-male-female'></i>
              {filters.selectedGender === 'M' ? 'Masculin' : filters.selectedGender === 'F' ? 'Féminin' : filters.selectedGender}
              <button onClick={() => updateFilter('selectedGender', '')} className="ml-1 hover:text-pink-900">
                <i className='bx bx-x'></i>
              </button>
            </span>
          )}
          
          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              <i className='bx bx-calendar'></i>
              {filters.startDate && new Date(filters.startDate).toLocaleDateString('fr-FR')}
              {filters.startDate && filters.endDate && ' → '}
              {filters.endDate && new Date(filters.endDate).toLocaleDateString('fr-FR')}
              <button 
                onClick={() => {
                  updateFilter('startDate', '');
                  updateFilter('endDate', '');
                }} 
                className="ml-1 hover:text-indigo-900"
              >
                <i className='bx bx-x'></i>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
