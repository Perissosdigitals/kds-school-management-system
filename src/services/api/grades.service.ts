import axios, { AxiosInstance } from 'axios';
import type {
  Grade,
  CreateGradeDto,
  UpdateGradeDto,
  GradeFilters,
  ReportCard,
  ClassAverage
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class GradesServiceClass {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/grades`,
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
   * Create a single grade
   */
  async create(data: CreateGradeDto): Promise<Grade> {
    const response = await this.api.post<Grade>('/', data);
    return response.data;
  }

  /**
   * Create multiple grades in bulk
   */
  async createBulk(grades: CreateGradeDto[]): Promise<Grade[]> {
    const response = await this.api.post<Grade[]>('/bulk', grades);
    return response.data;
  }

  /**
   * Get grade by ID
   */
  async getById(id: string): Promise<Grade> {
    const response = await this.api.get<Grade>(`/${id}`);
    return response.data;
  }

  /**
   * Get all grades with filters
   */
  async getAll(filters?: GradeFilters): Promise<Grade[]> {
    const response = await this.api.get<Grade[]>('/', { params: filters });
    return response.data;
  }

  /**
   * Get grades by class
   */
  async getByClass(classId: string, filters?: Partial<GradeFilters>): Promise<Grade[]> {
    const response = await this.api.get<Grade[]>('/class', {
      params: { classId, ...filters },
    });
    return response.data;
  }

  /**
   * Get grades by student
   */
  async getByStudent(studentId: string, filters?: Partial<GradeFilters>): Promise<Grade[]> {
    const response = await this.api.get<Grade[]>('/student', {
      params: { studentId, ...filters },
    });
    return response.data;
  }

  /**
   * Get grades by teacher
   */
  async getByTeacher(teacherId: string, filters?: Partial<GradeFilters>): Promise<Grade[]> {
    const response = await this.api.get<Grade[]>('/teacher', {
      params: { teacherId, ...filters },
    });
    return response.data;
  }

  /**
   * Get student report card (bulletin)
   */
  async getReportCard(
    studentId: string,
    trimester: string,
    academicYear?: string
  ): Promise<ReportCard> {
    const response = await this.api.get<ReportCard>('/report-card/student', {
      params: { studentId, trimester, academicYear },
    });
    return response.data;
  }

  /**
   * Get class averages
   */
  async getClassAverages(
    classId: string,
    trimester: string,
    academicYear?: string
  ): Promise<ClassAverage[]> {
    const response = await this.api.get<ClassAverage[]>('/class/averages', {
      params: { classId, trimester, academicYear },
    });
    return response.data;
  }

  /**
   * Get teacher dashboard statistics
   */
  async getTeacherStats(teacherId: string, academicYear?: string): Promise<any> {
    const response = await this.api.get(`/teacher/${teacherId}/stats`, {
      params: { academicYear },
    });
    return response.data;
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(academicYear?: string): Promise<any> {
    const response = await this.api.get('/admin/stats', {
      params: { academicYear },
    });
    return response.data;
  }

  /**
   * Update grade
   */
  async update(id: string, data: UpdateGradeDto): Promise<Grade> {
    const response = await this.api.patch<Grade>(`/${id}`, data);
    return response.data;
  }

  /**
   * Delete grade
   */
  async delete(id: string): Promise<void> {
    await this.api.delete(`/${id}`);
  }

  /**
   * Get class ranking
   */
  async getClassRanking(
    classId: string,
    trimester: string,
    academicYear?: string
  ): Promise<any[]> {
    const response = await this.api.get('/class/ranking', {
      params: { classId, trimester, academicYear },
    });
    return response.data;
  }

  /**
   * Calculate weighted average
   * Formula: Σ(value/maxValue * 20 * coefficient) / Σcoefficient
   */
  calculateWeightedAverage(grades: Grade[]): number {
    if (grades.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalCoefficient = 0;

    grades.forEach((grade) => {
      const normalizedScore = (grade.value / grade.maxValue) * 20;
      totalWeightedScore += normalizedScore * grade.coefficient;
      totalCoefficient += grade.coefficient;
    });

    return totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;
  }

  /**
   * Validate grade value
   */
  validateGrade(value: number, maxValue: number): boolean {
    return !isNaN(value) && value >= 0 && value <= maxValue;
  }
}

export const GradesService = new GradesServiceClass();
