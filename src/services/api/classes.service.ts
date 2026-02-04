import axios, { AxiosInstance } from 'axios';
import type { SchoolClass, Student } from '../../types';

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
      console.error('ClassesService: Error fetching classes', error);
      throw error;
    }
  }

  async getById(id: string): Promise<SchoolClass> {
    try {
      const response = await this.api.get<SchoolClass>(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`ClassesService: Error fetching class ${id}`, error);
      throw error;
    }
  }

  async getStudents(classId: string): Promise<Student[]> {
    try {
      const response = await this.api.get<Student[]>(`/${classId}/students`);
      return response.data;
    } catch (error) {
      console.error(`ClassesService: Error fetching students for class ${classId}`, error);
      return [];
    }
  }
}

export const ClassesService = new ClassesServiceClass();
