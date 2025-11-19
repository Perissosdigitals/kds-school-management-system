import { httpClient } from '../httpClient';
import { grades, evaluations, pedagogicalNotes, attendanceLogs } from '../../data/mockData';
import type { Grade, Evaluation, PedagogicalNote, AttendanceLog } from '../../types';

export interface PedagogicalFileData {
    academicData: {
        overallAverage: number;
        averagePerSubject: { subject: string; average: number }[];
    };
    attendanceData: {
        absences: number;
        lates: number;
    };
    recentGrades: (Grade & { evaluationInfo?: Evaluation })[];
    pedagogicalNotes: PedagogicalNote[];
}

export const PedagogicalFileService = {
  /**
   * Récupère le dossier pédagogique complet d'un élève
   */
  async getPedagogicalFile(studentId: string): Promise<PedagogicalFileData> {
    try {
      console.log(`PedagogicalFileService: Récupération du dossier pour l'élève ${studentId}...`);
      const response = await httpClient.get<PedagogicalFileData>(`/students/${studentId}/pedagogical-file`);
      return response.data;
    } catch (error) {
      console.warn(`PedagogicalFileService: Erreur API, utilisation des données mock`, error);
      return getPedagogicalFileDataLocal(studentId);
    }
  },

  /**
   * Ajoute une note pédagogique
   */
  async addPedagogicalNote(studentId: string, note: Omit<PedagogicalNote, 'id'>): Promise<PedagogicalNote> {
    try {
      console.log(`PedagogicalFileService: Ajout d'une note pédagogique...`);
      const response = await httpClient.post<PedagogicalNote>(`/students/${studentId}/pedagogical-notes`, note);
      return response.data;
    } catch (error) {
      console.error('PedagogicalFileService: Erreur lors de l\'ajout', error);
      throw error;
    }
  }
};

// Fonction locale pour les données mock
const getPedagogicalFileDataLocal = (studentId: string): PedagogicalFileData => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.score !== null);
    let overallAverage = 0;
    let averagePerSubject: { subject: string; average: number }[] = [];

    if (studentGrades.length > 0) {
        const subjectData: Record<string, { totalScore: number; totalMaxScore: number; count: number }> = {};
        studentGrades.forEach(grade => {
            const evaluation = evaluations.find(e => e.id === grade.evaluationId);
            if (!evaluation) return;
            
            const subject = evaluation.subject;
            if (!subjectData[subject]) {
                subjectData[subject] = { totalScore: 0, totalMaxScore: 0, count: 0 };
            }

            subjectData[subject].totalScore += grade.score!;
            subjectData[subject].totalMaxScore += evaluation.maxScore;
            subjectData[subject].count++;
        });
        
        averagePerSubject = Object.entries(subjectData).map(([subject, data]) => {
            const average = (data.totalScore / data.totalMaxScore) * 100;
            return { subject, average };
        }).sort((a,b) => b.average - a.average);

        const avgSum = averagePerSubject.reduce((sum, s) => sum + s.average, 0);
        overallAverage = averagePerSubject.length > 0 ? avgSum / averagePerSubject.length : 0;
    }

    // Attendance Data
    const studentLogs = attendanceLogs.filter(log => log.studentId === studentId);
    const attendanceData = {
        absences: studentLogs.filter(log => log.status === 'Absent').length,
        lates: studentLogs.filter(log => log.status === 'En retard').length,
    };

    // Recent Grades
    const recentGrades = grades
        .filter(g => g.studentId === studentId)
        .map(g => ({ ...g, evaluationInfo: evaluations.find(e => e.id === g.evaluationId) }))
        .filter(g => g.evaluationInfo)
        .sort((a, b) => new Date(b.evaluationInfo!.date).getTime() - new Date(a.evaluationInfo!.date).getTime())
        .slice(0, 5);

    return {
        academicData: {
            overallAverage: isNaN(overallAverage) ? 0 : overallAverage,
            averagePerSubject
        },
        attendanceData,
        recentGrades,
        pedagogicalNotes: pedagogicalNotes.filter(n => n.studentId === studentId),
    };
};

export const getPedagogicalFileData = async (studentId: string): Promise<PedagogicalFileData> => {
    console.log(`Fetching pedagogical file for student ${studentId}...`);
    return PedagogicalFileService.getPedagogicalFile(studentId);
};
