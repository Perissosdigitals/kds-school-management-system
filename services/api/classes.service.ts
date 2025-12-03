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

      // Charger l'emploi du temps depuis l'API
      let timetableData: TimetableSession[] = [];
      try {
        console.log(`ClassesService: Tentative de chargement emploi du temps pour classe ${classId}...`);
        const timetableResponse = await httpClient.get<any[]>(`/timetable?classId=${classId}`);
        timetableData = timetableResponse.data.map((slot: any) => ({
          id: slot.id,
          day: slot.day_of_week || slot.dayOfWeek,
          startTime: slot.start_time || slot.startTime,
          endTime: slot.end_time || slot.endTime,
          subject: slot.subject_name || slot.subject,
          classId: slot.class_id || slot.classId,
          teacherId: slot.teacher_id || slot.teacherId,
          room: slot.room
        }));
        console.log(`✅ ClassesService: Emploi du temps API chargé (${timetableData.length} sessions)`);
      } catch (timetableError) {
        console.warn('⚠️ ClassesService: API timetable inaccessible, génération d\'emploi du temps de démonstration');
        
        // Générer un emploi du temps de démonstration basé sur la classe
        const className = classInfo.name;
        const level = classInfo.level;
        
        // Emplois du temps réalistes selon le niveau
        if (level === 'CM2' || level === 'CM1' || level === 'CE2' || level === 'CE1' || level === 'CP') {
          // Primaire - Emploi du temps type
          timetableData = [
            { id: `tt-${classId}-1`, day: 'Lundi', startTime: '08:00', endTime: '10:00', subject: 'Français', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-2`, day: 'Lundi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-3`, day: 'Lundi', startTime: '14:00', endTime: '15:30', subject: 'Histoire-Géographie', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-4`, day: 'Mardi', startTime: '08:00', endTime: '10:00', subject: 'Mathématiques', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-5`, day: 'Mardi', startTime: '10:15', endTime: '12:00', subject: 'Sciences', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-6`, day: 'Mardi', startTime: '14:00', endTime: '15:30', subject: 'Sport', classId, teacherId: classInfo.teacherId || '', room: 'Gymnase' },
            { id: `tt-${classId}-7`, day: 'Mercredi', startTime: '08:00', endTime: '10:00', subject: 'Français', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-8`, day: 'Mercredi', startTime: '10:15', endTime: '12:00', subject: 'Torah', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-9`, day: 'Jeudi', startTime: '08:00', endTime: '10:00', subject: 'Français', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-10`, day: 'Jeudi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-11`, day: 'Jeudi', startTime: '14:00', endTime: '15:30', subject: 'Anglais', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-12`, day: 'Vendredi', startTime: '08:00', endTime: '10:00', subject: 'Mathématiques', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-13`, day: 'Vendredi', startTime: '10:15', endTime: '12:00', subject: 'Hébreu', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
          ];
        } else if (level === '6ème' || level === '5ème' || level === '4ème' || level === '3ème') {
          // Collège - Emploi du temps type
          timetableData = [
            { id: `tt-${classId}-1`, day: 'Lundi', startTime: '08:00', endTime: '09:30', subject: 'Mathématiques', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-2`, day: 'Lundi', startTime: '09:45', endTime: '11:15', subject: 'Français', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-3`, day: 'Lundi', startTime: '11:30', endTime: '13:00', subject: 'Histoire-Géographie', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-4`, day: 'Lundi', startTime: '14:30', endTime: '16:00', subject: 'Anglais', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-5`, day: 'Mardi', startTime: '08:00', endTime: '09:30', subject: 'Sciences et Vie de la Terre', classId, teacherId: classInfo.teacherId || '', room: 'Laboratoire' },
            { id: `tt-${classId}-6`, day: 'Mardi', startTime: '09:45', endTime: '11:15', subject: 'Mathématiques', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-7`, day: 'Mardi', startTime: '11:30', endTime: '13:00', subject: 'EPS', classId, teacherId: classInfo.teacherId || '', room: 'Gymnase' },
            { id: `tt-${classId}-8`, day: 'Mardi', startTime: '14:30', endTime: '16:00', subject: 'Français', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-9`, day: 'Mercredi', startTime: '08:00', endTime: '09:30', subject: 'Anglais', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-10`, day: 'Mercredi', startTime: '09:45', endTime: '11:15', subject: 'Arts Plastiques', classId, teacherId: classInfo.teacherId || '', room: 'Atelier' },
            { id: `tt-${classId}-11`, day: 'Jeudi', startTime: '08:00', endTime: '09:30', subject: 'Physique-Chimie', classId, teacherId: classInfo.teacherId || '', room: 'Laboratoire' },
            { id: `tt-${classId}-12`, day: 'Jeudi', startTime: '09:45', endTime: '11:15', subject: 'Français', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-13`, day: 'Jeudi', startTime: '11:30', endTime: '13:00', subject: 'Mathématiques', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-14`, day: 'Jeudi', startTime: '14:30', endTime: '16:00', subject: 'Informatique', classId, teacherId: classInfo.teacherId || '', room: 'Salle Info' },
            { id: `tt-${classId}-15`, day: 'Vendredi', startTime: '08:00', endTime: '09:30', subject: 'Histoire-Géographie', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-16`, day: 'Vendredi', startTime: '09:45', endTime: '11:15', subject: 'Anglais', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
            { id: `tt-${classId}-17`, day: 'Vendredi', startTime: '11:30', endTime: '13:00', subject: 'Éducation Civique', classId, teacherId: classInfo.teacherId || '', room: 'Salle ' + className },
          ];
        } else {
          // Autres niveaux - emploi du temps générique
          timetableData = mockSchedule.filter(s => s.classId === classId);
        }
        
        console.log(`📚 ClassesService: Emploi du temps DEMO généré (${timetableData.length} sessions pour ${className} - ${level})`);
      }

      return {
        classInfo,
        students,
        teacher,
        timetable: timetableData,
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
      console.log('ClassesService: Création d\'une nouvelle classe...', classData);
      
      // Map frontend fields to backend DTO
      const apiPayload = {
        name: classData.name,
        level: classData.level,
        academicYear: classData.academicYear,
        capacity: classData.capacity,
        mainTeacherId: classData.teacherId || undefined, // Map teacherId to mainTeacherId
        roomNumber: classData.room || undefined          // Map room to roomNumber
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
      
      // Map frontend fields to backend DTO
      const apiPayload: any = {
        ...classData,
        mainTeacherId: classData.teacherId || undefined,
        roomNumber: classData.room || undefined
      };
      
      // Remove frontend-only fields if necessary, but spreading classData might include them.
      // Ideally we construct the payload explicitly.
      const cleanPayload = {
        name: classData.name,
        level: classData.level,
        academicYear: classData.academicYear,
        capacity: classData.capacity,
        mainTeacherId: classData.teacherId || undefined,
        roomNumber: classData.room || undefined,
        status: classData.status // If status exists
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
