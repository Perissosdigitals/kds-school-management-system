/**
 * Constantes partagées pour le backend KDS
 */

export const USER_ROLES = {
  FOUNDER: 'founder',
  DIRECTOR: 'director',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  MANAGER: 'manager',
  AGENT: 'agent',
} as const;

export const DOCUMENT_TYPES = {
  BIRTH_CERTIFICATE: 'birth_certificate',
  ID_CARD: 'id_card',
  HEALTH_RECORD: 'health_record',
  ACADEMIC_TRANSCRIPT: 'academic_transcript',
  PARENTAL_AUTHORIZATION: 'parental_authorization',
  VACCINATION_RECORD: 'vaccination_record',
  OTHER: 'other',
} as const;

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
  MISSING: 'missing',
} as const;

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

export const TRANSACTION_TYPES = {
  TUITION: 'tuition',
  MEAL: 'meal',
  TRANSPORT: 'transport',
  ACTIVITY: 'activity',
  OTHER: 'other',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const IMPORT_BATCH_TYPES = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  GRADES: 'grades',
  ATTENDANCE: 'attendance',
  SUBJECTS: 'subjects',
  CLASSES: 'classes',
} as const;

export const IMPORT_BATCH_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const DAYS_OF_WEEK = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const ACADEMIC_LEVELS = [
  'Maternelle',
  'CP',
  'CE1',
  'CE2',
  'CM1',
  'CM2',
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  'Seconde',
  'Première',
  'Terminale',
] as const;
