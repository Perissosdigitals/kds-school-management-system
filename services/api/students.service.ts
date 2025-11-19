import { httpClient } from '../httpClient';
import { allStudents } from '../../data/mockData';
import type { Student } from '../../types';

export const StudentsService = {
  /**
   * Récupère la liste de tous les élèves
   */
  async getStudents(params?: { page?: number; limit?: number }): Promise<Student[]> {
    try {
      console.log('StudentsService: Requête API pour les élèves...');
      const response = await httpClient.get<Student[]>('/students', { params });
      return response.data;
    } catch (error) {
      console.warn('StudentsService: Erreur API, utilisation des données mock', error);
      return allStudents;
    }
  },

  /**
   * Récupère un élève par ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    try {
      console.log(`StudentsService: Récupération de l'élève ${id}...`);
      const response = await httpClient.get<Student>(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`StudentsService: Erreur lors de la récupération de l'élève ${id}`, error);
      return allStudents.find(s => s.id === id) || null;
    }
  },

  /**
   * Crée un nouvel élève
   */
  async createStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    try {
      console.log('StudentsService: Création d\'un nouvel élève...');
      const response = await httpClient.post<Student>('/students', studentData);
      return response.data;
    } catch (error) {
      console.error('StudentsService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour un élève
   */
  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    try {
      console.log(`StudentsService: Mise à jour de l'élève ${id}...`);
      const response = await httpClient.put<Student>(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('StudentsService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime un élève
   */
  async deleteStudent(id: string): Promise<void> {
    try {
      console.log(`StudentsService: Suppression de l'élève ${id}...`);
      await httpClient.delete(`/students/${id}`);
    } catch (error) {
      console.error('StudentsService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};
