import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { FinancialTransaction } from '../types';
import { StatCard } from './ui/StatCard';
import { FilterInput, FilterSelect } from './ui/FilterControls';
import { exportToCSV, exportCSVTemplate } from '../utils/csvExport';
import { ImportCSVModal } from './ui/ImportCSVModal';
import { ExportCSVModal } from './ui/ExportCSVModal';
import { TransactionDetailModal } from './ui/TransactionDetailModal';
import { getTransactions } from '../services/api/finances.service';
import { LoadingSpinner } from './ui/LoadingSpinner';

type Period = 'all' | 'month' | 'quarter' | 'year' | 'custom';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

const TransactionRow = React.memo(({ transaction, onRowClick }: { transaction: FinancialTransaction, onRowClick: (t: FinancialTransaction) => void }) => (
    <tr className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(transaction)}>
        <td className="px-6 py-4">{transaction.date}</td>
        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
        {transaction.description}
        </th>
        <td className="px-6 py-4">{transaction.studentName}</td>
        <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            transaction.type === 'Paiement Scolarité' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
            {transaction.type}
        </span>
        </td>
        <td className="px-6 py-4 font-mono font-medium text-right whitespace-nowrap">{formatCurrency(transaction.amount)}</td>
        <td className="px-6 py-4 text-center">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            transaction.status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        }`}>
            {transaction.status}
        </span>
        </td>
    </tr>
));

export const Finances: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePeriod, setActivePeriod] = useState<Period>('all');
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
        setIsLoading(true);
        const data = await getTransactions();
        setTransactions(data);
        setIsLoading(false);
    }
    loadTransactions();
  }, []);

  const handleDateSort = useCallback(() => {
    setDateSortOrder(current => {
      if (current === 'desc') return 'asc';
      if (current === 'asc') return null;
      return 'desc';
    });
  }, []);

  const handlePeriodChange = useCallback((period: Period) => {
    setActivePeriod(period);
    const today = new Date();
    let start = '';
    let end = '';

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (period) {
        case 'month':
            start = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
            end = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
            break;
        case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            start = formatDate(new Date(today.getFullYear(), quarter * 3, 1));
            end = formatDate(new Date(today.getFullYear(), quarter * 3 + 3, 0));
            break;
        case 'year':
            start = formatDate(new Date(today.getFullYear(), 0, 1));
            end = formatDate(new Date(today.getFullYear(), 11, 31));
            break;
        case 'all':
        default:
            start = '';
            end = '';
            break;
    }
    setStartDate(start);
    setEndDate(end);
  }, []);

  const filteredTransactions = useMemo(() => {
    const parseDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    let results = transactions.filter(t => {
        const studentName = t.studentName || '';
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = selectedGrade ? t.gradeLevel === selectedGrade : true;
        const matchesType = selectedType ? t.type === selectedType : true;
        const matchesStatus = selectedStatus ? t.status === selectedStatus : true;
        
        const matchesDate = (() => {
            if (!startDate && !endDate) return true;
            const parts = t.date.split('/');
            if (parts.length !== 3) return false;
            const [day, month, year] = parts;
            const transactionDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            const isAfterStartDate = startDate ? transactionDateStr >= startDate : true;
            const isBeforeEndDate = endDate ? transactionDateStr <= endDate : true;
            
            return isAfterStartDate && isBeforeEndDate;
        })();

        return matchesSearch && matchesGrade && matchesType && matchesStatus && matchesDate;
    });

    if (dateSortOrder) { 
        results.sort((a, b) => {
            const dateA = parseDate(a.date).getTime();
            const dateB = parseDate(b.date).getTime();
            return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    return results;
  }, [transactions, searchTerm, selectedGrade, selectedType, selectedStatus, startDate, endDate, dateSortOrder]);
  
  const handleConfirmExport = useCallback((selectedHeaders: string[]) => {
    exportToCSV(filteredTransactions, 'rapport_financier', selectedHeaders);
    setIsExportModalOpen(false);
  }, [filteredTransactions]);

  const handleImport = useCallback((importedData: FinancialTransaction[]) => {
    const newTransactions = importedData.map((t, index) => ({
      ...t,
      id: t.id || `TRN-IMPORT-${Date.now()}-${index}`,
      amount: Number(t.amount) || 0,
    }));
    setTransactions(prev => [...prev, ...newTransactions]);
    alert(`${newTransactions.length} transaction(s) importée(s) avec succès !`);
  }, []);

  const handleRowClick = useCallback((transaction: FinancialTransaction) => {
      setSelectedTransaction(transaction);
  }, []);
  
  const handleCloseDetailModal = useCallback(() => setSelectedTransaction(null), []);

  const transactionHeaders = ['id', 'date', 'description', 'studentName', 'gradeLevel', 'type', 'amount', 'status'];
  
  const handleExportTemplate = useCallback(() => {
    exportCSVTemplate(transactionHeaders, 'modele_import_transactions');
  }, [transactionHeaders]);


  const totalRevenue = filteredTransactions.filter(t => t.status === 'Payé').reduce((sum, t) => sum + t.amount, 0);
  const tuitionFees = filteredTransactions.filter(t => t.type === 'Paiement Scolarité' && t.status === 'Payé').reduce((sum, t) => sum + t.amount, 0);
  const subsidiesAndGrants = filteredTransactions.filter(t => (t.type === 'Subvention' || t.type === 'Bourse') && t.status === 'Payé').reduce((sum, t) => sum + t.amount, 0);
  const outstandingBalance = filteredTransactions.filter(t => t.status === 'En attente').reduce((sum, t) => sum + t.amount, 0);

  const uniqueGrades = useMemo(() => [...new Set(transactions.map(t => t.gradeLevel).filter(Boolean))].sort(), [transactions]);

  const PeriodButton: React.FC<{ period: Period, label: string }> = ({ period, label }) => {
    const isActive = activePeriod === period;
    return (
        <button
            onClick={() => handlePeriodChange(period)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-700 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-blue-100 border border-slate-300'
            }`}
        >
            {label}
        </button>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Gestion Financière</h2>
        <p className="text-gray-500">Suivi des frais de scolarité, subventions et soldes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total des Revenus (Période)" value={formatCurrency(totalRevenue)} icon="bxs-bank" color="border-green-600 bg-green-500" />
        <StatCard title="Frais de Scolarité (Période)" value={formatCurrency(tuitionFees)} icon="bxs-graduation" color="border-blue-700 bg-blue-500" />
        <StatCard title="Subventions & Bourses (Période)" value={formatCurrency(subsidiesAndGrants)} icon="bxs-gift" color="border-purple-600 bg-purple-500" />
        <StatCard title="Soldes Impayés (Période)" value={formatCurrency(outstandingBalance)} icon="bxs-error-circle" color="border-amber-500 bg-amber-400" />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-slate-800">Historique des Transactions</h3>
            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                    <i className='bx bx-plus-circle'></i>
                    <span>Ajouter Paiement</span>
                </button>
                 <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                    <i className='bx bx-gift'></i>
                    <span>Ajouter Subvention/Bourse</span>
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

        <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Période :</span>
                <PeriodButton period="all" label="Toute la période" />
                <PeriodButton period="month" label="Ce mois-ci" />
                <PeriodButton period="quarter" label="Ce trimestre" />
                <PeriodButton period="year" label="Cette année" />
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label htmlFor="search" className="text-sm font-medium text-slate-600 block mb-1">Rechercher par nom d'élève / source</label>
                        <FilterInput type="text" id="search" placeholder="Nom, source..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="start-date" className="text-sm font-medium text-slate-600 block mb-1">Date de début</label>
                        <FilterInput type="date" id="start-date" value={startDate} onChange={e => { setStartDate(e.target.value); setActivePeriod('custom'); }} />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="text-sm font-medium text-slate-600 block mb-1">Date de fin</label>
                        <FilterInput type="date" id="end-date" value={endDate} onChange={e => { setEndDate(e.target.value); setActivePeriod('custom'); }} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="grade" className="text-sm font-medium text-slate-600 block mb-1">Filtrer par classe</label>
                        <FilterSelect id="grade" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                            <option value="">Toutes les classes</option>
                            {uniqueGrades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                        </FilterSelect>
                    </div>
                    <div>
                        <label htmlFor="type" className="text-sm font-medium text-slate-600 block mb-1">Filtrer par type</label>
                        <FilterSelect id="type" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                            <option value="">Tous les types</option>
                            <option value="Paiement Scolarité">Paiement Scolarité</option>
                            <option value="Subvention">Subvention</option>
                            <option value="Bourse">Bourse</option>
                        </FilterSelect>
                    </div>
                    <div>
                        <label htmlFor="status" className="text-sm font-medium text-slate-600 block mb-1">Filtrer par statut</label>
                        <FilterSelect id="status" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                            <option value="">Tous les statuts</option>
                            <option value="Payé">Payé</option>
                            <option value="En attente">En attente</option>
                        </FilterSelect>
                    </div>
                </div>
            </div>
        </div>

        {isLoading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        <button className="flex items-center gap-1.5 hover:text-slate-900 transition-colors" onClick={handleDateSort}>
                            <span>Date</span>
                            {dateSortOrder === 'asc' && <i className='bx bx-sort-up'></i>}
                            {dateSortOrder === 'desc' && <i className='bx bx-sort-down'></i>}
                            {!dateSortOrder && <i className='bx bx-sort text-slate-400'></i>}
                        </button>
                    </th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3">Élève / Source</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3 text-right min-w-[170px]">Montant</th>
                    <th scope="col" className="px-6 py-3 text-center">Statut</th>
                </tr>
                </thead>
                <tbody>
                {filteredTransactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} onRowClick={handleRowClick} />
                ))}
                {filteredTransactions.length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                            <i className='bx bx-info-circle text-4xl mb-2'></i>
                            <p>Aucune transaction ne correspond à vos critères de recherche.</p>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>
      <ImportCSVModal<FinancialTransaction>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importer des Transactions depuis un CSV"
        expectedHeaders={transactionHeaders}
      />
      <ExportCSVModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirmExport={handleConfirmExport}
        allHeaders={transactionHeaders}
        title="Exporter le Rapport Financier"
        recordCount={filteredTransactions.length}
      />
      <TransactionDetailModal 
        isOpen={!!selectedTransaction}
        onClose={handleCloseDetailModal}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Finances;