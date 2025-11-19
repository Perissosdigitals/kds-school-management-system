import { httpClient } from '../httpClient';
import { schoolClasses, teacherDetails, allStudents, mockSchedule, evaluations, grades } from '../../data/mockData';
import type { SchoolClass, Teacher, Student, TimetableSession, Evaluation, Grade } from '../../types';

export interface ClassListData {
    classes: SchoolClass[];
    teachers: Teacher[];
    students: Student[];
}

export interface ClassDetailData {
    classInfo: SchoolClass;
    students: Student[];
    teacher: Teacher | undefined;
    timetable: TimetableSession[];
    evaluations: Evaluation[];
    grades: Grade[];
}

export const ClassesService = {
  /**
   * Récupère toutes les classes
   */
  async getClasses(params?: { page?: number; limit?: number }): Promise<SchoolClass[]> {
    try {
      console.log('ClassesService: Requête API pour les classes...');
      const response = await httpClient.get<SchoolClass[]>('/classes', { params });
      return response.data;
    } catch (error) {
      console.warn('ClassesService: Erreur API, utilisation des données mock', error);
      return schoolClasses;
    }
  },

  /**
   * Récupère une classe avec tous ses détails
   */
  async getClassById(classId: string): Promise<ClassDetailData | null> {
    try {
      console.log(`ClassesService: Récupération de la classe ${classId}...`);
      const response = await httpClient.get<ClassDetailData>(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.warn(`ClassesService: Erreur API, utilisation des données mock`, error);
      const classInfo = schoolClasses.find(c => c.id === classId);
      if (!classInfo) return null;
      return {
        classInfo,
        students: allStudents.filter(s => s.gradeLevel === classInfo.level),
        teacher: teacherDetails.find(t => t.id === classInfo.teacherId),
        timetable: mockSchedule.filter(s => s.classId === classId),
        evaluations: evaluations.filter(e => e.classId === classId).slice(0, 3),
        grades: grades.filter(g => evaluations.some(e => e.id === g.evaluationId && e.classId === classId)),
      };
    }
  },

  /**
   * Crée une nouvelle classe
   */
  async createClass(classData: Omit<SchoolClass, 'id'>): Promise<SchoolClass> {
    try {
      console.log('ClassesService: Création d\'une nouvelle classe...');
      const response = await httpClient.post<SchoolClass>('/classes', classData);
      return response.data;
    } catch (error) {
      console.error('ClassesService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour une classe
   */
  async updateClass(id: string, classData: Partial<SchoolClass>): Promise<SchoolClass> {
    try {
      console.log(`ClassesService: Mise à jour de la classe ${id}...`);
      const response = await httpClient.put<SchoolClass>(`/classes/${id}`, classData);
      return response.data;
    } catch (error) {
      console.error('ClassesService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime une classe
   */
  async deleteClass(id: string): Promise<void> {
    try {
      console.log(`ClassesService: Suppression de la classe ${id}...`);
      await httpClient.delete(`/classes/${id}`);
    } catch (error) {
      console.error('ClassesService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};

// Export pour compatibilité rétroactive
export const getClassesData = async (): Promise<ClassListData> => {
    console.log('Fetching all class list data from API...');
    const classes = await ClassesService.getClasses();
    return {
        classes,
        teachers: teacherDetails,
        students: allStudents,
    };
};

export const getSingleClassData = async (classId: string): Promise<ClassDetailData | null> => {
    console.log(`Fetching details for class ${classId} from API...`);
    return ClassesService.getClassById(classId);
};
