import React, { useState } from 'react';
import type { SchoolClass, Teacher, DocumentStatus, DocumentType } from '../../types';
import { FilterInput } from './FilterControls';

export interface DocumentFilters {
    searchTerm: string;
    classId?: string;
    teacherId?: string;
    documentStatus?: DocumentStatus | 'Manquant';
    documentType?: DocumentType;
    progressFilter?: 'complete' | 'partial' | 'missing';
}

interface AdvancedDocumentFiltersProps {
    onFilterChange: (filters: DocumentFilters) => void;
    classes: SchoolClass[];
    teachers: Teacher[];
}

export const AdvancedDocumentFilters: React.FC<AdvancedDocumentFiltersProps> = ({
    onFilterChange,
    classes,
    teachers
}) => {
    const [filters, setFilters] = useState<DocumentFilters>({
        searchTerm: '',
    });

    const handleFilterChange = (key: keyof DocumentFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = { searchTerm: '' };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            {/* Main search bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <FilterInput
                        placeholder="🔍 Rechercher par nom, numéro d'inscription..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all font-bold flex items-center gap-2"
                    >
                        <i className='bx bx-refresh'></i>
                        Réinitialiser ({activeFilterCount})
                    </button>
                )}
            </div>

            {/* Advanced filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filter by class */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <i className='bx bxs-school mr-1'></i>
                        Classe
                    </label>
                    <select
                        value={filters.classId || ''}
                        onChange={(e) => handleFilterChange('classId', e.target.value || undefined)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="">Toutes les classes</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Filter by teacher */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <i className='bx bxs-user-badge mr-1'></i>
                        Enseignant
                    </label>
                    <select
                        value={filters.teacherId || ''}
                        onChange={(e) => handleFilterChange('teacherId', e.target.value || undefined)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="">Tous les enseignants</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.firstName} {t.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter by document status */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <i className='bx bxs-file-doc mr-1'></i>
                        Statut Document
                    </label>
                    <select
                        value={filters.documentStatus || ''}
                        onChange={(e) => handleFilterChange('documentStatus', e.target.value || undefined)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="En attente">⏳ En attente</option>
                        <option value="Validé">✅ Validé</option>
                        <option value="Rejeté">❌ Rejeté</option>
                        <option value="Manquant">📭 Manquant</option>
                    </select>
                </div>

                {/* Filter by progression */}
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                        <i className='bx bxs-bar-chart-alt-2 mr-1'></i>
                        Progression
                    </label>
                    <select
                        value={filters.progressFilter || ''}
                        onChange={(e) => handleFilterChange('progressFilter', e.target.value || undefined)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="">Toutes les progressions</option>
                        <option value="complete">🎯 Dossiers complets (4/4)</option>
                        <option value="partial">📊 Dossiers partiels (1-3/4)</option>
                        <option value="missing">📭 Dossiers vides (0/4)</option>
                    </select>
                </div>
            </div>

            {/* Active filters summary */}
            {activeFilterCount > 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <i className='bx bx-filter-alt'></i>
                    <span className="font-bold">{activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}</span>
                </div>
            )}
        </div>
    );
};
