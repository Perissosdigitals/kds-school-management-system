import type { User, Student, Teacher, SchoolClass, TimetableSession, FinancialTransaction, InventoryItem, Evaluation, Grade, PedagogicalNote, AttendanceLog, ImportBatch } from '../types';

// =============================================================================
// USERS & STAFF DATA
// =============================================================================
export const allUsers: User[] = [
  { id: 'user-1', name: 'Aïssatou Diallo', role: 'Fondatrice', avatar: 'AD' },
  { id: 'user-2', name: 'Mamadou Keita', role: 'Directrice', avatar: 'MK' },
  { id: 'user-3', name: 'Fatou Camara', role: 'Comptable', avatar: 'FC' },
  { id: 'user-4', name: 'Ibrahim Traoré', role: 'Gestionnaire', avatar: 'IT' },
  { id: 'user-5', name: 'Awa Cissé', role: 'Agent Administratif', avatar: 'AC' },
  { id: 'user-6', name: 'Mamadou Traoré', role: 'Enseignant', avatar: 'MT' },
  { id: 'user-7', name: 'Fatima Coulibaly', role: 'Enseignant', avatar: 'FC' },
  { id: 'user-8', name: 'Issa Koné', role: 'Enseignant', avatar: 'IK' },
];

export const teacherDetails: Teacher[] = [
  { id: 'user-6', lastName: 'Traoré', firstName: 'Mamadou', subject: 'Mathématiques', phone: '+225 07 11 22 33 44', email: 'mamadou.traore@email.com', status: 'Actif' },
  { id: 'user-7', lastName: 'Coulibaly', firstName: 'Fatima', subject: 'Français', phone: '+225 01 55 66 77 88', email: 'fatima.coulibaly@email.com', status: 'Actif' },
  { id: 'user-8', lastName: 'Koné', firstName: 'Issa', subject: 'Histoire-Géographie', phone: '+225 05 99 88 77 66', email: 'issa.kone@email.com', status: 'Inactif' }
];


// =============================================================================
// SCHOOL & ACADEMIC DATA
// =============================================================================
export let schoolClasses: SchoolClass[] = [
  { id: 'C01', name: 'Classe CM2 A', level: 'CM2', teacherId: 'user-6' }, // M. Traoré
  { id: 'C02', name: 'Classe CM1 B', level: 'CM1', teacherId: 'user-7' }, // Mme Coulibaly
  { id: 'C03', name: 'Classe 6ème', level: '6ème', teacherId: 'user-8' },   // M. Koné
  { id: 'C04', name: 'Classe CE2', level: 'CE2', teacherId: 'user-7' },   // Mme Coulibaly
];

