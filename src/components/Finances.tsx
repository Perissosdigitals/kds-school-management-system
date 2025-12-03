import React, { useState, useEffect } from 'react';
import { FinancesService } from '../services/api/finances.service';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { FinancialTransaction } from '../types';

const Finances: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, balance: 0 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txs, rev, exp, bal] = await Promise.all([
        FinancesService.getTransactions(),
        FinancesService.getTotalRevenue(),
        FinancesService.getTotalExpenses(),
        FinancesService.getBalance()
      ]);

      setTransactions(txs);
      setStats({
        revenue: rev.total,
        expenses: exp.total,
        balance: bal.balance
      });
    } catch (error) {
      console.error('Failed to load finance data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Gestion Financière</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <i className='bx bx-plus'></i>
          Nouvelle Transaction
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Revenus Totaux</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <i className='bx bx-trending-up text-green-600 text-xl'></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.revenue.toLocaleString()} FCFA</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Dépenses Totales</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <i className='bx bx-trending-down text-red-600 text-xl'></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.expenses.toLocaleString()} FCFA</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Solde Net</h3>
            <div className={`p-2 rounded-lg ${stats.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <i className={`bx ${stats.balance >= 0 ? 'bx-wallet' : 'bx-error-circle'} ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} text-xl`}></i>
            </div>
          </div>
          <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {stats.balance.toLocaleString()} FCFA
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Transactions Récentes</h2>
          <div className="flex gap-2">
            <select 
              className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tout voir</option>
              <option value="income">Revenus</option>
              <option value="expense">Dépenses</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(tx.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`flex items-center gap-1 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        <i className={`bx ${tx.type === 'income' ? 'bx-up-arrow-alt' : 'bx-down-arrow-alt'}`}></i>
                        {tx.type === 'income' ? 'Revenu' : 'Dépense'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tx.status === 'completed' ? 'Payé' : tx.status === 'pending' ? 'En attente' : 'Annulé'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finances;
