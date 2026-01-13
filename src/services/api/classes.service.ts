import axios, { AxiosInstance } from 'axios';
import type { SchoolClass, Student } from '../../types';
import { schoolClasses, allStudents } from '../../../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ClassesServiceClass {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/classes`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getAll(filters?: any): Promise<SchoolClass[]> {
    try {
      const response = await this.api.get<SchoolClass[]>('/', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('ClassesService: API error, using mock data', error);
      return schoolClasses;
    }
  }

  async getById(id: string): Promise<SchoolClass> {
    try {
      const response = await this.api.get<SchoolClass>(`/${id}`);
      return response.data;
    } catch (error) {
      console.warn('ClassesService: API error, using mock data', error);
      const schoolClass = schoolClasses.find(c => c.id === id);
      if (!schoolClass) throw new Error('Class not found in mock data');
      return schoolClass;
    }
  }

  async getStudents(classId: string): Promise<Student[]> {
    try {
      const response = await this.api.get<Student[]>(`/${classId}/students`);
      return response.data;
    } catch (error) {
      console.warn('ClassesService: API error, using mock data', error);
      // Try to find class to get its level
      const schoolClass = schoolClasses.find(c => c.id === classId);
      if (schoolClass) {
         return allStudents.filter(s => s.gradeLevel === schoolClass.level);
      }
      return [];
    }
  }
}

export const ClassesService = new ClassesServiceClass();
