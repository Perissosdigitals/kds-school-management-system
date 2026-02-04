import { httpClient } from '../httpClient';
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
    registrationNumber: apiClass.registrationNumber || apiClass.registration_number || '',
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
      console.error('ClassesService: Erreur API lors du chargement des classes', error);
      throw error;
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
      console.error('ClassesService: Erreur API lors du comptage des classes', error);
      throw error;
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
      console.error('ClassesService: Erreur API stats by level', error);
      throw error;
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
      console.error('ClassesService: Erreur API stats by academic year', error);
      throw error;
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
      console.error('ClassesService: Erreur API student count', error);
      throw error;
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

      // Charger l'emploi du temps depuis l'API
      let timetableData: TimetableSession[] = [];
      try {
        console.log(`ClassesService: Tentative de chargement emploi du temps pour classe ${classId}...`);
        const timetableResponse = await httpClient.get<any>(`/timetable?classId=${classId}`);

        // Handle paginated response format: { data: [], total, page, limit }
        const timetableArray = Array.isArray(timetableResponse.data)
          ? timetableResponse.data
          : (timetableResponse.data.data || []);

        timetableData = timetableArray.map((slot: any) => ({
          id: slot.id,
          day: slot.day_of_week || slot.dayOfWeek || slot.day,
          startTime: slot.start_time || slot.startTime,
          endTime: slot.end_time || slot.endTime,
          subject: slot.subject?.name || slot.subject_name || slot.subject || '',
          subjectId: slot.subject_id || slot.subjectId || slot.subject?.id,
          classId: slot.class_id || slot.classId,
          teacherId: slot.teacher_id || slot.teacherId,
          room: slot.room || ''
        }));
      } catch (timetableError) {
        console.warn('ClassesService: API timetable non disponible pour cette classe', timetableError);
        timetableData = [];
      }

      return {
        classInfo,
        students,
        teacher,
        timetable: timetableData,
        evaluations: [], // Feature to be implemented via API
        grades: [],      // Feature to be implemented via API
      };
    } catch (error) {
      console.error(`ClassesService: Erreur lors de la récupération de la classe ${classId}`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle classe
   */
  async createClass(classData: Omit<SchoolClass, 'id'>): Promise<SchoolClass> {
    try {
      console.log('ClassesService: Création d\'une nouvelle classe...', classData);

      // Map frontend fields to backend DTO
      const apiPayload = {
        name: classData.name,
        level: classData.level,
        academicYear: classData.academicYear,
        capacity: classData.capacity,
        mainTeacherId: classData.teacherId || undefined,
        roomNumber: classData.room || undefined
      };

      const response = await httpClient.post<SchoolClass>('/classes', apiPayload);
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

      const cleanPayload: any = {
        name: classData.name,
        level: classData.level,
        academicYear: classData.academicYear,
        capacity: classData.capacity,
        mainTeacherId: classData.teacherId || undefined,
        roomNumber: classData.room || undefined
      };

      // Remove undefined keys
      Object.keys(cleanPayload).forEach(key => cleanPayload[key] === undefined && delete cleanPayload[key]);

      const response = await httpClient.put<SchoolClass>(`/classes/${id}`, cleanPayload);
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
      console.error('ClassesService: Erreur lors de l\'obtention des élèves de la classe', error);
      throw error;
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
      console.error('ClassesService: Erreur lors de l\'obtention de l\'enseignant de la classe', error);
      throw error;
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
      console.error('ClassesService: Erreur lors de l\'obtention de l\'emploi du temps', error);
      throw error;
    }
  }
};

// Export pour compatibilité rétroactive
export const getClassesData = async (): Promise<ClassListData> => {
  console.log('Fetching class list from API...');
  try {
    const result = await ClassesService.getClasses();
    return {
      classes: result.data,
      teachers: [], // Should be fetched from TeachersService by caller if needed
      students: [], // Should be fetched from StudentsService by caller if needed
    };
  } catch (error) {
    console.error('getClassesData Error:', error);
    throw error;
  }
};

export const getSingleClassData = async (classId: string): Promise<ClassDetailData | null> => {
  return ClassesService.getClassById(classId);
};
