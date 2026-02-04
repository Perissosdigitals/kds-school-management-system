import { httpClient } from '../httpClient';
import type { Student, SchoolClass, Teacher, User } from '../../types';
import { ActivityService } from './activity.service';
import { AuthService } from './auth.service';

// Helper function to convert date to ISO 8601 format (yyyy-MM-dd)
const toISODateString = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0]; // Returns yyyy-MM-dd
};

// Mapper pour convertir les données de l'API au format frontend
const mapApiStudentToFrontend = (apiStudent: any): Student => {
  return {
    id: apiStudent.id || apiStudent.student_code,
    registrationDate: toISODateString(apiStudent.enrollment_date || apiStudent.registrationDate || new Date()),
    lastName: apiStudent.last_name || apiStudent.lastName || '',
    firstName: apiStudent.first_name || apiStudent.firstName || '',
    dob: toISODateString(apiStudent.dob || apiStudent.birth_date),
    gender: apiStudent.gender === 'male' ? 'Masculin' :
      apiStudent.gender === 'female' ? 'Féminin' :
        apiStudent.gender,
    nationality: apiStudent.nationality || 'Ivoirienne',
    birthPlace: apiStudent.birth_place || apiStudent.birthPlace || '',
    address: apiStudent.address || '',
    phone: apiStudent.phone || '',
    email: apiStudent.email || '',
    gradeLevel: apiStudent.class_name || apiStudent.academic_level || apiStudent.gradeLevel || '',
    classId: apiStudent.class_id || apiStudent.classId,
    previousSchool: apiStudent.previous_school || apiStudent.previousSchool || '',
    emergencyContactName: apiStudent.emergency_contact || apiStudent.emergencyContactName || '',
    emergencyContactPhone: apiStudent.emergencyContactPhone || '',
    medicalInfo: apiStudent.medical_info || apiStudent.medicalInfo || '',
    registrationNumber: apiStudent.registrationNumber || apiStudent.registration_number || '',
    status: apiStudent.status === 'active' ? 'Actif' : apiStudent.status === 'inactive' ? 'Inactif' : apiStudent.status || 'En attente',
    documents: apiStudent.documents || [],
    photoUrl: apiStudent.photoUrl || apiStudent.photo_url || undefined
  };
};

/**
 * Enrichit un élève avec sa classe et son enseignant
 */
const enrichStudentWithRelations = async (
  student: Student,
  providedClasses?: SchoolClass[],
  providedTeachers?: Teacher[]
): Promise<Student> => {
  const classes = providedClasses || [];
  const teachers = providedTeachers || [];

  if (classes.length === 0 || teachers.length === 0) {
    return student;
  }

  let studentClass = student.classId
    ? classes.find(c => c.id === student.classId)
    : undefined;

  if (!studentClass && student.gradeLevel) {
    studentClass = classes.find(c => c.level === student.gradeLevel);
  }

  let teacher = undefined;
  if (studentClass?.teacherId) {
    teacher = teachers.find(t => t.id === studentClass.teacherId);
  } else if (student.teacherId) {
    teacher = teachers.find(t => t.id === student.teacherId);
  }

  return {
    ...student,
    classId: studentClass?.id || student.classId,
    class: studentClass,
    teacherId: teacher?.id || student.teacherId,
    teacher: teacher
  };
};