export const allStudents: Student[] = [
    { id: 'KDS24001', registrationDate: new Date().toLocaleDateString('fr-FR'), lastName: 'KOUASSI', firstName: 'Jean', dob: '15/05/2010', gender: 'Masculin', nationality: 'Ivoirienne', birthPlace: 'Abidjan', address: 'Plateau, Abidjan', phone: '+225 07 12 34 56 78', email: 'jean.kouassi@email.com', gradeLevel: 'CM2', previousSchool: 'École Primaire du Plateau', emergencyContactName: 'Marie KOUASSI', emergencyContactPhone: '+225 05 43 21 98 76', medicalInfo: 'Aucune allergie', status: 'Actif', documents: [{ type: 'Extrait de naissance', status: 'Validé' }, { type: 'Carnet de vaccination', status: 'Validé' }, { type: 'Autorisation parentale', status: 'En attente' }, { type: 'Fiche scolaire', status: 'Manquant' }] },
    { id: 'KDS24002', registrationDate: new Date(Date.now() - 86400000 * 5).toLocaleDateString('fr-FR'), lastName: 'DIALLO', firstName: 'Aïcha', dob: '22/08/2011', gender: 'Féminin', nationality: 'Ivoirienne', birthPlace: 'Bouaké', address: 'Cocody, Abidjan', phone: '+225 01 98 76 54 32', email: 'aicha.diallo@email.com', gradeLevel: 'CM1', previousSchool: 'Lycée Classique', emergencyContactName: 'Moussa DIALLO', emergencyContactPhone: '+225 02 11 22 33 44', medicalInfo: 'Asthme', status: 'Actif', documents: [{ type: 'Extrait de naissance', status: 'Validé' }, { type: 'Carnet de vaccination', status: 'Validé' }, { type: 'Autorisation parentale', status: 'Validé' }, { type: 'Fiche scolaire', status: 'Validé' }] },
    { id: 'KDS24003', registrationDate: new Date(Date.now() - 86400000 * 10).toLocaleDateString('fr-FR'), lastName: 'BAMBA', firstName: 'Moussa', dob: '01/01/2009', gender: 'Masculin', nationality: 'Ivoirienne', birthPlace: 'Korhogo', address: 'Yopougon, Abidjan', phone: '+225 02 33 44 55 66', email: 'moussa.bamba@email.com', gradeLevel: '6ème', previousSchool: 'Collège Moderne', emergencyContactName: 'Fanta BAMBA', emergencyContactPhone: '+225 03 22 11 00 99', medicalInfo: '', status: 'Inactif', documents: [{ type: 'Extrait de naissance', status: 'Rejeté' }, { type: 'Carnet de vaccination', status: 'Manquant' }, { type: 'Autorisation parentale', status: 'Manquant' }, { type: 'Fiche scolaire', status: 'Manquant' }] },
    { id: 'KDS24004', registrationDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString('fr-FR'), lastName: 'GOMEZ', firstName: 'Maria', dob: '12/11/2012', gender: 'Féminin', nationality: 'Béninoise', birthPlace: 'Cotonou', address: 'Marcory, Abidjan', phone: '+225 04 55 66 77 88', email: 'maria.gomez@email.com', gradeLevel: 'CE2', previousSchool: 'École Internationale', emergencyContactName: 'Jean GOMEZ', emergencyContactPhone: '+225 06 77 88 99 00', medicalInfo: 'Allergie aux arachides', status: 'En attente', documents: [{ type: 'Extrait de naissance', status: 'En attente' }, { type: 'Carnet de vaccination', status: 'En attente' }, { type: 'Autorisation parentale', status: 'Manquant' }, { type: 'Fiche scolaire', status: 'Manquant' }] },
    { id: 'KDS24005', registrationDate: new Date().toLocaleDateString('fr-FR'), firstName: 'Aminata', lastName: 'Touré', dob: '10/02/2010', gender: 'Féminin', nationality: 'Ivoirienne', birthPlace: 'Abidjan', address: 'Abobo, Abidjan', phone: '+225 01 02 03 04 05', email: 'aminata.toure@email.com', gradeLevel: 'CM2', previousSchool: 'École Notre Dame', emergencyContactName: 'Ousmane Touré', emergencyContactPhone: '+225 01 02 03 04 06', medicalInfo: '', status: 'Actif', documents: [] },
    { id: 'KDS24006', registrationDate: new Date().toLocaleDateString('fr-FR'), firstName: 'David', lastName: 'N\'Guessan', dob: '03/04/2011', gender: 'Masculin', nationality: 'Ivoirienne', birthPlace: 'Yamoussoukro', address: 'Treichville, Abidjan', phone: '+225 02 03 04 05 06', email: 'david.nguessan@email.com', gradeLevel: 'CM1', previousSchool: 'École la Rosée', emergencyContactName: 'Juliette N\'Guessan', emergencyContactPhone: '+225 02 03 04 05 07', medicalInfo: '', status: 'Actif', documents: [] },
];

