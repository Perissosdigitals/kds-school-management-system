// Export tous les composants du module de gestion de notes

export { default as GradeEntryForm } from './GradeEntryForm';
export { default as TeacherGradeDashboard } from './TeacherGradeDashboard';
export { default as StudentReportCard } from './StudentReportCard';
export { default as AdminGradeDashboard } from './AdminGradeDashboard';
export { default as SubjectGradesDetail } from './SubjectGradesDetail';
export { default as SubjectRowWithDetails } from './SubjectRowWithDetails';

// Types
export type {
  SubjectAverage,
  StudentPerformance,
  ClassStatistics,
  StudentAlert,
} from '../backend/apps/api-gateway/src/modules/grades/services/grade-calculation.service';
