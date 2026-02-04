import { httpClient } from '../httpClient';
import type { TimetableSession, SchoolClass } from '../../types';

// --- Types for service responses ---
export interface TeacherDashboardData {
  todaySchedule: { id: string; startTime: string; subject: string; className: string; room: string }[];
  pendingEvaluationsCount: number;
  recentClassAverages: { className: string; average: string }[];
}

export interface AdminDashboardData {
  students: { total: number; male: number; female: number };
  teachers: { total: number };
  classes: { id: string; class_name: string; capacity: number; student_count: number; teacher_name: string }[];
  documents: { total_docs: number; pending_docs: number; approved_docs: number; rejected_docs: number; missing_docs: number };
  classPerformances: { id: string; name: string; average: number }[];
  totalRevenue: number;
  timestamp: string;
}

export const DashboardService = {
  /**
   * Récupère le dashboard pour un enseignant
   */
  async getTeacherDashboard(teacherId: string): Promise<TeacherDashboardData> {
    try {
      console.log(`DashboardService: Récupération du tableau de bord enseignant ${teacherId}...`);
      const response = await httpClient.get<TeacherDashboardData>(`/dashboard/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Erreur API dashboard enseignant', error);
      return {
        todaySchedule: [],
        pendingEvaluationsCount: 0,
        recentClassAverages: []
      };
    }
  },

  /**
   * Récupère le dashboard pour un administrateur
   */
  async getAdminDashboard(forceSync: boolean = false): Promise<AdminDashboardData> {
    try {
      console.log(`DashboardService: Récupération du tableau de bord stratégique${forceSync ? ' avec synchronisation forcée' : ''}...`);
      const url = `/analytics/dashboard?_=${Date.now()}${forceSync ? '&sync=true' : ''}`;
      const response = await httpClient.get<AdminDashboardData>(url);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Erreur API dashboard administrateur', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques générales
   */
  async getAnalytics(): Promise<any> {
    try {
      const response = await httpClient.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('DashboardService: Erreur API analytics', error);
      return {
        studentsCount: 0,
        teachersCount: 0,
        classesCount: 0,
        averageGrade: 0,
        absencesCount: 0
      };
    }
  }
};

export const getTeacherDashboardData = async (teacherId: string): Promise<TeacherDashboardData> => {
  return DashboardService.getTeacherDashboard(teacherId);
};

export const getAdminDashboardData = async (forceSync: boolean = false): Promise<AdminDashboardData> => {
  return DashboardService.getAdminDashboard(forceSync);
};
