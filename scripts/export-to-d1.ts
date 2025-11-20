/**
 * Script pour exporter les données PostgreSQL locale vers format Cloudflare D1
 * Utilise l'API locale pour récupérer les données et génère des commandes SQL D1
 */

import axios from 'axios';
import { writeFileSync } from 'fs';

const API_BASE = 'http://localhost:3001/api/v1';

interface ExportData {
  students: any[];
  teachers: any[];
  classes: any[];
  users: any[];
  transactions: any[];
  documents: any[];
}

async function fetchAllData(): Promise<ExportData> {
  console.log('📊 Récupération des données depuis l\'API locale...\n');
  
  try {
    const [students, teachers, classes, users, transactions] = await Promise.all([
      axios.get(`${API_BASE}/students`).catch(() => ({ data: [] })),
      axios.get(`${API_BASE}/teachers`).catch(() => ({ data: [] })),
      axios.get(`${API_BASE}/classes`).catch(() => ({ data: [] })),
      axios.get(`${API_BASE}/users`).catch(() => ({ data: [] })),
      axios.get(`${API_BASE}/finance`).catch(() => ({ data: [] })),
    ]);

    console.log(`✅ Élèves:        ${students.data.length}`);
    console.log(`✅ Enseignants:   ${teachers.data.length}`);
    console.log(`✅ Classes:       ${classes.data.length}`);
    console.log(`✅ Utilisateurs:  ${users.data.length}`);
    console.log(`✅ Transactions:  ${transactions.data.length}`);
    console.log('');

    return {
      students: Array.isArray(students.data) ? students.data : [],
      teachers: Array.isArray(teachers.data) ? teachers.data : [],
      classes: Array.isArray(classes.data) ? classes.data : [],
      users: Array.isArray(users.data) ? users.data : [],
      transactions: Array.isArray(transactions.data) ? transactions.data : [],
      documents: []
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    throw error;
  }
}

function generateD1SQL(data: ExportData): string {
  let sql = `-- ============================================
-- KDS School Management System
-- Export PostgreSQL Local → Cloudflare D1
-- Date: ${new Date().toISOString()}
-- ============================================

-- Nettoyer les données existantes (ordre important pour les FK)
DELETE FROM transactions;
DELETE FROM documents;
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM classes;
DELETE FROM users;

-- ============================================
-- UTILISATEURS
-- ============================================
`;

  // Users
  data.users.forEach((user: any) => {
    const email = escapeSQLString(user.email || '');
    const firstName = escapeSQLString(user.firstName || user.first_name || '');
    const lastName = escapeSQLString(user.lastName || user.last_name || '');
    const role = escapeSQLString(user.role || 'staff');
    const passwordHash = escapeSQLString(user.password_hash || user.passwordHash || 'CHANGE_ME');
    const isActive = user.is_active || user.isActive ? 1 : 0;
    const createdAt = user.created_at || user.createdAt || new Date().toISOString();

    sql += `INSERT INTO users (id, email, first_name, last_name, role, password_hash, is_active, created_at, updated_at) 
VALUES ('${user.id}', '${email}', '${firstName}', '${lastName}', '${role}', '${passwordHash}', ${isActive}, '${createdAt}', '${createdAt}');\n`;
  });

  sql += `\n-- ============================================
-- ENSEIGNANTS
-- ============================================
`;

  // Teachers
  data.teachers.forEach((teacher: any) => {
    const firstName = escapeSQLString(teacher.firstName || '');
    const lastName = escapeSQLString(teacher.lastName || '');
    const email = escapeSQLString(teacher.email || '');
    const phone = escapeSQLString(teacher.phone || '');
    const subject = escapeSQLString(teacher.subject || '');
    const hireDate = teacher.hireDate || new Date().toISOString().split('T')[0];
    const status = teacher.status === 'Actif' ? 'active' : 'inactive';

    sql += `INSERT INTO teachers (id, first_name, last_name, email, phone, subject, hire_date, status, created_at) 
VALUES ('${teacher.id}', '${firstName}', '${lastName}', '${email}', '${phone}', '${subject}', '${hireDate}', '${status}', datetime('now'));\n`;
  });

  sql += `\n-- ============================================
-- CLASSES
-- ============================================
`;

  // Classes
  data.classes.forEach((cls: any) => {
    const name = escapeSQLString(cls.name || '');
    const level = escapeSQLString(cls.level || '');
    const teacherId = cls.teacherId || cls.teacher_id || null;
    const capacity = cls.capacity || 30;
    const room = escapeSQLString(cls.room || '');
    const isActive = cls.isActive || cls.is_active ? 1 : 0;

    sql += `INSERT INTO classes (id, name, level, teacher_id, capacity, room, is_active, created_at) 
VALUES ('${cls.id}', '${name}', '${level}', ${teacherId ? `'${teacherId}'` : 'NULL'}, ${capacity}, '${room}', ${isActive}, datetime('now'));\n`;
  });

  sql += `\n-- ============================================
-- ÉLÈVES
-- ============================================
`;

  // Students
  data.students.forEach((student: any) => {
    const regNumber = escapeSQLString(student.registrationNumber || student.registration_number || '');
    const firstName = escapeSQLString(student.firstName || '');
    const lastName = escapeSQLString(student.lastName || '');
    const dob = student.dob || student.date_of_birth || '2010-01-01';
    const gender = student.gender === 'Masculin' || student.gender === 'M' ? 'male' : 'female';
    const gradeLevel = escapeSQLString(student.gradeLevel || student.grade_level || '');
    const classId = student.classId || student.class_id || null;
    const guardianName = escapeSQLString(student.guardianName || student.guardian_name || '');
    const guardianPhone = escapeSQLString(student.guardianPhone || student.guardian_phone || '');
    const address = escapeSQLString(student.address || '');
    const status = student.status === 'Actif' ? 'active' : student.status === 'En attente' ? 'pending' : 'inactive';

    sql += `INSERT INTO students (id, registration_number, first_name, last_name, date_of_birth, gender, grade_level, class_id, guardian_name, guardian_phone, address, status, created_at) 
VALUES ('${student.id}', '${regNumber}', '${firstName}', '${lastName}', '${dob}', '${gender}', '${gradeLevel}', ${classId ? `'${classId}'` : 'NULL'}, '${guardianName}', '${guardianPhone}', '${address}', '${status}', datetime('now'));\n`;
  });

  sql += `\n-- ============================================
-- TRANSACTIONS FINANCIÈRES
-- ============================================
`;

  // Transactions
  data.transactions.forEach((tx: any) => {
    const type = tx.type === 'Revenu' ? 'income' : 'expense';
    const category = escapeSQLString(tx.category || '');
    const amount = tx.amount || 0;
    const studentId = tx.studentId || tx.student_id || null;
    const description = escapeSQLString(tx.description || '');
    const status = tx.status === 'Payé' ? 'paid' : tx.status === 'En attente' ? 'pending' : 'overdue';
    const txDate = tx.transactionDate || tx.transaction_date || new Date().toISOString();

    sql += `INSERT INTO transactions (id, type, category, amount, student_id, description, status, transaction_date, created_at) 
VALUES ('${tx.id}', '${type}', '${category}', ${amount}, ${studentId ? `'${studentId}'` : 'NULL'}, '${description}', '${status}', '${txDate}', datetime('now'));\n`;
  });

  sql += `\n-- ============================================
-- STATISTIQUES
-- ============================================
-- Total élèves:      ${data.students.length}
-- Total enseignants: ${data.teachers.length}
-- Total classes:     ${data.classes.length}
-- Total users:       ${data.users.length}
-- Total transactions: ${data.transactions.length}
-- ============================================
`;

  return sql;
}

function escapeSQLString(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

async function main() {
  console.log('🚀 Export PostgreSQL → Cloudflare D1\n');
  console.log('============================================\n');

  try {
    // 1. Récupérer les données
    const data = await fetchAllData();

    // 2. Générer le SQL
    console.log('📝 Génération du script SQL D1...\n');
    const sql = generateD1SQL(data);

    // 3. Sauvegarder
    const filename = 'cloudflare-d1-import.sql';
    writeFileSync(filename, sql, 'utf-8');

    console.log('✅ SUCCÈS!\n');
    console.log('============================================');
    console.log(`📄 Fichier créé: ${filename}`);
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('');
    console.log('1️⃣  Aller dans le dossier backend:');
    console.log('   cd backend');
    console.log('');
    console.log('2️⃣  Importer dans Cloudflare D1:');
    console.log('   npx wrangler d1 execute kds-school-db --file=../cloudflare-d1-import.sql');
    console.log('');
    console.log('3️⃣  Vérifier les données:');
    console.log('   npx wrangler d1 execute kds-school-db --command="SELECT COUNT(*) FROM students"');
    console.log('');
    console.log('============================================');
    console.log('');
    console.log('Bérakhot ve-Shalom! 🙏');

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
}

main();
