import axios, { AxiosInstance } from 'axios';
import type { SchoolClass, Student } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

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
    const response = await this.api.get<SchoolClass[]>('/', { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<SchoolClass> {
    const response = await this.api.get<SchoolClass>(`/${id}`);
    return response.data;
  }

  async getStudents(classId: string): Promise<Student[]> {
    const response = await this.api.get<Student[]>(`/${classId}/students`);
    return response.data;
  }
}

export const ClassesService = new ClassesServiceClass();
