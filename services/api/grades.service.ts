import { httpClient } from '../httpClient';
import { evaluations, grades, schoolClasses, allStudents } from '../../data/mockData';
import type { Evaluation, Grade, SchoolClass, Student } from '../../types';

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
    studentId: apiGrade.student_id,
    studentName: `${apiGrade.student_first_name || ''} ${apiGrade.student_last_name || ''}`.trim(),
    subject: apiGrade.subject_name || '',
    evaluationTitle: apiGrade.evaluation_title || 'Évaluation',
    grade: apiGrade.grade || 0,
    maxGrade: apiGrade.max_grade || 20,
    date: apiGrade.evaluation_date 
      ? new Date(apiGrade.evaluation_date).toLocaleDateString('fr-FR')
      : new Date().toLocaleDateString('fr-FR'),
    teacher: apiGrade.teacher_name || '',
    comment: apiGrade.comment || ''
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
      console.warn('GradesService: Erreur API, utilisation des données mock', error);
      return evaluations;
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
      console.log('GradesService: Notes chargées:', mappedGrades.length);
      return mappedGrades;
    } catch (error) {
      console.warn('GradesService: Erreur API, utilisation des données mock', error);
      return grades;
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
      return response.data;
    } catch (error) {
      console.error('GradesService: Erreur lors de l\'enregistrement', error);
      throw error;
    }
  }
};

export const getGradesData = async (): Promise<GradesData> => {
  console.log('Fetching grades data from API...');
  try {
    const [evaluationsData, gradesData] = await Promise.all([
      GradesService.getEvaluations(),
      GradesService.getGrades(),
    ]);
    return {
      evaluations: evaluationsData,
      grades: gradesData,
      classes: schoolClasses,
      students: allStudents,
    };
  } catch (error) {
    console.warn('GradesService: Erreur lors de la récupération', error);
    return {
      evaluations,
      grades,
      classes: schoolClasses,
      students: allStudents,
    };
  }
};
