import { httpClient } from '../httpClient';
import { schoolClasses, allStudents } from '../../data/mockData';
import type { SchoolClass, Student } from '../../types';

export interface AttendanceData {
    classes: SchoolClass[];
    students: Student[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Présent' | 'Absent' | 'Retard';
  notes?: string;
}

export const AttendanceService = {
  /**
   * Récupère les enregistrements de présence
   */
  async getAttendanceRecords(params?: { page?: number; limit?: number; studentId?: string; date?: string }): Promise<AttendanceRecord[]> {
    try {
      console.log('AttendanceService: Requête API pour les présences...');
      const response = await httpClient.get<AttendanceRecord[]>('/attendance', { params });
      return response.data;
    } catch (error) {
      console.warn('AttendanceService: Erreur API', error);
      return [];
    }
  },

  /**
   * Enregistre une présence
   */
  async recordAttendance(attendanceData: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    try {
      console.log('AttendanceService: Enregistrement de présence...');
      const response = await httpClient.post<AttendanceRecord>('/attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('AttendanceService: Erreur lors de l\'enregistrement', error);
      throw error;
    }
  },

  /**
   * Met à jour une présence
   */
  async updateAttendance(id: string, attendanceData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    try {
      console.log(`AttendanceService: Mise à jour de l'enregistrement ${id}...`);
      const response = await httpClient.put<AttendanceRecord>(`/attendance/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('AttendanceService: Erreur lors de la mise à jour', error);
      throw error;
    }
  }
};

export const getAttendanceData = async (): Promise<AttendanceData> => {
  console.log('Fetching attendance prerequisite data from API...');
  try {
    const [records] = await Promise.all([
      AttendanceService.getAttendanceRecords(),
    ]);
    return {
      classes: schoolClasses,
      students: allStudents,
    };
  } catch (error) {
    console.warn('AttendanceService: Erreur', error);
    return {
      classes: schoolClasses,
      students: allStudents,
    };
  }
};
