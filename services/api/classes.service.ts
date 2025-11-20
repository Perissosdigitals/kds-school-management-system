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

export interface ClassQueryParams {
  level?: string;
  academicYear?: string;
  mainTeacherId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClassStatsResponse {
  count: number;
}

export interface ClassByLevelStats {
  level: string;
  count: number;
}

export interface ClassByAcademicYearStats {
  academicYear: string;
  count: number;
}

export interface ClassWithStudentCount {
  class: SchoolClass;
  studentCount: number;
}

// Mapper pour convertir les données de l'API au format frontend
const mapApiClassToFrontend = (apiClass: any): SchoolClass => {
  // Calculer currentOccupancy depuis students array si disponible
  let currentOccupancy = 0;
  if (apiClass.students && Array.isArray(apiClass.students)) {
    currentOccupancy = apiClass.students.length;
  } else if (apiClass.student_count !== undefined) {
    currentOccupancy = apiClass.student_count;
  } else if (apiClass.currentOccupancy !== undefined) {
    currentOccupancy = apiClass.currentOccupancy;
  }

  return {
    id: apiClass.id,
    name: apiClass.name,
    level: apiClass.level,
    capacity: apiClass.capacity || 30,
    currentOccupancy: currentOccupancy,
    teacherId: apiClass.main_teacher_id || apiClass.mainTeacherId || apiClass.teacherId,
    teacherName: apiClass.teacher_first_name && apiClass.teacher_last_name
      ? `${apiClass.teacher_first_name} ${apiClass.teacher_last_name}`
      : apiClass.mainTeacher?.firstName && apiClass.mainTeacher?.lastName
      ? `${apiClass.mainTeacher.firstName} ${apiClass.mainTeacher.lastName}`
      : apiClass.teacherName || '',
    room: apiClass.room_number || apiClass.roomNumber || apiClass.room || '',
    academicYear: apiClass.academic_year || apiClass.academicYear || '2024-2025',
    schedule: apiClass.schedule || []
  };
};

export const ClassesService = {
  /**
   * Récupère toutes les classes avec filtres et pagination avancés
   */
  async getClasses(params?: ClassQueryParams): Promise<{ data: SchoolClass[]; total: number; page: number; limit: number }> {
    try {
      console.log('ClassesService: Requête API pour les classes avec filtres...', params);
      const response = await httpClient.get<{ data: any[]; total: number; page: number; limit: number }>('/classes', { params });
      const classes = response.data.data.map(mapApiClassToFrontend);
      console.log('ClassesService: Classes chargées:', classes.length, 'sur', response.data.total);
      return {
        data: classes,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit
      };
    } catch (error) {
      console.warn('ClassesService: Erreur API, utilisation des données mock', error);
      // Fallback avec filtrage local des mock data
      let filteredClasses = [...schoolClasses];
      
      if (params?.level) {
        filteredClasses = filteredClasses.filter(c => c.level === params.level);
      }
      if (params?.academicYear) {
        filteredClasses = filteredClasses.filter(c => c.academicYear === params.academicYear);
      }
      if (params?.mainTeacherId) {
        filteredClasses = filteredClasses.filter(c => c.teacherId === params.mainTeacherId);
      }
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredClasses = filteredClasses.filter(c => 
          c.name.toLowerCase().includes(searchLower) || 
          c.level.toLowerCase().includes(searchLower)
        );
      }
      if (params?.isActive !== undefined) {
        // Mock data doesn't have isActive, assume all are active
        filteredClasses = params.isActive ? filteredClasses : [];
      }
      
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const paginatedClasses = filteredClasses.slice(start, start + limit);
      
      return {
        data: paginatedClasses,
        total: filteredClasses.length,
        page,
        limit
      };
    }
  },

