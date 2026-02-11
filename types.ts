export type Page =
  | 'dashboard'
  | 'student-registration'
  | 'student-management'
  | 'teacher-management'
  | 'finances'
  | 'inventory'
  | 'reports'
  | 'documentation'
  | 'user-management'
  | 'school-life'
  | 'grades-management'
  | 'class-management'
  | 'data-management'
  | 'activity-log'
  | 'user-profile'
  | 'module-management';

export type UserRole =
  | 'director' | 'admin' | 'teacher' | 'accountant' | 'manager' | 'agent' | 'student' | 'parent'
  | 'fondatrice' | 'directrice' | 'agent_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  name?: string;
  avatar_url?: string;
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  custom_permissions?: Record<string, boolean>;
}

export type DocumentType = 'Extrait de naissance' | 'Carnet de vaccination' | 'Autorisation parentale' | 'Fiche scolaire' | 'report_card' | 'general';
export type DocumentStatus = 'Manquant' | 'En attente' | 'Validé' | 'Rejeté' | 'pending' | 'approved' | 'rejected' | 'missing';

export interface DocumentHistoryLog {
  timestamp: string;
  user: string;
  action: string;
}

export interface StudentDocument {
  id?: string;
  registrationNumber?: string;
  type: DocumentType;
  status: DocumentStatus;
  fileData?: string; // Base64 data URL
  fileName?: string;
  updatedAt?: string;
  rejectionReason?: string;
  history?: DocumentHistoryLog[];
}

export interface Student {
  id: string;
  registrationNumber?: string;
  registrationDate: string;
  lastName: string;
  firstName: string;
  dob: string;
  gender: 'Masculin' | 'Féminin' | 'M' | 'F' | 'male' | 'female'; // Support multiple formats
  nationality: string;
  birthPlace: string;
  address: string;
  phone: string;
  email: string;
  gradeLevel: string;
  previousSchool: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalInfo: string;
  status: 'Actif' | 'Inactif' | 'En attente';
  documents: StudentDocument[];
  photoUrl?: string;
  // Relational data
  classId?: string;
  class?: SchoolClass;
  teacherId?: string;
  teacher?: Teacher;
  grades?: Grade[];
  attendanceRecords?: AttendanceLog[];
}

export interface Teacher {
  id: string;
  registrationNumber?: string;
  lastName: string;
  firstName: string;
  subject: string;
  phone: string;
  email: string;
  status: 'Actif' | 'Inactif';
  hireDate?: string;
  specialization?: string;
  subjects?: string[];
  // Relational data
  classes?: SchoolClass[];
  classAssignments?: TeacherClassAssignment[];
  students?: Student[];
  address?: string;
  emergencyContact?: string;
  qualifications?: string;
}

export interface Statistics {
  totalStudents: number;
  totalStaff: number;
  pendingPayments: number;
  inventoryAlerts: number;
}

export interface RecentActivity {
  type: 'inscription' | 'systeme' | 'paiement';
  icon: string;
  title: string;
  time: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  studentName: string;
  gradeLevel?: string; // Optional: for transactions not linked to a student
  type: 'Paiement Scolarité' | 'Subvention' | 'Bourse';
  amount: number;
  status: 'Payé' | 'En attente';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Uniforme' | 'Fourniture Scolaire' | 'Matériel Pédagogique' | 'Autre';
  quantity: number;
  unit: string; // e.g., 'pièces', 'boîtes'
  stockStatus: 'En Stock' | 'Stock Faible' | 'En Rupture';
  lastUpdated: string;
}

// Backend uses these exact values - DO NOT CHANGE without updating backend
export enum AttendanceStatus {
  PRESENT = 'Présent',
  ABSENT = 'Absent',
  LATE = 'Retard',
  EXCUSED = 'Excusé'
}

// Legacy type for backward compatibility
export type AttendanceStatusString = 'Présent' | 'Absent' | 'Retard' | 'Excusé' | 'En retard';

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  classId?: string;
  date?: string;
  period?: string;
  status: AttendanceStatus | AttendanceStatusString;
  arrivalTime?: string;
  reason?: string;
  isJustified?: boolean;
  comments?: string;
  recordedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  student?: Student;
  class?: SchoolClass;
}

export type TeacherStatus = 'Actif' | 'Inactif';
export type TeacherRole = 'main' | 'sports' | 'art' | 'music' | 'science' | 'language' | 'computer' | 'other';

export interface TeacherClassAssignment {
  id: string;
  teacherId: string;
  classId: string;
  role: TeacherRole;
  assignedAt: string;
  teacher?: Teacher;
  class?: SchoolClass;
}

export interface SchoolClass {
  id: string;
  registrationNumber?: string;
  name: string;
  level: string;
  teacherId?: string;
  teacherName?: string;
  capacity?: number;
  currentOccupancy?: number;
  room?: string;
  academicYear?: string;
  schedule?: TimetableSession[];
  // Relational data
  students?: Student[];
  teacher?: Teacher;
  teacherAssignments?: TeacherClassAssignment[];
}

export interface Subject {
  id: string;
  registrationNumber?: string;
  name: string;
  code: string;
  color?: string;
  description?: string;
  gradeLevel?: string;
  weeklyHours?: number;
  coefficient?: number;
}

export interface TimetableSession {
  id: string;
  registrationNumber?: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  subject: string;
  subjectId?: string; // Added for backend linking
  classId: string;
  teacherId: string;
  room: string;
}

