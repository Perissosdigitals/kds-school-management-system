import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { InventoryItem } from '../types';
import { FilterInput, FilterSelect } from './ui/FilterControls';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { ExportCSVModal } from './ui/ExportCSVModal';
import { InventoryDetailModal } from './ui/InventoryDetailModal';
import { getInventoryItems } from '../services/api/inventory.service';
import { LoadingSpinner } from './ui/LoadingSpinner';

const getStatusChipClass = (status: InventoryItem['stockStatus']) => {
    switch (status) {
        case 'En Stock': return 'bg-green-100 text-green-800';
        case 'Stock Faible': return 'bg-amber-100 text-amber-800';
        case 'En Rupture': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const InventoryRow = React.memo(({ item, onRowClick }: { item: InventoryItem, onRowClick: (item: InventoryItem) => void }) => (
    <tr className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(item)}>
        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
            {item.name}
        </th>
        <td className="px-6 py-4">{item.category}</td>
        <td className="px-6 py-4 text-right font-medium">{item.quantity} <span className="text-xs text-gray-500">{item.unit}</span></td>
        <td className="px-6 py-4 text-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipClass(item.stockStatus)}`}>
                {item.stockStatus}
            </span>
        </td>
        <td className="px-6 py-4">{item.lastUpdated}</td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <button className="text-blue-600 hover:text-blue-800"><i className='bx bxs-edit text-lg'></i></button>
                <button className="text-red-600 hover:text-red-800"><i className='bx bxs-trash text-lg'></i></button>
            </div>
        </td>
    </tr>
));

export const Inventory: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    useEffect(() => {
        const loadInventory = async () => {
            setIsLoading(true);
            const data = await getInventoryItems();
            setInventory(data);
            setIsLoading(false);
        }
        loadInventory();
    }, []);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
            const matchesStatus = selectedStatus ? item.stockStatus === selectedStatus : true;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [inventory, searchTerm, selectedCategory, selectedStatus]);
    
    const handleConfirmExport = useCallback((selectedHeaders: string[]) => {
        exportToCSV(filteredInventory, 'etat_inventaire', selectedHeaders);
        setIsExportModalOpen(false);
    }, [filteredInventory]);

    const handleImport = useCallback((importedData: InventoryItem[]) => {
      const newItems = importedData.map((item, index) => ({
        ...item,
        id: item.id || `INV-IMPORT-${Date.now()}-${index}`,
        quantity: Number(item.quantity) || 0,
      }));
      setInventory(prev => [...prev, ...newItems]);
      alert(`${newItems.length} article(s) importé(s) avec succès !`);
    }, []);
    
    const handleRowClick = useCallback((item: InventoryItem) => {
      setSelectedItem(item);
    }, []);

    const handleCloseDetailModal = useCallback(() => setSelectedItem(null), []);

    const inventoryHeaders = ['id', 'name', 'category', 'quantity', 'unit', 'stockStatus', 'lastUpdated'];
    
    const handleExportTemplate = useCallback(() => {
      exportCSVTemplate(inventoryHeaders, 'modele_import_inventaire');
    }, [inventoryHeaders]);


    const uniqueCategories = useMemo(() => [...new Set(inventory.map(item => item.category))], [inventory]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Gestion de l'Inventaire</h2>
                <p className="text-gray-500">Suivi des uniformes, fournitures et autres matériels.</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-xl font-semibold text-slate-800">Liste des Articles</h3>
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                            <i className='bx bx-plus-circle'></i>
                            <span>Ajouter un Article</span>
                        </button>
                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                            <i className='bx bxs-file-import'></i>
                            <span>Importer CSV</span>
                        </button>
                         <button onClick={handleExportTemplate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300" title="Télécharger un modèle CSV pour l'importation">
                            <i className='bx bxs-download'></i>
                            <span>Télécharger Modèle</span>
                        </button>
                        <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                            <i className='bx bxs-file-export'></i>
                            <span>Exporter CSV</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
                    <div>
                        <label htmlFor="search-item" className="text-sm font-medium text-slate-600">Rechercher un article</label>
                        <FilterInput type="text" id="search-item" placeholder="Nom de l'article..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="category-filter" className="text-sm font-medium text-slate-600">Filtrer par catégorie</label>
                        <FilterSelect id="category-filter" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                            <option value="">Toutes les catégories</option>
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </FilterSelect>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="text-sm font-medium text-slate-600">Filtrer par statut</label>
                        <FilterSelect id="status-filter" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                            <option value="">Tous les statuts</option>
                            <option value="En Stock">En Stock</option>
                            <option value="Stock Faible">Stock Faible</option>
                            <option value="En Rupture">En Rupture</option>
                        </FilterSelect>
                    </div>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nom de l'article</th>
                                    <th scope="col" className="px-6 py-3">Catégorie</th>
                                    <th scope="col" className="px-6 py-3 text-right">Quantité</th>
                                    <th scope="col" className="px-6 py-3 text-center">Statut du Stock</th>
                                    <th scope="col" className="px-6 py-3">Dernière MàJ</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map((item) => (
                                    <InventoryRow key={item.id} item={item} onRowClick={handleRowClick} />
                                ))}
                                {filteredInventory.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-500">
                                            <i className='bx bx-package text-4xl mb-2'></i>
                                            <p>Aucun article ne correspond à vos critères de recherche.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <ImportCSVModal<InventoryItem>
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
                title="Importer l'Inventaire depuis un CSV"
                expectedHeaders={inventoryHeaders}
            />
            <ExportCSVModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onConfirmExport={handleConfirmExport}
                allHeaders={inventoryHeaders}
                title="Exporter l'État de l'Inventaire"
                recordCount={filteredInventory.length}
            />
            <InventoryDetailModal
                isOpen={!!selectedItem}
                onClose={handleCloseDetailModal}
                item={selectedItem}
            />
        </div>
    );
};

export default Inventory;