import type { IDataSourceAdapter } from '../../types/data-source.types';
import { httpClient } from '../httpClient';
import type { Student } from '../../types';

/**
 * RestApiAdapter - Connects to the real NestJS backend API
 */
export class RestApiAdapter implements IDataSourceAdapter<Student> {
  id = 'rest-api';
  name = 'Backend REST API';
  description = 'Connexion au serveur NestJS sur http://localhost:3001/api/v1';

  async find(): Promise<Student[]> {
    console.log('[RestApiAdapter] Fetching students from backend API...');
    try {
      const response = await httpClient.get('/students');
      // L'API retourne directement un tableau
      const students = response.data;
      
      // Mapper les données API vers le format Student du frontend
      return students.map((apiStudent: any) => ({
        id: apiStudent.id,
        studentCode: apiStudent.registrationNumber,
        firstName: apiStudent.firstName,
        lastName: apiStudent.lastName,
        dateOfBirth: apiStudent.dob,
        gender: apiStudent.gender,
        class: apiStudent.class?.name || 'Sans classe',
        classId: apiStudent.classId,
        parentId: apiStudent.userId,
        status: apiStudent.status,
        enrollmentDate: apiStudent.registrationDate,
        address: apiStudent.address || '',
        nationality: apiStudent.nationality || '',
        emergencyContact: {
          name: apiStudent.emergencyContactName,
          phone: apiStudent.emergencyContactPhone
        },
        medicalInfo: apiStudent.medicalInfo || {}
      }));
    } catch (error) {
      console.error('[RestApiAdapter] Error fetching students:', error);
      throw new Error('Impossible de récupérer les étudiants depuis l\'API');
    }
  }

  async findById(id: string): Promise<Student | undefined> {
    console.log(`[RestApiAdapter] Fetching student ${id} from backend API...`);
    try {
      const response = await httpClient.get(`/students/${id}`);
      const apiStudent = response.data;
      
      return {
        id: apiStudent.id,
        studentCode: apiStudent.registrationNumber,
        firstName: apiStudent.firstName,
        lastName: apiStudent.lastName,
        dateOfBirth: apiStudent.dob,
        gender: apiStudent.gender,
        class: apiStudent.class?.name || 'Sans classe',
        classId: apiStudent.classId,
        parentId: apiStudent.userId,
        status: apiStudent.status,
        enrollmentDate: apiStudent.registrationDate,
        address: apiStudent.address || '',
        nationality: apiStudent.nationality || '',
        emergencyContact: {
          name: apiStudent.emergencyContactName,
          phone: apiStudent.emergencyContactPhone
        },
        medicalInfo: apiStudent.medicalInfo || {}
      };
    } catch (error) {
      console.error(`[RestApiAdapter] Error fetching student ${id}:`, error);
      return undefined;
    }
  }

  async create(data: Omit<Student, 'id'>): Promise<Student> {
    console.log('[RestApiAdapter] Creating student via backend API...', data);
    try {
      const response = await httpClient.post('/students', {
        studentCode: data.studentCode,
        birthDate: data.dateOfBirth,
        gender: data.gender,
        classId: data.classId,
        parentId: data.parentId,
        enrollmentDate: data.enrollmentDate,
        address: data.address,
        nationality: data.nationality,
        emergencyContact: data.emergencyContact,
        medicalInfo: data.medicalInfo,
        status: data.status || 'active'
      });
      
      const apiStudent = response.data;
      return {
        id: apiStudent.id,
        ...data
      };
    } catch (error) {
      console.error('[RestApiAdapter] Error creating student:', error);
      throw new Error('Impossible de créer l\'étudiant');
    }
  }

  async update(id: string, data: Partial<Student>): Promise<Student | undefined> {
    console.log(`[RestApiAdapter] Updating student ${id} via backend API...`, data);
    try {
      const response = await httpClient.put(`/students/${id}`, data);
      const apiStudent = response.data;
      
      return {
        id: apiStudent.id,
        studentCode: apiStudent.registrationNumber,
        firstName: apiStudent.firstName,
        lastName: apiStudent.lastName,
        dateOfBirth: apiStudent.dob,
        gender: apiStudent.gender,
        class: apiStudent.class?.name || 'Sans classe',
        classId: apiStudent.classId,
        parentId: apiStudent.userId,
        status: apiStudent.status,
        enrollmentDate: apiStudent.registrationDate,
        address: apiStudent.address || '',
        nationality: apiStudent.nationality || '',
        emergencyContact: {
          name: apiStudent.emergencyContactName,
          phone: apiStudent.emergencyContactPhone
        },
        medicalInfo: apiStudent.medicalInfo || {}
      };
    } catch (error) {
      console.error(`[RestApiAdapter] Error updating student ${id}:`, error);
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    console.log(`[RestApiAdapter] Deleting student ${id} via backend API...`);
    try {
      await httpClient.delete(`/students/${id}`);
      return true;
    } catch (error) {
      console.error(`[RestApiAdapter] Error deleting student ${id}:`, error);
      return false;
    }
  }
}
