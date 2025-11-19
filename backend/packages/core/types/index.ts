/**
 * Types partagés entre le frontend et le backend KDS
 * Ces types doivent rester synchronisés avec types.ts du frontend
 */

export type UserRole = 'founder' | 'director' | 'teacher' | 'student' | 'parent' | 'admin' | 'accountant' | 'manager' | 'agent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType = 'birth_certificate' | 'id_card' | 'health_record' | 'academic_transcript' | 'parental_authorization' | 'vaccination_record' | 'other';
export type DocumentStatus = 'pending' | 'validated' | 'rejected' | 'missing';

export interface StudentDocument {
  id: string;
  studentId: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy?: string;
  validatedBy?: string;
  uploadedAt?: Date;
  validatedAt?: Date;
  rejectionReason?: string;
  changeHistory?: Array<{
    timestamp: Date;
    user: string;
    action: string;
  }>;
}

export interface Student {
  id: string;
  studentCode: string;
  enrollmentDate: Date;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'male' | 'female';
  nationality: string;
  birthPlace?: string;
  address?: string;
  phone?: string;
  email?: string;
  classId?: string;
  parentId?: string;
  academicLevel?: string;
  previousSchool?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };
  medicalInfo?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    bloodType?: string;
  };
  status: 'active' | 'inactive' | 'pending' | 'graduated' | 'transferred';
  documents?: StudentDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  specialization?: string[];
  hireDate?: Date;
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  mainTeacherId?: string;
  roomNumber?: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  categoryId?: string;
  grade: number;
  maxGrade: number;
  evaluationDate: Date;
  comment?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  subjectId: string;
  classId: string;
  createdBy: string;
  createdAt: Date;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimetableSlot {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  room?: string;
  dayOfWeek: number; // 1-7
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  recurrencePattern?: string;
  isActive: boolean;
  createdAt: Date;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AttendancePeriod = 'morning' | 'afternoon' | 'full_day';

export interface Attendance {
  id: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  period?: AttendancePeriod;
  reason?: string;
  recordedBy: string;
  createdAt: Date;
}

export type TransactionType = 'tuition' | 'meal' | 'transport' | 'activity' | 'other';
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface FinancialTransaction {
  id: string;
  studentId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  dueDate?: Date;
  paidDate?: Date;
  description?: string;
  reference?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ImportBatchType = 'students' | 'teachers' | 'grades' | 'attendance' | 'subjects' | 'classes';
export type ImportBatchStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | 'failed';

export interface ImportBatch {
  id: string;
  type: ImportBatchType;
  status: ImportBatchStatus;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  columnMapping?: Record<string, string>;
  validationRules?: Record<string, any>;
  createdBy: string;
  approvedBy?: string;
  reviewedBy?: string;
  createdAt: Date;
  approvedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorLog?: string;
  summary?: Record<string, any>;
}

// Query & Pagination Types
export interface DataQuery {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  select?: string[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}
