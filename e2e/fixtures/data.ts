/**
 * E2E Test Fixtures
 * Reference: E2E_TESTING_STUDY.md Section 1.3 (Seeds & Fixtures)
 * 
 * Provides test data for all 4 E2E cycles:
 * - 4 users (admin, teacher, parent, student)
 * - 6 classes (CP, CE1, CE2, CM1, CM2, 6ème)
 * - 129 students
 * - 8 subjects
 */

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  firstName: string;
  lastName: string;
}

export interface TestStudent {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  classId: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
}

export interface TestClass {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  maxStudents: number;
  teacherId: string;
}

export interface TestSubject {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  gradeLevel: string;
}

// Test Users (from seeds - using existing backend users)
export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    id: 'admin-user-uuid',
    email: 'admin@ksp-school.ci',
    password: 'admin123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'KSP',
  },
  teacher: {
    id: 'teacher-user-uuid',
    email: 'mkone@ksp-school.ci',
    password: 'teacher123',
    role: 'teacher',
    firstName: 'Jean',
    lastName: 'Kouassi',
  },
  parent: {
    id: 'parent-user-uuid',
    email: 'parent1@example.ci',
    password: 'parent123',
    role: 'parent',
    firstName: 'Marie',
    lastName: 'Koné',
  },
  student: {
    id: 'student-user-uuid',
    email: 'student1@ksp-school.ci',
    password: 'student123',
    role: 'student',
    firstName: 'Aya',
    lastName: 'Koné',
  },
};

// Test Classes (6 classes)
export const TEST_CLASSES: Record<string, TestClass> = {
  cp: {
    id: 'class-cp-uuid',
    name: 'CP',
    level: 'CP',
    academicYear: '2024-2025',
    maxStudents: 30,
    teacherId: TEST_USERS.teacher.id,
  },
  ce1: {
    id: 'class-ce1-uuid',
    name: 'CE1',
    level: 'CE1',
    academicYear: '2024-2025',
    maxStudents: 30,
    teacherId: TEST_USERS.teacher.id,
  },
  ce2: {
    id: 'class-ce2-uuid',
    name: 'CE2',
    level: 'CE2',
    academicYear: '2024-2025',
    maxStudents: 30,
    teacherId: TEST_USERS.teacher.id,
  },
  cm1: {
    id: 'class-cm1-uuid',
    name: 'CM1',
    level: 'CM1',
    academicYear: '2024-2025',
    maxStudents: 30,
    teacherId: TEST_USERS.teacher.id,
  },
  cm2: {
    id: 'class-cm2-uuid',
    name: 'CM2',
    level: 'CM2',
    academicYear: '2024-2025',
    maxStudents: 30,
    teacherId: TEST_USERS.teacher.id,
  },
  sixieme: {
    id: 'class-6eme-uuid',
    name: '6ème',
    level: '6ème',
    academicYear: '2024-2025',
    maxStudents: 30,
    teacherId: TEST_USERS.teacher.id,
  },
};

// Test Subjects (8 subjects)
export const TEST_SUBJECTS: Record<string, TestSubject> = {
  francais: {
    id: 'subject-francais-uuid',
    name: 'Français',
    code: 'FR',
    coefficient: 3,
    gradeLevel: 'Tous',
  },
  mathematiques: {
    id: 'subject-maths-uuid',
    name: 'Mathématiques',
    code: 'MATH',
    coefficient: 3,
    gradeLevel: 'Tous',
  },
  anglais: {
    id: 'subject-anglais-uuid',
    name: 'Anglais',
    code: 'ANG',
    coefficient: 2,
    gradeLevel: 'Tous',
  },
  svt: {
    id: 'subject-svt-uuid',
    name: 'SVT',
    code: 'SVT',
    coefficient: 2,
    gradeLevel: 'Collège',
  },
  physique: {
    id: 'subject-physique-uuid',
    name: 'Physique-Chimie',
    code: 'PC',
    coefficient: 2,
    gradeLevel: 'Collège',
  },
  histoire: {
    id: 'subject-histoire-uuid',
    name: 'Histoire-Géographie',
    code: 'HG',
    coefficient: 2,
    gradeLevel: 'Tous',
  },
  eps: {
    id: 'subject-eps-uuid',
    name: 'EPS',
    code: 'EPS',
    coefficient: 1,
    gradeLevel: 'Tous',
  },
  arts: {
    id: 'subject-arts-uuid',
    name: 'Arts Plastiques',
    code: 'ART',
    coefficient: 1,
    gradeLevel: 'Tous',
  },
};

// Sample test students (subset of 129)
export const TEST_STUDENTS: TestStudent[] = [
  {
    id: 'student-001-uuid',
    registrationNumber: 'KDS20240001',
    firstName: 'Aya',
    lastName: 'Koné',
    classId: TEST_CLASSES.cp.id,
    dateOfBirth: '2017-03-15',
    gender: 'F',
  },
  {
    id: 'student-002-uuid',
    registrationNumber: 'KDS20240002',
    firstName: 'Kouadio',
    lastName: 'Yao',
    classId: TEST_CLASSES.cp.id,
    dateOfBirth: '2017-05-22',
    gender: 'M',
  },
  {
    id: 'student-003-uuid',
    registrationNumber: 'KDS20240003',
    firstName: 'Fatou',
    lastName: 'Traoré',
    classId: TEST_CLASSES.cp.id,
    dateOfBirth: '2017-07-10',
    gender: 'F',
  },
  // ... Additional 126 students in actual seed data
];

// Test Grade Data
export const TEST_GRADE_DATA = {
  evaluationType: 'Devoir Surveillé',
  maxValue: 20,
  coefficient: 2,
  trimester: 'Trimestre 1',
  academicYear: '2024-2025',
  visibleToParents: true,
};

// Test Attendance Data
export const TEST_ATTENDANCE_DATA = {
  academicYear: '2024-2025',
  sessions: ['morning', 'afternoon'] as const,
  statuses: ['present', 'absent', 'late'] as const,
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
  },
  grades: {
    create: '/api/v1/grades',
    createBulk: '/api/v1/grades/bulk',
    getByClass: '/api/v1/grades/class',
    reportCard: '/api/v1/grades/report-card/student',
  },
  attendance: {
    create: '/api/v1/attendance',
    createBulk: '/api/v1/attendance/bulk',
    justify: '/api/v1/attendance/:id/justification',
    stats: '/api/v1/attendance/stats',
  },
  dataManagement: {
    export: '/api/v1/data/export',
    import: '/api/v1/data/import',
    backup: '/api/v1/data/backup',
    validate: '/api/v1/data/validate',
    migrate: '/api/v1/data/migrate',
  },
};

// Expected Response Times (from E2E_TESTING_STUDY.md Performance metrics)
export const PERFORMANCE_THRESHOLDS = {
  api: {
    get: 100, // p95 < 100ms for GET requests
    post: 500, // p95 < 500ms for POST requests
    export: 2000, // < 2s for 500 records
  },
  ui: {
    pageLoad: 3000, // < 3s
    formSubmit: 1000, // < 1s feedback
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  grade: {
    min: 0,
    max: 20, // Default max, can vary per evaluation
  },
  bulk: {
    maxRecords: 50, // 30 students + margin
  },
};
