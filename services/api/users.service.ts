import { httpClient } from '../httpClient';
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
      console.error('UsersService: Erreur API lors de la récupération des utilisateurs', error);
      throw error;
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
      console.error(`UsersService: Erreur lors de la récupération de l'utilisateur ${id}`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      console.log('UsersService: Création d\'un nouvel utilisateur...');
      // Map frontend snake_case to backend camelCase DTO strictly
      const payload = {
        email: userData.email,
        // @ts-ignore - password exists in userData despite Omit<User, 'id'> typing in frontend
        password: (userData as any).password,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone: userData.phone,
        isActive: userData.is_active,
      };

      const response = await httpClient.post<User>('/users', payload);
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
      // Map frontend snake_case to backend camelCase DTO
      const payload: any = { ...userData };
      if (userData.first_name) payload.firstName = userData.first_name;
      if (userData.last_name) payload.lastName = userData.last_name;
      if (userData.is_active !== undefined) payload.isActive = userData.is_active;

      const response = await httpClient.put<User>(`/users/${id}`, payload);
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
  },

  /**
   * Met à jour les permissions d'un utilisateur
   */
  async updatePermissions(id: string, permissions: Record<string, boolean>): Promise<User> {
    try {
      console.log(`UsersService: Mise à jour des permissions pour ${id}...`);
      const response = await httpClient.patch<User>(`/users/${id}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error('UsersService: Erreur lors de la mise à jour des permissions', error);
      throw error;
    }
  },

  /**
   * Met à jour l'avatar d'un utilisateur
   */
  async updateAvatar(id: string, file: File): Promise<User> {
    try {
      console.log(`UsersService: Mise à jour de l'avatar pour ${id}...`);
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await httpClient.post<User>(`/users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('UsersService: Erreur lors de la mise à jour de l\'avatar', error);
      throw error;
    }
  }
};

export const updatePermissions = async (id: string, permissions: Record<string, boolean>): Promise<User> => {
  return UsersService.updatePermissions(id, permissions);
};

export const updateAvatar = async (id: string, file: File): Promise<User> => {
  return UsersService.updateAvatar(id, file);
};

export const getUsers = async (params?: { page?: number; limit?: number; role?: string; isActive?: boolean }): Promise<User[]> => {
  return UsersService.getUsers(params as any);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  return UsersService.createUser(userData);
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  return UsersService.updateUser(id, userData);
};

export const deleteUser = async (id: string): Promise<void> => {
  return UsersService.deleteUser(id);
};