export const StudentsService = {
  /**
   * Récupère la liste de tous les élèves
   */
  async getStudents(
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      gradeLevel?: string;
      status?: string;
      gender?: string;
      startDate?: string;
      endDate?: string;
      teacherId?: string;
      classId?: string;
    },
    options?: { classes?: SchoolClass[]; teachers?: Teacher[] }
  ): Promise<Student[]> {
    try {
      console.log('StudentsService: Requête API pour les élèves...');
      const response = await httpClient.get<any[]>('/students', { params });
      const students = response.data.map(mapApiStudentToFrontend);

      const enrichedStudents = await Promise.all(
        students.map(s => enrichStudentWithRelations(s, options?.classes, options?.teachers))
      );

      return enrichedStudents;
    } catch (error) {
      console.error('StudentsService: Erreur API lors de la récupération des élèves', error);
      throw error;
    }
  },

  /**
   * Récupère un élève par ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    try {
      const response = await httpClient.get<any>(`/students/${id}`);
      const student = mapApiStudentToFrontend(response.data);
      return enrichStudentWithRelations(student);
    } catch (error) {
      console.error(`StudentsService: Erreur lors de la récupération de l'élève ${id}`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel élève
   */
  async createStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    try {
      let genderValue: 'Masculin' | 'Féminin' = 'Masculin';
      if (studentData.gender === 'Masculin' || studentData.gender === 'M' || studentData.gender === 'male') {
        genderValue = 'Masculin';
      } else if (studentData.gender === 'Féminin' || studentData.gender === 'F' || studentData.gender === 'female') {
        genderValue = 'Féminin';
      }

      const apiPayload = {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        dob: studentData.dob,
        gender: genderValue,
        nationality: studentData.nationality,
        birthPlace: studentData.birthPlace,
        address: studentData.address,
        phone: studentData.phone,
        email: studentData.email || undefined,
        gradeLevel: studentData.gradeLevel,
        classId: studentData.classId || undefined,
        previousSchool: studentData.previousSchool || undefined,
        emergencyContactName: studentData.emergencyContactName,
        emergencyContactPhone: studentData.emergencyContactPhone,
        medicalInfo: studentData.medicalInfo || undefined,
        status: studentData.status || 'En attente',
      };

      const response = await httpClient.post<any>('/students', apiPayload);
      const newStudent = mapApiStudentToFrontend(response.data);

      // Log activity
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        await ActivityService.logActivity(
          currentUser as User,
          'Inscription élève',
          'pedagogical',
          `Nouvel élève inscrit: ${newStudent.firstName} ${newStudent.lastName} (${newStudent.registrationNumber})`,
          newStudent.classId,
          newStudent.id
        );
      }

      return enrichStudentWithRelations(newStudent);
    } catch (error: any) {
      console.error('StudentsService: Erreur lors de la création de l\'élève', error);
      throw error;
    }
  },

  /**
   * Met à jour un élève
   */
  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    try {
      const currentStudent = await this.getStudentById(id);
      if (!currentStudent) throw new Error(`Student with id ${id} not found`);

      const completeData = { ...currentStudent, ...studentData };

      const apiPayload: any = {
        firstName: completeData.firstName,
        lastName: completeData.lastName,
        dob: completeData.dob,
        gender: completeData.gender,
        nationality: completeData.nationality,
        birthPlace: completeData.birthPlace,
        address: completeData.address,
        phone: completeData.phone || '',
        gradeLevel: completeData.gradeLevel,
        emergencyContactName: completeData.emergencyContactName,
        emergencyContactPhone: completeData.emergencyContactPhone,
      };

      if (completeData.email) apiPayload.email = completeData.email;
      if (completeData.classId) apiPayload.classId = completeData.classId;
      if (completeData.previousSchool) apiPayload.previousSchool = completeData.previousSchool;
      if (completeData.medicalInfo) apiPayload.medicalInfo = completeData.medicalInfo;
      if (completeData.status) apiPayload.status = completeData.status;

      const response = await httpClient.put<any>(`/students/${id}`, apiPayload);
      const updatedStudent = mapApiStudentToFrontend(response.data);

      // Log activity
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        await ActivityService.logActivity(
          currentUser as User,
          'Mise à jour élève',
          'pedagogical',
          `Dossier de l'élève ${updatedStudent.firstName} ${updatedStudent.lastName} mis à jour`,
          updatedStudent.classId,
          updatedStudent.id
        );
      }

      return enrichStudentWithRelations(updatedStudent);
    } catch (error: any) {
      console.error('StudentsService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime un élève
   */
  async deleteStudent(id: string): Promise<void> {
    try {
      await httpClient.delete(`/students/${id}`);
    } catch (error) {
      console.error('StudentsService: Erreur lors de la suppression', error);
      throw error;
    }
  },

  /**
   * Met à jour les documents d'un élève
   */
  async updateStudentDocuments(id: string, documents: any[]): Promise<Student> {
    try {
      const response = await httpClient.patch<any>(`/students/${id}/documents`, { documents });
      const student = mapApiStudentToFrontend(response.data);
      return enrichStudentWithRelations(student);
    } catch (error) {
      console.error(`StudentsService: Erreur lors de la mise à jour des documents`, error);
      throw error;
    }
  },

  /**
   * Upload la photo d'un élève
   */
  async uploadPhoto(id: string, file: File): Promise<Student> {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await httpClient.post<any>(`/students/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const student = mapApiStudentToFrontend(response.data);
      return enrichStudentWithRelations(student);
    } catch (error) {
      console.error(`StudentsService: Erreur lors de l'upload de la photo`, error);
      throw error;
    }
  }
};
