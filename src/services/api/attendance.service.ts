import axios, { AxiosInstance } from 'axios';
import type { AttendanceRecord } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class AttendanceServiceClass {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/attendance`,
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

  /**
   * Create single attendance record
   */
  async create(data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const response = await this.api.post<AttendanceRecord>('/', data);
    return response.data;
  }

  /**
   * Create multiple attendance records in bulk (30 students)
   */
  async createBulk(records: Partial<AttendanceRecord>[]): Promise<AttendanceRecord[]> {
    const response = await this.api.post<AttendanceRecord[]>('/bulk', { records });
    return response.data;
  }

  /**
   * Get attendance by ID
   */
  async getById(id: string): Promise<AttendanceRecord> {
    const response = await this.api.get<AttendanceRecord>(`/${id}`);
    return response.data;
  }

  /**
   * Get all attendance records with filters
   */
  async getAll(filters?: any): Promise<AttendanceRecord[]> {
    const response = await this.api.get<AttendanceRecord[]>('/', { params: filters });
    return response.data;
  }

  /**
   * Get attendance by class
   */
  async getByClass(classId: string, filters?: any): Promise<AttendanceRecord[]> {
    const response = await this.api.get<AttendanceRecord[]>('/class', {
      params: { classId, ...filters },
    });
    return response.data;
  }

  /**
   * Get attendance by student
   */
  async getByStudent(studentId: string, filters?: any): Promise<AttendanceRecord[]> {
    const response = await this.api.get<AttendanceRecord[]>('/student', {
      params: { studentId, ...filters },
    });
    return response.data;
  }

  /**
   * Update attendance justification (parent action)
   */
  async updateJustification(
    id: string,
    justificationReason: string,
    justificationDocument?: string
  ): Promise<AttendanceRecord> {
    const response = await this.api.patch<AttendanceRecord>(`/${id}/justification`, {
      justificationReason,
      justificationDocument,
    });
    return response.data;
  }

  /**
   * Get attendance statistics
   */
  async getStats(filters?: any): Promise<any> {
    const response = await this.api.get('/stats', { params: filters });
    return response.data;
  }

  /**
   * Get student attendance pattern (60 days)
   */
  async getStudentPattern(studentId: string, days: number = 60): Promise<any> {
    const response = await this.api.get(`/student/${studentId}/pattern`, {
      params: { days },
    });
    return response.data;
  }

  /**
   * Get class absence rate
   */
  async getClassAbsenceRate(classId: string, filters?: any): Promise<any> {
    const response = await this.api.get(`/class/${classId}/absence-rate`, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get most absent students
   */
  async getMostAbsentStudents(classId?: string, limit: number = 10): Promise<any[]> {
    const response = await this.api.get('/most-absent', {
      params: { classId, limit },
    });
    return response.data;
  }

  /**
   * Delete attendance record
   */
  async delete(id: string): Promise<void> {
    await this.api.delete(`/${id}`);
  }
}

export const AttendanceService = new AttendanceServiceClass();
