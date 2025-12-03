import axios, { AxiosInstance } from 'axios';
import type { Subject } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

class SubjectsServiceClass {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/subjects`,
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

  async getAll(filters?: any): Promise<Subject[]> {
    const response = await this.api.get<Subject[]>('/', { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<Subject> {
    const response = await this.api.get<Subject>(`/${id}`);
    return response.data;
  }
}

export const SubjectsService = new SubjectsServiceClass();