export const mockSchedule: TimetableSession[] = [
    { id: 'S01', day: 'Lundi', startTime: '08:00', endTime: '10:00', subject: 'Mathématiques', classId: 'C01', teacherId: 'user-6', room: 'Salle 101' },
    { id: 'S02', day: 'Lundi', startTime: '10:00', endTime: '11:00', subject: 'Mathématiques', classId: 'C02', teacherId: 'user-6', room: 'Salle 102' },
    { id: 'S03', day: 'Mardi', startTime: '14:00', endTime: '16:00', subject: 'Sciences', classId: 'C01', teacherId: 'user-6', room: 'Labo A' },
    { id: 'S04', day: 'Jeudi', startTime: '09:00', endTime: '11:00', subject: 'Mathématiques', classId: 'C01', teacherId: 'user-6', room: 'Salle 101' },
    { id: 'S05', day: 'Vendredi', startTime: '11:00', endTime: '12:00', subject: 'Sciences', classId: 'C02', teacherId: 'user-6', room: 'Labo B' },
    { id: 'S06', day: 'Lundi', startTime: '13:00', endTime: '15:00', subject: 'Français', classId: 'C01', teacherId: 'user-7', room: 'Salle 101' },
    { id: 'S07', day: 'Mardi', startTime: '09:00', endTime: '11:00', subject: 'Français', classId: 'C02', teacherId: 'user-7', room: 'Salle 102' },
    { id: 'S08', day: 'Mercredi', startTime: '08:00', endTime: '10:00', subject: 'Histoire', classId: 'C01', teacherId: 'user-8', room: 'Salle 101' },
    { id: 'S09', day: 'Jeudi', startTime: '13:00', endTime: '14:00', subject: 'Français', classId: 'C01', teacherId: 'user-7', room: 'Salle 101' },
    { id: 'S10', day: 'Vendredi', startTime: '08:00', endTime: '10:00', subject: 'Français', classId: 'C02', teacherId: 'user-7', room: 'Salle 102' },
];

// =============================================================================
// GRADES & EVALUATIONS DATA
// =============================================================================
export const evaluations: Evaluation[] = [
  { id: 'EVAL01', classId: 'C01', subject: 'Mathématiques', title: 'Contrôle - Chapitre 5: Fractions', date: '15/07/2024', maxScore: 20 },
  { id: 'EVAL02', classId: 'C01', subject: 'Français', title: 'Dictée - Le petit prince', date: '16/07/2024', maxScore: 20 },
  { id: 'EVAL03', classId: 'C02', subject: 'Français', title: 'Composition Trimestrielle', date: '18/07/2024', maxScore: 100 },
  { id: 'EVAL04', classId: 'C02', subject: 'Mathématiques', title: 'Interrogation - Tables de multiplication', date: '12/07/2024', maxScore: 10 },
  { id: 'EVAL05', classId: 'C01', subject: 'Sciences', title: 'TP - Le cycle de l\'eau', date: '19/07/2024', maxScore: 20 },
];

export const grades: Grade[] = [
  // Grades for EVAL01 (Maths CM2)
  { studentId: 'KDS24001', evaluationId: 'EVAL01', score: 15, comment: 'Bon travail sur les fractions.' },
  { studentId: 'KDS24005', evaluationId: 'EVAL01', score: 18, comment: 'Excellent, continue comme ça !' },
  // Grades for EVAL02 (Français CM2)
  { studentId: 'KDS24001', evaluationId: 'EVAL02', score: 12, comment: 'Attention aux accords.' },
  { studentId: 'KDS24005', evaluationId: 'EVAL02', score: 19, comment: 'Très peu de fautes.' },
  // Grades for EVAL03 (Français CM1)
  { studentId: 'KDS24002', evaluationId: 'EVAL03', score: 85, comment: 'Très bonne composition.' },
  { studentId: 'KDS24006', evaluationId: 'EVAL03', score: 72, comment: 'Peut mieux faire sur la grammaire.' },
  // Grades for EVAL05 (Sciences CM2)
  { studentId: 'KDS24001', evaluationId: 'EVAL05', score: 17, comment: 'Schéma clair et bien expliqué.' },
  { studentId: 'KDS24005', evaluationId: 'EVAL05', score: 14, comment: 'Explications un peu confuses.' },
];

export const pedagogicalNotes: PedagogicalNote[] = [
    { id: 'PN01', studentId: 'KDS24001', teacherId: 'user-6', teacherName: 'Mamadou Traoré', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Jean est très participatif en classe mais a besoin de se concentrer davantage pendant les exercices en autonomie.' },
    { id: 'PN02', studentId: 'KDS24001', teacherId: 'user-7', teacherName: 'Fatima Coulibaly', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), note: 'A montré de belles qualités de leader lors du travail de groupe en français.' },
    { id: 'PN03', studentId: 'KDS24002', teacherId: 'user-7', teacherName: 'Fatima Coulibaly', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'Aïcha est une élève sérieuse et appliquée. Elle aide volontiers ses camarades.' },
];

