import { httpClient } from '../httpClient';
import { allStudents, schoolClasses, mockSchedule, evaluations, grades, teacherDetails } from '../../data/mockData';
import type { TimetableSession, SchoolClass } from '../../types';

// --- Types for service responses ---
export interface TeacherDashboardData {
    todaySchedule: { id: string; startTime: string; subject: string; className: string; room: string }[];
    pendingEvaluationsCount: number;
    recentClassAverages: { className: string; average: string }[];
}

export interface AdminDashboardData {
    totalStudents: number;
    totalStaff: number;
    schoolOverallAverage: number;
    totalEvaluations: number;
    classPerformances: { id: string; name: string; average: number }[];
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
      console.warn('DashboardService: Erreur API, utilisation des données mock', error);
      return getTeacherDashboardDataLocal(teacherId);
    }
  },

  /**
   * Récupère le dashboard pour un administrateur
   */
  async getAdminDashboard(): Promise<AdminDashboardData> {
    try {
      console.log('DashboardService: Récupération du tableau de bord administrateur...');
      // Utiliser l'endpoint analytics/dashboard disponible
      const response = await httpClient.get<any>('/analytics/dashboard');
      
      // Mapper les données de l'API
      const apiData = response.data;
      const mappedData: AdminDashboardData = {
        totalStudents: apiData.studentsCount || 0,
        totalStaff: apiData.teachersCount || 0,
        schoolOverallAverage: apiData.averageGrade || 0,
        totalEvaluations: apiData.classesCount || 0,
        classPerformances: []
      };
      
      console.log('DashboardService: Données analytics chargées depuis API');
      return mappedData;
    } catch (error) {
      console.warn('DashboardService: Erreur API, utilisation des données mock', error);
      return getAdminDashboardDataLocal();
    }
  },

  /**
   * Récupère les statistiques générales
   */
  async getAnalytics(): Promise<any> {
    try {
      console.log('DashboardService: Récupération des analytics...');
      const response = await httpClient.get('/analytics/dashboard');
      console.log('DashboardService: Analytics chargées:', response.data);
      return response.data;
    } catch (error) {
      console.warn('DashboardService: Erreur API analytics', error);
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

// --- Helper Functions (would be on backend) ---
const getDayName = () => {
    const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date());
    return day.charAt(0).toUpperCase() + day.slice(1);
};

const calculateClassAverage = (classId: string): { average: number; } => {
    const evaluationsForClass = evaluations.filter(e => e.classId === classId);
    if (evaluationsForClass.length === 0) return { average: 0 };
    
    let totalPercentage = 0;
    let gradedEvaluationsCount = 0;

    evaluationsForClass.forEach(evaluation => {
        const gradesForEval = grades.filter(g => g.evaluationId === evaluation.id && g.score !== null);
        if(gradesForEval.length > 0) {
            const totalScore = gradesForEval.reduce((sum, g) => sum + g.score!, 0);
            const averageScore = totalScore / gradesForEval.length;
            totalPercentage += (averageScore / evaluation.maxScore) * 100;
            gradedEvaluationsCount++;
        }
    });

    const finalAverage = gradedEvaluationsCount > 0 ? totalPercentage / gradedEvaluationsCount : 0;
    return { average: finalAverage };
};

// --- Local Data Functions ---

const getTeacherDashboardDataLocal = (teacherId: string): TeacherDashboardData => {
    // Today's Schedule
    const today = getDayName();
    const todayScheduleRaw = mockSchedule
      .filter(s => s.teacherId === teacherId && s.day.toLowerCase() === today.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    const todaySchedule = todayScheduleRaw.map(s => ({
        id: s.id,
        startTime: s.startTime,
        subject: s.subject,
        className: schoolClasses.find(c => c.id === s.classId)?.name || 'N/A',
        room: s.room
    }));

    // Pending Evaluations
    const teacherClasses = schoolClasses.filter(c => c.teacherId === teacherId);
    const teacherClassIds = teacherClasses.map(c => c.id);
    const teacherEvaluations = evaluations.filter(e => teacherClassIds.includes(e.classId));
    
    const pendingEvaluationsCount = teacherEvaluations.reduce((count, evaluation) => {
      const classInfo = schoolClasses.find(c => c.id === evaluation.classId);
      if (!classInfo) return count;
      const studentsInClass = allStudents.filter(s => s.gradeLevel === classInfo.level);
      const gradedStudents = grades.filter(g => g.evaluationId === evaluation.id && g.score !== null);
      if (gradedStudents.length < studentsInClass.length) {
        return count + 1;
      }
      return count;
    }, 0);

    // Recent Averages
    const recentClassAverages = teacherClasses.map(cls => {
      const classEvals = evaluations.filter(e => e.classId === cls.id);
      if (classEvals.length === 0) return { className: cls.name, average: 'N/A' };
      
      const lastEval = classEvals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const classGrades = grades.filter(g => g.evaluationId === lastEval.id && g.score !== null);
      
      if (classGrades.length === 0) return { className: cls.name, average: 'N/A' };
      
      const totalScore = classGrades.reduce((sum, g) => sum + g.score!, 0);
      const average = totalScore / classGrades.length;
      return {
        className: cls.name,
        average: `${average.toFixed(1)} / ${lastEval.maxScore}`
      };
    }).slice(0, 2);

    return { todaySchedule, pendingEvaluationsCount, recentClassAverages };
};

const getAdminDashboardDataLocal = (): AdminDashboardData => {
    const classPerformances = schoolClasses.map(cls => {
        const { average } = calculateClassAverage(cls.id);
        return {
            id: cls.id,
            name: cls.name,
            average: average,
        };
    }).sort((a,b) => b.average - a.average);

    const validClasses = classPerformances.filter(c => c.average > 0);
    const totalAverageSum = validClasses.reduce((sum, cls) => sum + cls.average, 0);
    const schoolOverallAverage = validClasses.length > 0 ? totalAverageSum / validClasses.length : 0;

    return {
        totalStudents: allStudents.length,
        totalStaff: teacherDetails.length,
        schoolOverallAverage: schoolOverallAverage,
        totalEvaluations: evaluations.length,
        classPerformances: classPerformances
    };
};

export const getTeacherDashboardData = async (teacherId: string): Promise<TeacherDashboardData> => {
    console.log(`Fetching dashboard data for teacher ${teacherId}...`);
    return DashboardService.getTeacherDashboard(teacherId);
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    console.log("Fetching admin dashboard data...");
    return DashboardService.getAdminDashboard();
};
