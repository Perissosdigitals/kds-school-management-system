import type { User, Student, Teacher, SchoolClass, TimetableSession, FinancialTransaction, InventoryItem, Evaluation, Grade, PedagogicalNote, AttendanceLog, ImportBatch } from '../types';

/**
 * ⚠️ MOCK DATA DEPRECATED
 * All data now comes from the backend API.
 * These exports are maintained for legacy component compatibility during transition.
 */

export const allUsers: User[] = [];
export const teacherDetails: Teacher[] = [];
export const schoolClasses: SchoolClass[] = [];
export const allStudents: Student[] = [];
export const mockSchedule: TimetableSession[] = [];
export const evaluations: Evaluation[] = [];
export const grades: Grade[] = [];
export const pedagogicalNotes: PedagogicalNote[] = [];
export const attendanceLogs: AttendanceLog[] = [];
export const mockTransactions: FinancialTransaction[] = [];
export const mockInventory: InventoryItem[] = [];
export const importBatches: ImportBatch[] = [];
export const mockStudentCSVData = '';