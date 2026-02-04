import axios, { AxiosInstance } from 'axios';
import { AttendanceRecord, AttendanceStatus } from '../../types';

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
   * Helper to map frontend status to backend status (Enum -> French)
   */
  private mapStatusToBackend(status: AttendanceStatus | string | undefined): string | undefined {
    if (!status) return status;
    return status;
  }

  private mapStatusFromBackend(status: string | undefined): AttendanceStatus {
    if (!status) return AttendanceStatus.PRESENT; // Default fallback

    // Normalize the status string
    const normalized = status.trim();

    // Handle French values (what backend actually returns)
    if (normalized === 'Présent' || normalized === 'present') return AttendanceStatus.PRESENT;
    if (normalized === 'Absent' || normalized === 'absent') return AttendanceStatus.ABSENT;
    if (normalized === 'Retard' || normalized === 'late' || normalized === 'En retard') return AttendanceStatus.LATE;
    if (normalized === 'Excusé' || normalized === 'excused' || normalized === 'Absent excusé') return AttendanceStatus.EXCUSED;

    // Log unexpected values for debugging
    console.warn(`[AttendanceService] Unexpected status value: "${status}", defaulting to PRESENT`);
    return AttendanceStatus.PRESENT;
  }

  /**
   * Helper to transform single record from backend
   */
  private transformResponse(record: any): AttendanceRecord {
    if (!record) return record;
    return {
      ...record,
      status: this.mapStatusFromBackend(record.status)
    };
  }

  /**
   * Create single attendance record
   */
  async create(data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const payload = {
      ...data,
      status: this.mapStatusToBackend(data.status)
    };
    const response = await this.api.post<any>('/', payload);
    return this.transformResponse(response.data);
  }

  /**
   * Create multiple attendance records in bulk (30 students)
   */
  async createBulk(records: Partial<AttendanceRecord>[]): Promise<AttendanceRecord[]> {
    const mappedRecords = records.map(r => ({
      ...r,
      status: this.mapStatusToBackend(r.status),
      // Ensure specific fields are passed correctly
      date: r.date,
      period: r.period // Explicitly pass period
    }));
    const response = await this.api.post<any[]>('/bulk', mappedRecords);
    return response.data.map(r => this.transformResponse(r));
  }

  /**
   * Get attendance by ID
   */
  async getById(id: string): Promise<AttendanceRecord> {
    const response = await this.api.get<any>(`/${id}`);
    return this.transformResponse(response.data);
  }

  /**
   * Get all attendance records with filters
   */
  async getAll(filters?: any): Promise<AttendanceRecord[]> {
    const response = await this.api.get<any[]>('/', { params: filters });
    return response.data.map(r => this.transformResponse(r));
  }

  /**
   * Get attendance by class
   */
  async getByClass(classId: string, filters?: any): Promise<AttendanceRecord[]> {
    const response = await this.api.get<any[]>('/', {
      params: { classId, ...filters },
    });
    return response.data.map(r => this.transformResponse(r));
  }

  /**
   * Get daily attendance for class
   */
  async getDailyAttendance(classId: string, date: string, period?: string): Promise<AttendanceRecord[]> {
    console.log(`[AttendanceService] fetching daily attendance: classId=${classId}, date=${date}, period=${period}`);
    const response = await this.api.get<any[]>(`/daily/${classId}`, {
      params: { date, period },
    });
    console.log(`[AttendanceService] received ${response.data?.length || 0} records for ${date} (${period})`);
    return response.data.map(r => this.transformResponse(r));
  }

  /**
   * Get attendance by student
   */
  async getByStudent(studentId: string, filters?: any): Promise<AttendanceRecord[]> {
    const response = await this.api.get<any[]>('/student', {
      params: { studentId, ...filters },
    });
    return response.data.map(r => this.transformResponse(r));
  }

  /**
   * Update attendance justification (parent action)
   */
  async updateJustification(
    id: string,
    justificationReason: string,
    justificationDocument?: string
  ): Promise<AttendanceRecord> {
    const response = await this.api.patch<any>(`/${id}/justification`, {
      isJustified: true,
      reason: justificationReason,
      justificationDocument,
    });
    return this.transformResponse(response.data);
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
    // Pattern might need mapping if it contains raw statuses
    return response.data.map((p: any) => ({
      ...p,
      status: this.mapStatusFromBackend(p.status)
    }));
  }

  /**
   * Get class absence rate (returns numbers, no status mapping needed)
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
