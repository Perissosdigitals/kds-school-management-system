import { httpClient } from '../httpClient';
import { allStudents } from '../../data/mockData';
import type { Student } from '../../types';

// Mapper pour convertir les données de l'API au format frontend
const mapApiStudentToFrontend = (apiStudent: any): Student => {
  return {
    id: apiStudent.id || apiStudent.student_code,
    registrationDate: apiStudent.enrollment_date 
      ? new Date(apiStudent.enrollment_date).toLocaleDateString('fr-FR')
      : new Date().toLocaleDateString('fr-FR'),
    lastName: apiStudent.last_name || apiStudent.lastName || '',
    firstName: apiStudent.first_name || apiStudent.firstName || '',
    dob: apiStudent.birth_date 
      ? new Date(apiStudent.birth_date).toLocaleDateString('fr-FR')
      : '',
    gender: apiStudent.gender === 'male' ? 'Masculin' : 'Féminin',
    nationality: apiStudent.nationality || 'Ivoirienne',
    birthPlace: apiStudent.birth_place || '',
    address: apiStudent.address || '',
    phone: apiStudent.phone || '',
    email: apiStudent.email || '',
    gradeLevel: apiStudent.class_name || apiStudent.academic_level || '',
    previousSchool: apiStudent.previous_school || '',
    emergencyContactName: apiStudent.emergency_contact || '',
    emergencyContactPhone: '',
    medicalInfo: apiStudent.medical_info || '',
    status: apiStudent.status === 'active' ? 'Actif' : 'Inactif',
    documents: []
  };
};

export const StudentsService = {
  /**
   * Récupère la liste de tous les élèves
   */
  async getStudents(params?: { page?: number; limit?: number }): Promise<Student[]> {
    try {
      console.log('StudentsService: Requête API pour les élèves...');
      const response = await httpClient.get<any[]>('/students', { params });
      const students = response.data.map(mapApiStudentToFrontend);
      console.log('StudentsService: Élèves chargés:', students.length);
      return students;
    } catch (error) {
      console.warn('StudentsService: Erreur API, utilisation des données mock', error);
      return allStudents;
    }
  },

  /**
   * Récupère un élève par ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    try {
      console.log(`StudentsService: Récupération de l'élève ${id}...`);
      const response = await httpClient.get<any>(`/students/${id}`);
      return mapApiStudentToFrontend(response.data);
    } catch (error) {
      console.warn(`StudentsService: Erreur lors de la récupération de l'élève ${id}`, error);
      return allStudents.find(s => s.id === id) || null;
    }
  },

  /**
   * Crée un nouvel élève
   */
  async createStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    try {
      console.log('StudentsService: Création d\'un nouvel élève...');
      const response = await httpClient.post<Student>('/students', studentData);
      return response.data;
    } catch (error) {
      console.error('StudentsService: Erreur lors de la création', error);
      throw error;
    }
  },

  /**
   * Met à jour un élève
   */
  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    try {
      console.log(`StudentsService: Mise à jour de l'élève ${id}...`);
      const response = await httpClient.put<Student>(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('StudentsService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime un élève
   */
  async deleteStudent(id: string): Promise<void> {
    try {
      console.log(`StudentsService: Suppression de l'élève ${id}...`);
      await httpClient.delete(`/students/${id}`);
    } catch (error) {
      console.error('StudentsService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};
