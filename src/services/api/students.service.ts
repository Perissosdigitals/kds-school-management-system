/**
 * Students API Service
 * Handles all student-related API calls
 */

import axios, { AxiosInstance } from 'axios';
import type { Student, CreateStudentDto, UpdateStudentDto } from '../../types';

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
      console.error('StudentsService: Error fetching students', error);
      throw error;
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
      console.error(`StudentsService: Error fetching student ${id}`, error);
      throw error;
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
      console.error('StudentsService: Error creating student', error);
      throw error;
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
      console.error(`StudentsService: Error updating student ${id}`, error);
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
      console.error(`StudentsService: Error deleting student ${id}`, error);
      throw error;
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
      console.error(`StudentsService: Error fetching students for class ${classId}`, error);
      return [];
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
      console.error('StudentsService: Error fetching student count', error);
      return 0;
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
      console.error('StudentsService: Error searching students', error);
      return [];
    }
  }
}

export const StudentsService = new StudentsServiceClass();
export default StudentsService;
