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
  | 'data-management';

export type UserRole = 'Fondatrice' | 'Directrice' | 'Comptable' | 'Gestionnaire' | 'Agent Administratif' | 'Enseignant';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string; // URL to avatar image or initials
}

export type DocumentType = 'Extrait de naissance' | 'Carnet de vaccination' | 'Autorisation parentale' | 'Fiche scolaire';
export type DocumentStatus = 'Manquant' | 'En attente' | 'Validé' | 'Rejeté';

export interface DocumentHistoryLog {
  timestamp: string;
  user: string;
  action: string;
}

export interface StudentDocument {
  type: DocumentType;
  status: DocumentStatus;
  fileData?: string; // Base64 data URL
  fileName?: string;
  updatedAt?: string;
  history?: DocumentHistoryLog[];
}

export interface Student {
  id: string;
  registrationDate: string;
  lastName: string;
  firstName: string;
  dob: string;
  gender: 'Masculin' | 'Féminin';
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
}

export interface Teacher {
  id: string;
  lastName: string;
  firstName: string;
  subject: string;
  phone: string;
  email: string;
  status: 'Actif' | 'Inactif';
}

export interface Statistics {
  totalStudents: number;
  totalStaff: number;
  pendingPayments: number;
  inventoryAlerts: number;
}

export interface Activity {
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

export type AttendanceStatus = 'Présent' | 'Absent' | 'En retard';

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: string;
  teacherId?: string;
}

export interface TimetableSession {
  id: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  subject: string;
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
  studentId: string;
  evaluationId: string;
  score: number | null;
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