import { httpClient } from '../httpClient';
import { allUsers } from '../../data/mockData';
import type { User } from '../../types';

export const UsersService = {
  /**
   * Récupère tous les utilisateurs
   */
  async getUsers(params?: { page?: number; limit?: number; role?: string }): Promise<User[]> {
    try {
      console.log('UsersService: Requête API pour les utilisateurs...');
      const response = await httpClient.get<User[]>('/users', { params });
      return response.data;
    } catch (error) {
      console.warn('UsersService: Erreur API, utilisation des données mock', error);
      return allUsers;
    }
  },

  /**
   * Récupère un utilisateur par ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      console.log(`UsersService: Récupération de l'utilisateur ${id}...`);
      const response = await httpClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`UsersService: Erreur lors de la récupération`, error);
      return allUsers.find(u => u.id === id) || null;
    }
  },

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      console.log('UsersService: Création d\'un nouvel utilisateur...');
      const response = await httpClient.post<User>('/users', userData);
      return response.data;
    } catch (error) {
      console.error('UsersService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour un utilisateur
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      console.log(`UsersService: Mise à jour de l'utilisateur ${id}...`);
      const response = await httpClient.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('UsersService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime un utilisateur
   */
  async deleteUser(id: string): Promise<void> {
    try {
      console.log(`UsersService: Suppression de l'utilisateur ${id}...`);
      await httpClient.delete(`/users/${id}`);
    } catch (error) {
      console.error('UsersService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};

export const getUsers = async (): Promise<User[]> => {
  console.log('Fetching users from API...');
  return UsersService.getUsers();
};
