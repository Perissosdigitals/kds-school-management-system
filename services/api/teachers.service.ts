import { httpClient } from '../httpClient';
import { teacherDetails } from '../../data/mockData';
import type { Teacher } from '../../types';

export const TeachersService = {
  /**
   * Récupère la liste de tous les enseignants
   */
  async getTeachers(params?: { page?: number; limit?: number }): Promise<Teacher[]> {
    try {
      console.log('TeachersService: Requête API pour les enseignants...');
      const response = await httpClient.get<Teacher[]>('/teachers', { params });
      return response.data;
    } catch (error) {
      console.warn('TeachersService: Erreur API, utilisation des données mock', error);
      return teacherDetails;
    }
  },

  /**
   * Récupère un enseignant par ID
   */
  async getTeacherById(id: string): Promise<Teacher | null> {
    try {
      console.log(`TeachersService: Récupération de l'enseignant ${id}...`);
      const response = await httpClient.get<Teacher>(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`TeachersService: Erreur lors de la récupération de l'enseignant ${id}`, error);
      return teacherDetails.find(t => t.id === id) || null;
    }
  },

  /**
   * Crée un nouvel enseignant
   */
  async createTeacher(teacherData: Omit<Teacher, 'id'>): Promise<Teacher> {
    try {
      console.log('TeachersService: Création d\'un nouvel enseignant...');
      const response = await httpClient.post<Teacher>('/teachers', teacherData);
      return response.data;
    } catch (error) {
      console.error('TeachersService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour un enseignant
   */
  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<Teacher> {
    try {
      console.log(`TeachersService: Mise à jour de l'enseignant ${id}...`);
      const response = await httpClient.put<Teacher>(`/teachers/${id}`, teacherData);
      return response.data;
    } catch (error) {
      console.error('TeachersService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime un enseignant
   */
  async deleteTeacher(id: string): Promise<void> {
    try {
      console.log(`TeachersService: Suppression de l'enseignant ${id}...`);
      await httpClient.delete(`/teachers/${id}`);
    } catch (error) {
      console.error('TeachersService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};

// Export pour compatibilité rétroactive
export const getTeachers = async (): Promise<Teacher[]> => {
  return TeachersService.getTeachers();
};