export const attendanceLogs: AttendanceLog[] = [
    { id: 'AL01', studentId: 'KDS24001', date: '10/07/2024', status: 'Absent' },
    { id: 'AL02', studentId: 'KDS24003', date: '11/07/2024', status: 'Absent' },
    { id: 'AL03', studentId: 'KDS24001', date: '12/07/2024', status: 'En retard' },
];


// =============================================================================
// ADMINISTRATIVE DATA
// =============================================================================
export const mockTransactions: FinancialTransaction[] = [
  { id: 'TRN001', date: '10/07/2024', description: 'Frais de scolarité - 1ère Tranche', studentName: 'Jean KOUASSI', gradeLevel: 'CM2', type: 'Paiement Scolarité', amount: 75000, status: 'Payé' },
  { id: 'TRN002', date: '08/07/2024', description: 'Bourse d\'excellence', studentName: 'Aïcha DIALLO', gradeLevel: 'CM1', type: 'Bourse', amount: 50000, status: 'Payé' },
  { id: 'TRN003', date: '05/07/2024', description: 'Frais de scolarité - 2ème Tranche', studentName: 'Aïcha DIALLO', gradeLevel: 'CM1', type: 'Paiement Scolarité', amount: 75000, status: 'En attente' },
  { id: 'TRN004', date: '01/07/2024', description: 'Subvention ONG Partenaire', studentName: 'N/A', type: 'Subvention', amount: 250000, status: 'Payé' },
  { id: 'TRN005', date: '28/06/2024', description: 'Frais d\'inscription', studentName: 'Aïcha DIALLO', gradeLevel: 'CM1', type: 'Paiement Scolarité', amount: 25000, status: 'Payé' },
];

export const mockInventory: InventoryItem[] = [
  { id: 'INV001', name: 'Polo KDS - Taille M', category: 'Uniforme', quantity: 50, unit: 'pièces', stockStatus: 'En Stock', lastUpdated: '14/07/2024' },
  { id: 'INV002', name: 'Jupe KDS - Taille 10 ans', category: 'Uniforme', quantity: 5, unit: 'pièces', stockStatus: 'Stock Faible', lastUpdated: '14/07/2024' },
  { id: 'INV003', name: 'Cahier grand format', category: 'Fourniture Scolaire', quantity: 150, unit: 'pièces', stockStatus: 'En Stock', lastUpdated: '10/07/2024' },
  { id: 'INV004', name: 'Boîte de craies blanches', category: 'Matériel Pédagogique', quantity: 0, unit: 'boîtes', stockStatus: 'En Rupture', lastUpdated: '05/07/2024' },
];

export const importBatches: ImportBatch[] = [
  {
    id: 'batch-001',
    dataType: 'Liste des Classes',
    fileName: 'classes_2024_semestre2.csv',
    fileContent: 'id,name,level,teacherId\nC05,Classe CP1,CP1,user-6',
    submittedBy: 'Awa Cissé',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'pending',
  },
  {
    id: 'batch-002',
    dataType: 'Transactions Financières',
    fileName: 'compta_juin_2024.csv',
    fileContent: 'id,date,description,studentName,gradeLevel,type,amount,status\nTRN-IMP-1,15/06/2024,Paiement Cantine,Jean KOUASSI,CM2,Paiement Scolarité,15000,Payé',
    submittedBy: 'Fatou Camara',
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'applied',
    reviewedBy: 'Mamadou Keita',
    reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// =============================================================================
// MOCK CSV DATA SOURCE
// =============================================================================
export const mockStudentCSVData = `id,registrationDate,lastName,firstName,dob,gradeLevel,status
KDS24001,20/07/2024,KOUASSI,Jean,15/05/2010,CM2,Actif
KDS24002,15/07/2024,DIALLO,Aïcha,22/08/2011,CM1,Actif
KDS24003,10/07/2024,BAMBA,Moussa,01/01/2009,6ème,Inactif
KDS24004,18/07/2024,GOMEZ,Maria,12/11/2012,CE2,En attente
`;