import { httpClient } from '../httpClient';
import { mockTransactions } from '../../data/mockData';
import type { FinancialTransaction } from '../../types';

export const FinancesService = {
  /**
   * Récupère toutes les transactions financières
   */
  async getTransactions(params?: { page?: number; limit?: number; studentId?: string; status?: string }): Promise<FinancialTransaction[]> {
    try {
      console.log('FinancesService: Requête API pour les transactions...');
      const response = await httpClient.get<FinancialTransaction[]>('/finance/transactions', { params });
      return response.data;
    } catch (error) {
      console.warn('FinancesService: Erreur API, utilisation des données mock', error);
      return mockTransactions;
    }
  },

  /**
   * Récupère une transaction par ID
   */
  async getTransactionById(id: string): Promise<FinancialTransaction | null> {
    try {
      console.log(`FinancesService: Récupération de la transaction ${id}...`);
      const response = await httpClient.get<FinancialTransaction>(`/finance/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`FinancesService: Erreur lors de la récupération`, error);
      return mockTransactions.find(t => t.id === id) || null;
    }
  },

  /**
   * Crée une nouvelle transaction
   */
  async createTransaction(transactionData: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> {
    try {
      console.log('FinancesService: Création d\'une nouvelle transaction...');
      const response = await httpClient.post<FinancialTransaction>('/finance/transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('FinancesService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour une transaction
   */
  async updateTransaction(id: string, transactionData: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      console.log(`FinancesService: Mise à jour de la transaction ${id}...`);
      const response = await httpClient.put<FinancialTransaction>(`/finance/transactions/${id}`, transactionData);
      return response.data;
    } catch (error) {
      console.error('FinancesService: Erreur lors de la mise à jour', error);
      throw error;
    }
  }
};

export const getTransactions = async (): Promise<FinancialTransaction[]> => {
  console.log('Fetching financial transactions from API...');
  return FinancesService.getTransactions();
};