  /**
   * Compte le nombre total de classes avec filtres
   */
  async getClassCount(params?: ClassQueryParams): Promise<number> {
    try {
      console.log('ClassesService: Requête API count classes...');
      const response = await httpClient.get<ClassStatsResponse>('/classes/stats/count', { params });
      return response.data.count;
    } catch (error) {
      console.warn('ClassesService: Erreur API count, utilisation mock', error);
      // Apply same filters as getClasses
      let filteredClasses = [...schoolClasses];
      if (params?.level) filteredClasses = filteredClasses.filter(c => c.level === params.level);
      if (params?.academicYear) filteredClasses = filteredClasses.filter(c => c.academicYear === params.academicYear);
      if (params?.mainTeacherId) filteredClasses = filteredClasses.filter(c => c.teacherId === params.mainTeacherId);
      return filteredClasses.length;
    }
  },

  /**
   * Statistiques des classes par niveau scolaire
   */
  async getStatsByLevel(): Promise<ClassByLevelStats[]> {
    try {
      console.log('ClassesService: Statistiques par niveau...');
      const response = await httpClient.get<ClassByLevelStats[]>('/classes/stats/by-level');
      return response.data;
    } catch (error) {
      console.warn('ClassesService: Erreur API stats by level, utilisation mock', error);
      // Group mock classes by level
      const levelMap = new Map<string, number>();
      schoolClasses.forEach(cls => {
        levelMap.set(cls.level, (levelMap.get(cls.level) || 0) + 1);
      });
      return Array.from(levelMap.entries()).map(([level, count]) => ({ level, count }));
    }
  },

  /**
   * Statistiques des classes par année scolaire
   */
  async getStatsByAcademicYear(): Promise<ClassByAcademicYearStats[]> {
    try {
      console.log('ClassesService: Statistiques par année scolaire...');
      const response = await httpClient.get<ClassByAcademicYearStats[]>('/classes/stats/by-academic-year');
      return response.data;
    } catch (error) {
      console.warn('ClassesService: Erreur API stats by academic year, utilisation mock', error);
      // Group mock classes by academic year
      const yearMap = new Map<string, number>();
      schoolClasses.forEach(cls => {
        yearMap.set(cls.academicYear, (yearMap.get(cls.academicYear) || 0) + 1);
      });
      return Array.from(yearMap.entries()).map(([academicYear, count]) => ({ academicYear, count }));
    }
  },

  /**
   * Récupère une classe avec le nombre d'élèves actifs
   */
  async getClassWithStudentCount(classId: string): Promise<ClassWithStudentCount> {
    try {
      console.log(`ClassesService: Récupération classe ${classId} avec count élèves...`);
      const response = await httpClient.get<ClassWithStudentCount>(`/classes/${classId}/student-count`);
      return {
        class: mapApiClassToFrontend(response.data.class),
        studentCount: response.data.studentCount
      };
    } catch (error) {
      console.warn('ClassesService: Erreur API student count, utilisation mock', error);
      const classInfo = schoolClasses.find(c => c.id === classId);
      if (!classInfo) throw new Error('Classe non trouvée');
      const studentCount = allStudents.filter(s => s.gradeLevel === classInfo.level && s.status === 'Actif').length;
      return { class: classInfo, studentCount };
    }
  },

