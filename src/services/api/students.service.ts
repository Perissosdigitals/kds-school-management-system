/**
 * Students API Service
 * Handles all student-related API calls
 */

import axios, { AxiosInstance } from 'axios';
import type { Student, CreateStudentDto, UpdateStudentDto } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

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
    const response = await this.api.get('/');
    return response.data;
  }

  /**
   * Get a student by ID
   */
  async getStudentById(id: string): Promise<Student> {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  /**
   * Create a new student
   */
  async createStudent(data: CreateStudentDto): Promise<Student> {
    const response = await this.api.post('/', data);
    return response.data;
  }

  /**
   * Update a student
   */
  async updateStudent(id: string, data: UpdateStudentDto): Promise<Student> {
    const response = await this.api.put(`/${id}`, data);
    return response.data;
  }

  /**
   * Delete a student (soft delete)
   */
  async deleteStudent(id: string): Promise<void> {
    await this.api.delete(`/${id}`);
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId: string): Promise<Student[]> {
    const response = await this.api.get('/', {
      params: { classId },
    });
    return response.data;
  }

  /**
   * Get student count
   */
  async getStudentCount(): Promise<number> {
    const response = await this.api.get('/stats/count');
    return response.data.count;
  }

  /**
   * Search students
   */
  async searchStudents(query: string): Promise<Student[]> {
    const response = await this.api.get('/search', {
      params: { q: query },
    });
    return response.data;
  }
}

export const StudentsService = new StudentsServiceClass();
export default StudentsService;
