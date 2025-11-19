import { httpClient } from '../httpClient';
import { mockSchedule, schoolClasses, teacherDetails } from '../../data/mockData';
import type { TimetableSession, SchoolClass, Teacher } from '../../types';

export interface TimetableData {
    schedule: TimetableSession[];
    classes: SchoolClass[];
    teachers: Teacher[];
}

export const TimetableService = {
  /**
   * Récupère l'emploi du temps
   */
  async getSchedule(params?: { page?: number; limit?: number; classId?: string; teacherId?: string }): Promise<TimetableSession[]> {
    try {
      console.log('TimetableService: Requête API pour l\'emploi du temps...');
      const response = await httpClient.get<TimetableSession[]>('/timetable', { params });
      return response.data;
    } catch (error) {
      console.warn('TimetableService: Erreur API, utilisation des données mock', error);
      return mockSchedule;
    }
  },

  /**
   * Crée une nouvelle séance
   */
  async createSession(sessionData: Omit<TimetableSession, 'id'>): Promise<TimetableSession> {
    try {
      console.log('TimetableService: Création d\'une nouvelle séance...');
      const response = await httpClient.post<TimetableSession>('/timetable', sessionData);
      return response.data;
    } catch (error) {
      console.error('TimetableService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour une séance
   */
  async updateSession(id: string, sessionData: Partial<TimetableSession>): Promise<TimetableSession> {
    try {
      console.log(`TimetableService: Mise à jour de la séance ${id}...`);
      const response = await httpClient.put<TimetableSession>(`/timetable/${id}`, sessionData);
      return response.data;
    } catch (error) {
      console.error('TimetableService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime une séance
   */
  async deleteSession(id: string): Promise<void> {
    try {
      console.log(`TimetableService: Suppression de la séance ${id}...`);
      await httpClient.delete(`/timetable/${id}`);
    } catch (error) {
      console.error('TimetableService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};

export const getTimetableData = async (): Promise<TimetableData> => {
  console.log('Fetching timetable data from API...');
  try {
    const schedule = await TimetableService.getSchedule();
    return {
      schedule,
      classes: schoolClasses,
      teachers: teacherDetails,
    };
  } catch (error) {
    console.warn('TimetableService: Erreur', error);
    return {
      schedule: mockSchedule,
      classes: schoolClasses,
      teachers: teacherDetails,
    };
  }
};