export interface SpecialEvent {
  id: string;
  title: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
}

export interface TimetableLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface Evaluation {
  id: string;
  classId: string;
  subject: string;
  title: string;
  date: string;
  maxScore: number;
}

export interface Grade {
  id?: string;
  studentId: string;
  studentName?: string;
  evaluationId: string;
  evaluationTitle?: string;
  subject?: string;
  score: number | null;
  maxGrade?: number;
  date?: string;
  teacher?: string;
  comment: string;
}

export interface PedagogicalNote {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  timestamp: string;
  note: string;
}

export interface AttendanceLog {
  id: string;
  studentId: string;
  date: string;
  status: 'Absent' | 'En retard';
}

export type ImportBatchStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export type ImportDataType =
  | 'Liste des Classes'
  | 'Transactions Financières'
  | 'Liste des Élèves'
  | 'Liste des Professeurs'
  | 'Saisie des Notes'
  | 'État de l\'Inventaire'
  | 'Liste des Utilisateurs';

export interface ImportBatch {
  id: string;
  dataType: ImportDataType;
  fileName: string;
  fileContent: string;
  submittedBy: string;
  submittedAt: string;
  status: ImportBatchStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Standardized API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    total: number;
    pageSize: number;
  };
}

// =============================================================================
// SCHOOL LIFE TYPES (VIE SCOLAIRE)
// =============================================================================

export type ActivityCategory = 'Sport' | 'Musique' | 'Théâtre' | 'Informatique' | 'Arts' | 'Lecture' | 'Sciences' | 'Langues' | 'Autre';
export type ActivityStatus = 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  description: string;
  responsibleTeacherId?: string;
  responsibleTeacherName?: string;
  schedule: string; // e.g., "Mardi 15h-17h"
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  startDate: string;
  endDate?: string;
  status: ActivityStatus;
  participants: string[]; // Student IDs
  createdAt: string;
  updatedAt: string;
}

export type EventType = 'Cérémonie' | 'Journée thématique' | 'Compétition' | 'Sortie pédagogique' | 'Spectacle' | 'Autre';
export type EventStatus = 'Planifié' | 'En cours' | 'Terminé' | 'Annulé';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizers: string[]; // Teacher/Staff IDs
  targetAudience: string; // "Toute l'école", "CM2-A", "6ème", etc.
  maxParticipants?: number;
  participants: string[]; // Student IDs
  status: EventStatus;
  budget?: number;
  expenses?: number;
  photos?: string[];
  documents?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type MeetingType = 'Parents-Professeurs' | 'Conseil de classe' | 'Assemblée générale' | 'Réunion pédagogique' | 'Autre';
export type MeetingStatus = 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée' | 'Reportée';

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string; // User ID
  organizerName?: string;
  invitees: string[]; // User/Parent IDs
  attendees: string[]; // Who actually attended
  agenda?: string;
  minutes?: string; // Compte-rendu
  status: MeetingStatus;
  isRecurrent?: boolean;
  recurrencePattern?: string;
  createdAt: string;
  updatedAt: string;
}

export type IncidentSeverity = 'Mineur' | 'Modéré' | 'Grave' | 'Très grave';
export type IncidentStatus = 'Signalé' | 'En traitement' | 'Résolu' | 'Clos';
export type SanctionType = 'Avertissement' | 'Retenue' | 'Exclusion temporaire' | 'Travail d\'intérêt général' | 'Convocation parents' | 'Autre';

export interface Incident {
  id: string;
  studentId: string;
  studentName?: string;
  date: string;
  time: string;
  location: string;
  description: string;
  severity: IncidentSeverity;
  reportedBy: string; // Teacher/Staff ID
  reportedByName?: string;
  witnesses?: string[];
  status: IncidentStatus;
  sanctions?: Sanction[];
  followUp?: string;
  parentNotified: boolean;
  parentNotificationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sanction {
  id: string;
  incidentId: string;
  type: SanctionType;
  description: string;
  appliedBy: string;
  appliedByName?: string;
  appliedDate: string;
  duration?: string; // "2 jours", "1 semaine"
  completed: boolean;
  completionDate?: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  category: 'Académique' | 'Sportif' | 'Artistique' | 'Comportement' | 'Autre';
  date: string;
  awardedBy: string;
  awardedByName?: string;
  certificate?: string; // URL or base64
  createdAt: string;
}

export type AssociationType = 'Club étudiant' | 'Association parents' | 'Partenariat ONG' | 'Autre';
export type AssociationStatus = 'Active' | 'Inactive' | 'En création';

export interface Association {
  id: string;
  name: string;
  type: AssociationType;
  description: string;
  presidentId?: string;
  presidentName?: string;
  members: string[]; // Student/Parent IDs
  advisorId?: string; // Teacher ID
  advisorName?: string;
  foundingDate: string;
  status: AssociationStatus;
  activities: string[]; // Activity IDs
  budget?: number;
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Général' | 'Urgent' | 'Événement' | 'Académique' | 'Administratif';
  priority: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  targetAudience: string[]; // "all", "parents", "teachers", "students", or specific class IDs
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
  publishedBy: string;
  publishedByName?: string;
  views: number;
  acknowledged: string[]; // User IDs who acknowledged
  createdAt: string;
  updatedAt: string;
}
export interface SystemActivity {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'attendance' | 'grades' | 'documents' | 'auth' | 'system' | 'pedagogical';
  details?: string;
  classId?: string;
  studentId?: string;
}
