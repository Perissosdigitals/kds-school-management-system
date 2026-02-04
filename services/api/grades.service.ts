import { httpClient } from '../httpClient';
import type { Evaluation, Grade, SchoolClass, Student, User } from '../../types';
import { ClassesService } from './classes.service';
import { StudentsService } from './students.service';
import { ActivityService } from './activity.service';
import { AuthService } from './auth.service';

export interface GradesData {
  evaluations: Evaluation[];
  grades: Grade[];
  classes: SchoolClass[];
  students: Student[];
}

// Mapper pour convertir les données de l'API au format frontend
const mapApiGradeToFrontend = (apiGrade: any): Grade => {
  return {
    id: apiGrade.id,
    studentId: apiGrade.studentId || apiGrade.student_id,
    studentName: apiGrade.studentName || `${apiGrade.student_first_name || apiGrade.student?.firstName || ''} ${apiGrade.student_last_name || apiGrade.student?.lastName || ''}`.trim(),
    subject: apiGrade.subjectName || apiGrade.subject_name || apiGrade.subject || '',
    evaluationTitle: apiGrade.evaluationTitle || apiGrade.evaluation_title || 'Évaluation',
    evaluationId: apiGrade.evaluationId || apiGrade.evaluation_id,
    score: apiGrade.grade !== undefined ? Number(apiGrade.grade) : (apiGrade.value !== undefined ? Number(apiGrade.value) : null),
    maxGrade: apiGrade.maxGrade || apiGrade.max_grade || apiGrade.maxValue || 20,
    date: (apiGrade.evaluationDate || apiGrade.evaluation_date || apiGrade.date)
      ? new Date(apiGrade.evaluationDate || apiGrade.evaluation_date || apiGrade.date).toLocaleDateString('fr-FR')
      : new Date().toLocaleDateString('fr-FR'),
    teacher: apiGrade.teacherName || apiGrade.teacher_name || '',
    comment: apiGrade.comment || apiGrade.comments || ''
  };
};

export const GradesService = {
  /**
   * Récupère toutes les évaluations
   */
  async getEvaluations(params?: { page?: number; limit?: number; classId?: string }): Promise<Evaluation[]> {
    try {
      console.log('GradesService: Requête API pour les évaluations...');
      const response = await httpClient.get<Evaluation[]>('/grades/evaluations', { params });
      return response.data;
    } catch (error) {
      console.error('GradesService: Erreur API lors du chargement des évaluations', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les notes
   */
  async getGrades(params?: { page?: number; limit?: number; studentId?: string }): Promise<Grade[]> {
    try {
      console.log('GradesService: Requête API pour les notes...');
      const response = await httpClient.get<any[]>('/grades', { params });
      const mappedGrades = response.data.map(mapApiGradeToFrontend);
      return mappedGrades;
    } catch (error) {
      console.error('GradesService: Erreur API lors du chargement des notes', error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle évaluation
   */
  async createEvaluation(evaluationData: Omit<Evaluation, 'id'>): Promise<Evaluation> {
    try {
      console.log('GradesService: Création d\'une nouvelle évaluation...');
      const response = await httpClient.post<Evaluation>('/grades/evaluations', evaluationData);
      return response.data;
    } catch (error) {
      console.error('GradesService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Enregistre une note
   */
  async recordGrade(gradeData: Omit<Grade, 'id'>): Promise<Grade> {
    try {
      console.log('GradesService: Enregistrement d\'une note...');
      const response = await httpClient.post<Grade>('/grades', gradeData);

      // Log activity
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        await ActivityService.logActivity(
          currentUser as User,
          'Saisie de note',
          'grades',
          `Note de ${gradeData.score}/${gradeData.maxGrade || 20} enregistrée pour l'élève ${gradeData.studentName}`,
          undefined,
          gradeData.studentId
        );
      }

      return response.data;
    } catch (error) {
      console.error('GradesService: Erreur lors de l\'enregistrement', error);
      throw error;
    }
  },

  /**
   * Récupère les notes par classe
   */
  async getGradesByClass(classId: string, params?: {
    trimester?: string;
    subjectId?: string;
    academicYear?: string;
  }): Promise<Grade[]> {
    try {
      console.log('GradesService: Récupération des notes pour la classe', classId);
      const response = await httpClient.get<any[]>(`/grades/by-class/${classId}`, { params });
      const mappedGrades = response.data.map(mapApiGradeToFrontend);
      return mappedGrades;
    } catch (error) {
      console.error('GradesService: Erreur API pour notes par classe', error);
      throw error;
    }
  }
};

export const getGradesData = async (): Promise<GradesData> => {
  try {
    const [evaluationsData, gradesData, classesResult, studentsData] = await Promise.all([
      GradesService.getEvaluations(),
      GradesService.getGrades(),
      ClassesService.getClasses({ limit: 1000 }),
      StudentsService.getStudents({ limit: 1000 }),
    ]);
    return {
      evaluations: evaluationsData,
      grades: gradesData,
      classes: classesResult.data,
      students: studentsData,
    };
  } catch (error) {
    console.error('GradesService: Erreur lors de la récupération globale des notes', error);
    return {
      evaluations: [],
      grades: [],
      classes: [],
      students: [],
    };
  }
};
