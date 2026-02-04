import { httpClient } from '../httpClient';
import type { TimetableSession, SchoolClass, Teacher } from '../../types';
import { ClassesService } from './classes.service';
import { TeachersService } from './teachers.service';

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
      console.error('TimetableService: Erreur API lors du chargement de l\'emploi du temps', error);
      throw error;
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
  try {
    const [schedule, classesResult, teachers] = await Promise.all([
      TimetableService.getSchedule(),
      ClassesService.getClasses({ limit: 1000 }),
      TeachersService.getTeachers()
    ]);
    return {
      schedule,
      classes: classesResult.data,
      teachers,
    };
  } catch (error) {
    console.error('TimetableService: Erreur globale lors de la récupération des données', error);
    return {
      schedule: [],
      classes: [],
      teachers: [],
    };
  }
};
