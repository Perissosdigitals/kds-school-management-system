import { httpClient } from '../httpClient';
import type { SchoolClass, Student, User } from '../../types';
import { ClassesService } from './classes.service';
import { StudentsService } from './students.service';
import { ActivityService } from './activity.service';
import { AuthService } from './auth.service';

export interface AttendanceData {
  classes: SchoolClass[];
  students: Student[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId?: string;
  date: string;
  status: 'Présent' | 'Absent' | 'Retard' | 'Absent excusé';
  notes?: string;
  period?: string;
}

// Mapper pour convertir les données de l'API au format frontend
const mapApiAttendanceToFrontend = (apiAttendance: any): AttendanceRecord => {
  const statusMap: { [key: string]: 'Présent' | 'Absent' | 'Retard' | 'Absent excusé' } = {
    'present': 'Présent',
    'absent': 'Absent',
    'late': 'Retard',
    'excused': 'Absent excusé',
    'PRESENT': 'Présent',
    'ABSENT': 'Absent',
    'LATE': 'Retard',
    'EXCUSED': 'Absent excusé',
    'Présent': 'Présent',
    'Absent': 'Absent',
    'Retard': 'Retard',
    'Absent excusé': 'Absent excusé',
    'Excusé': 'Absent excusé'
  };

  return {
    id: apiAttendance.id,
    studentId: apiAttendance.studentId || apiAttendance.student_id,
    classId: apiAttendance.classId || apiAttendance.class_id,
    date: apiAttendance.date
      ? new Date(apiAttendance.date).toLocaleDateString('fr-FR')
      : new Date().toLocaleDateString('fr-FR'),
    status: (statusMap[apiAttendance.status] || 'Présent'),
    notes: apiAttendance.reason || apiAttendance.comments || apiAttendance.notes || '',
    period: apiAttendance.period || apiAttendance.session
  };
};

export const AttendanceService = {
  /**
   * Récupère la fiche d'appel quotidienne pour une classe
   */
  async getDailyAttendance(classId: string, date: Date | string, period?: 'morning' | 'afternoon'): Promise<AttendanceRecord[]> {
    try {
      const formattedDate = typeof date === 'string'
        ? date
        : date.toISOString().split('T')[0];

      const periodQuery = period ? `&period=${period}` : '';
      console.log(`AttendanceService: Récupération de l'appel pour la classe ${classId} du ${formattedDate} (${period || 'all'})`);
      const response = await httpClient.get<any[]>(`/attendance/daily/${classId}?date=${formattedDate}${periodQuery}`);
      return response.data.map(mapApiAttendanceToFrontend);
    } catch (error) {
      console.error('AttendanceService: Erreur récupération appel', error);
      return [];
    }
  },

  /**
   * Sauvegarde une fiche d'appel en masse
   */
  async saveBulkAttendance(attendanceRecords: any[]): Promise<any[]> {
    try {
      console.log('AttendanceService: Sauvegarde en masse...', attendanceRecords.length, 'enregistrements');
      const response = await httpClient.post<any[]>('/attendance/bulk', attendanceRecords);

      // Log activity
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && attendanceRecords.length > 0) {
        const classId = attendanceRecords[0].classId || attendanceRecords[0].class_id;
        await ActivityService.logActivity(
          currentUser as User,
          'Prise d\'appel',
          'attendance',
          `Appel enregistré pour ${attendanceRecords.length} élèves`,
          classId
        );
      }

      return response.data;
    } catch (error) {
      console.error('AttendanceService: Erreur sauvegarde en masse', error);
      throw error;
    }
  },

  /**
   * Récupère les enregistrements de présence
   */
  async getAttendanceRecords(params?: { page?: number; limit?: number; studentId?: string; date?: string }): Promise<AttendanceRecord[]> {
    try {
      console.log('AttendanceService: Requête API pour les présences...');
      const response = await httpClient.get<any[]>('/attendance', { params });
      return response.data.map(mapApiAttendanceToFrontend);
    } catch (error) {
      console.error('AttendanceService: Erreur API lors du chargement des présences', error);
      throw error;
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
  try {
    const [classesResult, studentsResult] = await Promise.all([
      ClassesService.getClasses({ limit: 1000 }),
      StudentsService.getStudents({ limit: 1000 })
    ]);
    return {
      classes: classesResult.data,
      students: studentsResult,
    };
  } catch (error) {
    console.error('AttendanceService: Erreur lors de la récupération des données de base', error);
    return {
      classes: [],
      students: [],
    };
  }
};
