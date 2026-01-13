/**
 * Students API Service
 * Handles all student-related API calls
 */

import axios, { AxiosInstance } from 'axios';
import type { Student, CreateStudentDto, UpdateStudentDto } from '../../types';
import { allStudents } from '../../../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class StudentsServiceClass {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/students`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get all students
   */
  async getAllStudents(): Promise<Student[]> {
    try {
      const response = await this.api.get('/', {
        params: { limit: 1000 }
      });
      return response.data;
    } catch (error) {
      console.warn('StudentsService: API error, using mock data', error);
      return allStudents;
    }
  }

  /**
   * Get a student by ID
   */
  async getStudentById(id: string): Promise<Student> {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.warn('StudentsService: API error, using mock data', error);
      const student = allStudents.find(s => s.id === id);
      if (!student) throw new Error('Student not found in mock data');
      return student;
    }
  }

  /**
   * Create a new student
   */
  async createStudent(data: CreateStudentDto): Promise<Student> {
    try {
      const response = await this.api.post('/', data);
      return response.data;
    } catch (error) {
      console.warn('StudentsService: API error, simulating creation', error);
      // Simulate creation
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        ...data,
        registrationDate: new Date().toISOString(),
        status: 'En attente'
      } as any;
      allStudents.push(newStudent);
      return newStudent;
    }
  }

  /**
   * Update a student
   */
  async updateStudent(id: string, data: UpdateStudentDto): Promise<Student> {
    try {
      const response = await this.api.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('StudentsService: API error, simulating update', error);
      const index = allStudents.findIndex(s => s.id === id);
      if (index !== -1) {
        allStudents[index] = { ...allStudents[index], ...data };
        return allStudents[index];
      }
      throw error;
    }
  }

  /**
   * Delete a student (soft delete)
   */
  async deleteStudent(id: string): Promise<void> {
    try {
      await this.api.delete(`/${id}`);
    } catch (error) {
      console.warn('StudentsService: API error, simulating delete', error);
      const index = allStudents.findIndex(s => s.id === id);
      if (index !== -1) {
        allStudents.splice(index, 1);
      }
    }
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId: string): Promise<Student[]> {
    try {
      const response = await this.api.get('/', {
        params: { classId },
      });
      return response.data;
    } catch (error) {
      console.warn('StudentsService: API error, using mock data', error);
      return allStudents.filter(s => s.classId === classId);
    }
  }

  /**
   * Get student count
   */
  async getStudentCount(): Promise<number> {
    try {
      const response = await this.api.get('/stats/count');
      return response.data.count;
    } catch (error) {
      console.warn('StudentsService: API error, using mock data', error);
      return allStudents.length;
    }
  }

  /**
   * Search students
   */
  async searchStudents(query: string): Promise<Student[]> {
    try {
      const response = await this.api.get('/search', {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.warn('StudentsService: API error, using mock data', error);
      const lowerQuery = query.toLowerCase();
      return allStudents.filter(s => 
        s.firstName.toLowerCase().includes(lowerQuery) || 
        s.lastName.toLowerCase().includes(lowerQuery) ||
        s.registrationNumber.toLowerCase().includes(lowerQuery)
      );
    }
  }
}

export const StudentsService = new StudentsServiceClass();
export default StudentsService;
