// ===== USERS & AUTH =====
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  createdAt: string;
  updatedAt: string;
}

// ===== STUDENTS =====
export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  classId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// ===== CLASSES =====
export interface SchoolClass {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  maxStudents: number;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== SUBJECTS =====
export interface Subject {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  gradeLevel: string;
  createdAt: string;
  updatedAt: string;
}

// ===== GRADES =====
export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  evaluationType: string;
  value: number;
  maxValue: number;
  coefficient: number;
  trimester: string;
  academicYear: string;
  evaluationDate: string;
  title: string;
  comments?: string;
  visibleToParents: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGradeDto {
  studentId: string;
  subjectId: string;
  teacherId: string;
  evaluationType: string;
  value: number;
  maxValue: number;
  coefficient: number;
  trimester: string;
  academicYear: string;
  evaluationDate: string;
  title: string;
  comments?: string;
  visibleToParents: boolean;
}

export interface UpdateGradeDto {
  value?: number;
  maxValue?: number;
  coefficient?: number;
  evaluationType?: string;
  title?: string;
  comments?: string;
  visibleToParents?: boolean;
}

export interface GradeFilters {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  trimester?: string;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportCard {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  trimester: string;
  academicYear: string;
  subjects: {
    subjectId: string;
    subjectName: string;
    coefficient: number;
    grades: Grade[];
    average: number;
  }[];
  generalAverage: number;
  rank?: number;
  totalStudents?: number;
  comments?: string;
}

export interface ClassAverage {
  subjectId: string;
  subjectName: string;
  average: number;
  minGrade: number;
  maxGrade: number;
  totalStudents: number;
}

// ===== ATTENDANCE =====
export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  session: 'morning' | 'afternoon';
  status: 'present' | 'absent' | 'late';
  arrivalTime?: string;
  isJustified: boolean;
  justificationReason?: string;
  justificationDocument?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ===== DATA MANAGEMENT =====

// Export Types
export type ExportFormat = 'excel' | 'csv' | 'pdf';

export interface ExportFilters {
  academicYear?: string;
  trimester?: string;
  classId?: string;
  studentId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  format?: ExportFormat;
}

// Import Types
export interface ImportValidationResult {
  isValid: boolean;
  validRecords: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

// Backup Types
export interface Backup {
  id: string;
  name: string;
  description?: string;
  filename: string;
  size: number;
  compressed: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateBackupDto {
  name: string;
  description?: string;
  compress?: boolean;
}

// Validation Types
export interface ValidationReport {
  isValid: boolean;
  timestamp: string;
  dataType: 'grades' | 'attendance' | 'students' | 'all';
  checks: Array<{
    checkName: string;
    passed: boolean;
    message: string;
    affectedRecords?: number;
  }>;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
  errors: Array<{
    recordId: string;
    field: string;
    message: string;
  }>;
}

// Migration Types
export interface MigrationPreview {
  currentYear: string;
  newYear: string;
  timestamp: string;
  currentClasses: number;
  studentsToMigrate: number;
  gradesToArchive: number;
  estimatedClassesToCreate: number;
  levelTransitions: Array<{
    from: string;
    to: string;
    studentsCount: number;
  }>;
  warnings: string[];
}

export interface MigrationResult {
  id: string;
  status: 'success' | 'failed' | 'partial';
  currentYear: string;
  newYear: string;
  timestamp: string;
  classesCreated: number;
  studentsMigrated: number;
  gradesArchived: number;
  errors: Array<{
    type: string;
    message: string;
    recordId?: string;
  }>;
  duration: number; // in milliseconds
}
