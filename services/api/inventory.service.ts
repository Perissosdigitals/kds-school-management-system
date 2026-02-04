import { httpClient } from '../httpClient';
import type { InventoryItem } from '../../types';

export const InventoryService = {
  /**
   * Récupère tous les articles d'inventaire
   */
  async getInventoryItems(params?: { page?: number; limit?: number }): Promise<InventoryItem[]> {
    try {
      console.log('InventoryService: Requête API pour l\'inventaire...');
      const response = await httpClient.get<InventoryItem[]>('/inventory', { params });
      return response.data;
    } catch (error) {
      console.error('InventoryService: Erreur API lors du chargement de l\'inventaire', error);
      throw error;
    }
  },

  /**
   * Récupère un article par ID
   */
  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    try {
      console.log(`InventoryService: Récupération de l'article ${id}...`);
      const response = await httpClient.get<InventoryItem>(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`InventoryService: Erreur lors de la récupération de l'article ${id}`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel article
   */
  async createInventoryItem(itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    try {
      console.log('InventoryService: Création d\'un nouvel article...');
      const response = await httpClient.post<InventoryItem>('/inventory', itemData);
      return response.data;
    } catch (error) {
      console.error('InventoryService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour un article
   */
  async updateInventoryItem(id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      console.log(`InventoryService: Mise à jour de l'article ${id}...`);
      const response = await httpClient.put<InventoryItem>(`/inventory/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('InventoryService: Erreur lors de la mise à jour', error);
      throw error;
    }
  }
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  return InventoryService.getInventoryItems();
};
