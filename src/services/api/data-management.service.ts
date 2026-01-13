import axios, { AxiosInstance } from 'axios';
import type { 
  Backup, 
  CreateBackupDto, 
  ValidationReport,
  MigrationPreview,
  MigrationResult,
  ExportFilters,
  ExportFormat,
  ImportValidationResult
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class DataManagementServiceClass {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/data`,
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

  // ===== EXPORT OPERATIONS =====

  /**
   * Export grades to Excel/CSV
   */
  async exportGrades(filters?: Partial<ExportFilters>): Promise<Blob> {
    const response = await this.api.get('/export/grades', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Export attendance records
   */
  async exportAttendance(filters?: Partial<ExportFilters>): Promise<Blob> {
    const response = await this.api.get('/export/attendance', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Export students list
   */
  async exportStudents(filters?: Partial<ExportFilters>): Promise<Blob> {
    const response = await this.api.get('/export/students', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Export teachers list
   */
  async exportTeachers(filters?: Partial<ExportFilters>): Promise<Blob> {
    const response = await this.api.get('/export/teachers', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Export classes list
   */
  async exportClasses(filters?: Partial<ExportFilters>): Promise<Blob> {
    const response = await this.api.get('/export/classes', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Export enrollments list
   */
  async exportEnrollments(filters?: Partial<ExportFilters>): Promise<Blob> {
    const response = await this.api.get('/export/enrollments', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Export all data (generates ZIP archive)
   */
  async exportAll(filters?: Partial<ExportFilters>): Promise<Blob> {
    const response = await this.api.get('/export/all', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  // ===== IMPORT OPERATIONS =====

  /**
   * Validate import file before actual import
   */
  async validateImport(
    file: File,
    dataType: string
  ): Promise<ImportValidationResult> {
    const formData = new FormData();
    formData.append('file', file);
    // Also append to body just in case, but controller expects query
    formData.append('dataType', dataType);

    const response = await this.api.post<ImportValidationResult>(
      '/validate-import',
      formData,
      {
        params: { type: dataType },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Import grades from Excel/CSV
   */
  async importGrades(file: File, options?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.api.post('/import/grades', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Import attendance records
   */
  async importAttendance(file: File, options?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.api.post('/import/attendance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Import students
   */
  async importStudents(file: File, options?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.api.post('/import/students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Import teachers
   */
  async importTeachers(file: File, options?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.api.post('/import/teachers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Import classes
   */
  async importClasses(file: File, options?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.api.post('/import/classes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Import enrollments
   */
  async importEnrollments(file: File, options?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.api.post('/import/enrollments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // ===== BACKUP OPERATIONS =====

  /**
   * Create database backup
   */
  async createBackup(data: CreateBackupDto): Promise<Backup> {
    const response = await this.api.post<Backup>('/backup', data);
    return response.data;
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<Backup[]> {
    const response = await this.api.get<Backup[]>('/backup/list');
    return response.data;
  }

  /**
   * Download backup file
   */
  async downloadBackup(backupId: string): Promise<Blob> {
    const response = await this.api.get(`/backup/${backupId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupId: string): Promise<any> {
    const response = await this.api.post(`/backup/${backupId}/restore`);
    return response.data;
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    await this.api.delete(`/backup/${backupId}`);
  }

  // ===== VALIDATION OPERATIONS =====

  /**
   * Validate grades data integrity
   */
  async validateGrades(options?: any): Promise<ValidationReport> {
    const response = await this.api.post<ValidationReport>(
      '/validate/grades',
      options
    );
    return response.data;
  }

  /**
   * Validate attendance data integrity
   */
  async validateAttendance(options?: any): Promise<ValidationReport> {
    const response = await this.api.post<ValidationReport>(
      '/validate/attendance',
      options
    );
    return response.data;
  }

  /**
   * Validate students data integrity
   */
  async validateStudents(options?: any): Promise<ValidationReport> {
    const response = await this.api.post<ValidationReport>(
      '/validate/students',
      options
    );
    return response.data;
  }

  /**
   * Run full data integrity check
   */
  async validateAll(): Promise<ValidationReport> {
    const response = await this.api.post<ValidationReport>('/validate/all');
    return response.data;
  }

  // ===== MIGRATION OPERATIONS =====

  /**
   * Preview academic year migration
   */
  async previewMigration(
    currentYear: string,
    newYear: string,
    options?: any
  ): Promise<MigrationPreview> {
    const response = await this.api.post<MigrationPreview>('/migrate/preview', {
      currentYear,
      newYear,
      ...options,
    });
    return response.data;
  }

  /**
   * Execute academic year migration
   */
  async executeMigration(
    currentYear: string,
    newYear: string,
    options?: any
  ): Promise<MigrationResult> {
    const response = await this.api.post<MigrationResult>('/migrate/execute', {
      currentYear,
      newYear,
      ...options,
    });
    return response.data;
  }

  /**
   * Rollback migration
   */
  async rollbackMigration(migrationId: string): Promise<any> {
    const response = await this.api.post(`/migrate/rollback/${migrationId}`);
    return response.data;
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<any[]> {
    const response = await this.api.get('/migrate/history');
    return response.data;
  }
}

export const DataManagementService = new DataManagementServiceClass();