  /**
   * Récupère une classe avec tous ses détails
   */
  async getClassById(classId: string): Promise<ClassDetailData | null> {
    try {
      console.log(`ClassesService: Récupération de la classe ${classId}...`);
      
      // Récupérer la classe depuis l'API
      const response = await httpClient.get<any>(`/classes/${classId}`);
      const apiClass = response.data;
      
      if (!apiClass) return null;

      // Mapper les données au format ClassDetailData
      const classInfo = mapApiClassToFrontend(apiClass);
      
      // Les élèves sont déjà inclus dans la réponse API
      const students: Student[] = (apiClass.students || []).map((s: any) => ({
        id: s.id,
        registrationDate: s.registrationDate || s.enrollmentDate || '',
        firstName: s.firstName,
        lastName: s.lastName,
        dob: s.dob || '',
        gender: s.gender,
        nationality: s.nationality || '',
        birthPlace: s.birthPlace || '',
        address: s.address || '',
        phone: s.phone || '',
        email: s.email || '',
        gradeLevel: s.gradeLevel,
        previousSchool: s.previousSchool || '',
        emergencyContactName: s.emergencyContactName || '',
        emergencyContactPhone: s.emergencyContactPhone || '',
        medicalInfo: s.medicalInfo || '',
        status: s.status || 'Actif',
        documents: s.documents || [],
        classId: s.classId,
        studentCode: s.registrationNumber || s.studentCode,
        age: s.dob ? new Date().getFullYear() - new Date(s.dob).getFullYear() : undefined,
        enrollmentDate: s.registrationDate || s.enrollmentDate
      }));

      // L'enseignant si disponible
      let teacher: Teacher | undefined = undefined;
      if (apiClass.mainTeacher) {
        teacher = {
          id: apiClass.mainTeacher.id,
          firstName: apiClass.mainTeacher.firstName,
          lastName: apiClass.mainTeacher.lastName,
          subject: apiClass.mainTeacher.specialization || 'Non spécifié',
          email: apiClass.mainTeacher.user?.email || apiClass.mainTeacher.email,
          phone: apiClass.mainTeacher.user?.phone || apiClass.mainTeacher.phone,
          status: apiClass.mainTeacher.status === 'active' ? 'Actif' : 'Inactif'
        };
      }

      return {
        classInfo,
        students,
        teacher,
        timetable: mockSchedule.filter(s => s.classId === classId), // À implémenter avec API
        evaluations: evaluations.filter(e => e.classId === classId).slice(0, 3), // À implémenter avec API
        grades: grades.filter(g => evaluations.some(e => e.id === g.evaluationId && e.classId === classId)), // À implémenter avec API
      };
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
  },

  /**
   * Récupère les élèves d'une classe spécifique
   */
  async getClassStudents(classId: string): Promise<Student[]> {
    try {
      console.log(`ClassesService: Récupération des élèves de la classe ${classId}...`);
      const response = await httpClient.get<Student[]>(`/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      console.warn('ClassesService: Erreur API students, utilisation mock', error);
      // Fallback: récupérer tous les élèves et filtrer par classId
      try {
        const allStudentsResponse = await httpClient.get<Student[]>('/students');
        return allStudentsResponse.data.filter(s => s.classId === classId);
      } catch {
        // Double fallback avec mock data
        return allStudents.filter(s => s.classId === classId);
      }
    }
  },

  /**
   * Récupère l'enseignant principal d'une classe
   */
  async getClassTeacher(classId: string): Promise<Teacher | null> {
    try {
      console.log(`ClassesService: Récupération de l'enseignant de la classe ${classId}...`);
      const response = await httpClient.get<Teacher>(`/classes/${classId}/teacher`);
      return response.data;
    } catch (error) {
      console.warn('ClassesService: Erreur API teacher, utilisation mock', error);
      // Fallback: récupérer la classe et son enseignant
      try {
        const classData = await this.getClassById(classId);
        return classData?.teacher || null;
      } catch {
        return null;
      }
    }
  },

  /**
   * Récupère l'emploi du temps d'une classe
   */
  async getClassTimetable(classId: string): Promise<TimetableSession[]> {
    try {
      console.log(`ClassesService: Récupération de l'emploi du temps de la classe ${classId}...`);
      const response = await httpClient.get<TimetableSession[]>(`/timetable?classId=${classId}`);
      return response.data;
    } catch (error) {
      console.warn('ClassesService: Erreur API timetable, utilisation mock', error);
      return mockSchedule.filter(s => s.classId === classId);
    }
  }
};

// Export pour compatibilité rétroactive
export const getClassesData = async (): Promise<ClassListData> => {
    console.log('Fetching all class list data from API...');
    const result = await ClassesService.getClasses();
    return {
        classes: result.data,
        teachers: teacherDetails,
        students: allStudents,
    };
};

export const getSingleClassData = async (classId: string): Promise<ClassDetailData | null> => {
    console.log(`Fetching details for class ${classId} from API...`);
    return ClassesService.getClassById(classId);
};
