/**
 * API Services Index
 * Centralized export for all API services
 */

export { AuthService } from './auth.service';
export { StudentsService } from './students.service';
export { ClassesService } from './classes.service';
export { GradesService } from './grades.service';
export { SubjectsService } from './subjects.service';
export { AttendanceService } from './attendance.service';
export { DataManagementService } from './data-management.service';
export { APIConfigService } from './config.service';

export type { DataSource, APIConfiguration } from './config.service';
export type { LoginCredentials, AuthResponse } from './auth.service';
