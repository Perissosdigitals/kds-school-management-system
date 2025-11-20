/**
 * Export PostgreSQL Data to D1 Normalized Schema
 * Transforme les données PostgreSQL vers le format normalisé D1
 */

import axios from 'axios';
import * as fs from 'fs';

const API_URL = 'http://localhost:3001/api/v1';

interface PostgresStudent {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality?: string;
  birthPlace?: string;
  gradeLevel: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  address?: string;
  medicalInfo?: string;
  status: string;
  registrationNumber: string;
  classId?: string;
}

interface PostgresTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  specialization?: string;
  hireDate?: string;
  status: string;
  address?: string;
  emergencyContact?: string;
  qualifications?: string;
}

interface PostgresUser {
  id: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

async function fetchAllData() {
  console.log('📥 Récupération des données depuis PostgreSQL...\n');

  try {
    const [studentsRes, teachersRes, usersRes] = await Promise.all([
      axios.get(`${API_URL}/students`),
      axios.get(`${API_URL}/teachers`),
      axios.get(`${API_URL}/users`).catch(() => ({ data: [] })),
    ]);

    console.log(`✅ Élèves: ${studentsRes.data.length}`);
    console.log(`✅ Enseignants: ${teachersRes.data.length}`);
    console.log(`✅ Utilisateurs: ${usersRes.data.length}\n`);

    return {
      students: studentsRes.data as PostgresStudent[],
      teachers: teachersRes.data as PostgresTeacher[],
      users: usersRes.data as PostgresUser[],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Erreur API:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    } else {
      console.error('❌ Erreur:', error);
    }
    throw error;
  }
}

function escapeSQLString(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function generateNormalizedD1SQL(data: {
  students: PostgresStudent[];
  teachers: PostgresTeacher[];
  users: PostgresUser[];
}): string {
  let sql = `-- ============================================
-- KDS School Management System - D1 Import Data (Normalized)
-- Generated: ${new Date().toISOString()}
-- ============================================

`;

  // ============================================
  // 1. USERS (Central table)
  // ============================================
  sql += `-- ============================================
-- USERS
-- ============================================
`;

  const userIds = new Map<string, string>();
  let userInserts: string[] = [];

  // Admin user (déjà créé par le schéma)
  sql += `-- Admin user already created by schema\n\n`;

  // Users from teachers
  data.teachers.forEach((teacher) => {
    const userId = `user-teacher-${teacher.id}`;
    userIds.set(teacher.id, userId);
    
    userInserts.push(`
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  ${escapeSQLString(userId)},
  ${escapeSQLString(teacher.email)},
  '$2a$10$dummy.hash.for.${teacher.id}',
  'teacher',
  ${escapeSQLString(teacher.firstName)},
  ${escapeSQLString(teacher.lastName)},
  ${escapeSQLString(teacher.phone)},
  ${teacher.status === 'active' ? 1 : 0}
);`);
  });

  // Users from students (optional - for student portal access)
  data.students.forEach((student) => {
    const email = student.guardianEmail || `${student.registrationNumber}@kds-student.com`;
    const userId = `user-student-${student.id}`;
    userIds.set(student.id, userId);
    
    userInserts.push(`
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  ${escapeSQLString(userId)},
  ${escapeSQLString(email)},
  '$2a$10$dummy.hash.for.${student.id}',
  'student',
  ${escapeSQLString(student.firstName)},
  ${escapeSQLString(student.lastName)},
  ${escapeSQLString(student.guardianPhone)},
  ${student.status === 'active' ? 1 : 0}
);`);
  });

  sql += userInserts.join('\n');
  sql += '\n\n';

  // ============================================
  // 2. TEACHERS (Professional info)
  // ============================================
  sql += `-- ============================================
-- TEACHERS
-- ============================================
`;

  data.teachers.forEach((teacher) => {
    const userId = userIds.get(teacher.id);
    const teacherId = `teacher-${teacher.id}`;
    
    sql += `
INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  ${escapeSQLString(teacherId)},
  ${escapeSQLString(userId)},
  ${escapeSQLString(teacher.specialization || teacher.subject)},
  ${escapeSQLString(teacher.hireDate || new Date().toISOString().split('T')[0])},
  ${escapeSQLString(teacher.status)}
);
`;
  });

  sql += '\n';

  // ============================================
  // 3. STUDENTS (Academic info)
  // ============================================
  sql += `-- ============================================
-- STUDENTS
-- ============================================
`;

  data.students.forEach((student) => {
    const userId = userIds.get(student.id);
    const studentId = `student-${student.id}`;
    
    sql += `
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  ${escapeSQLString(studentId)},
  ${escapeSQLString(userId)},
  ${escapeSQLString(student.registrationNumber)},
  ${escapeSQLString(student.dateOfBirth)},
  ${escapeSQLString(student.gender)},
  ${escapeSQLString(student.nationality || 'Camerounaise')},
  ${escapeSQLString(student.birthPlace)},
  ${escapeSQLString(student.address)},
  ${escapeSQLString(new Date().toISOString().split('T')[0])},
  ${escapeSQLString(student.classId)},
  ${escapeSQLString(student.gradeLevel)},
  ${escapeSQLString(student.guardianPhone)},
  ${escapeSQLString(student.medicalInfo)},
  ${escapeSQLString(student.status)}
);
`;
  });

  return sql;
}

async function main() {
  console.log('🚀 Export PostgreSQL vers D1 (Normalized Schema)\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Fetch data
    const data = await fetchAllData();

    // Generate SQL
    console.log('📝 Génération du SQL normalisé...\n');
    const sql = generateNormalizedD1SQL(data);

    // Write to file
    const outputFile = 'cloudflare-d1-import-normalized.sql';
    fs.writeFileSync(outputFile, sql, 'utf-8');

    console.log('✅ Fichier généré:', outputFile);
    console.log('');
    console.log('📊 Résumé:');
    console.log(`   - Users: ${data.teachers.length + data.students.length} (${data.teachers.length} teachers + ${data.students.length} students)`);
    console.log(`   - Teachers: ${data.teachers.length}`);
    console.log(`   - Students: ${data.students.length}`);
    console.log('');
    console.log('🎯 Prochaine étape:');
    console.log('   1. ./scripts/reset-d1-schema.sh');
    console.log('   2. ./scripts/import-normalized-data.sh');
    console.log('');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'export:', error);
    process.exit(1);
  }
}

main();
