/**
 * Import data directly to D1 via Wrangler API
 * Imports data in small batches to avoid D1 limits
 */

import { execSync } from 'child_process';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  specialization?: string;
  hireDate?: string;
  status: string;
}

interface Student {
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

function executeD1Command(sql: string): void {
  try {
    const escapedSql = sql.replace(/"/g, '\\"').replace(/'/g, "'\\''");
    execSync(
      `npx wrangler d1 execute kds-school-db --remote --command="${escapedSql}"`,
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.error('❌ Erreur d\'exécution:', error);
    throw error;
  }
}

async function fetchData() {
  console.log('📥 Récupération des données depuis PostgreSQL...\n');

  const [studentsRes, teachersRes] = await Promise.all([
    axios.get(`${API_URL}/students`),
    axios.get(`${API_URL}/teachers`),
  ]);

  console.log(`✅ Élèves: ${studentsRes.data.length}`);
  console.log(`✅ Enseignants: ${teachersRes.data.length}\n`);

  return {
    students: studentsRes.data as Student[],
    teachers: teachersRes.data as Teacher[],
  };
}

function escapeSQL(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

async function importTeachers(teachers: Teacher[]) {
  console.log('👨‍🏫 Import des enseignants...\n');

  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    const userId = `user-teacher-${teacher.id}`;
    const teacherId = `teacher-${teacher.id}`;

    console.log(`   [${i + 1}/${teachers.length}] ${teacher.firstName} ${teacher.lastName}...`);

    try {
      // Insert user
      const userSQL = `
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  ${escapeSQL(userId)},
  ${escapeSQL(teacher.email)},
  '$2a$10$dummy.hash.${teacher.id}',
  'teacher',
  ${escapeSQL(teacher.firstName)},
  ${escapeSQL(teacher.lastName)},
  ${escapeSQL(teacher.phone)},
  ${teacher.status === 'active' ? 1 : 0}
);`.trim();

      executeD1Command(userSQL);

      // Insert teacher
      const teacherSQL = `
INSERT INTO teachers (id, user_id, specialization, hire_date, status)
VALUES (
  ${escapeSQL(teacherId)},
  ${escapeSQL(userId)},
  ${escapeSQL(teacher.specialization || teacher.subject)},
  ${escapeSQL(teacher.hireDate || new Date().toISOString().split('T')[0])},
  ${escapeSQL(teacher.status)}
);`.trim();

      executeD1Command(teacherSQL);

      console.log(`      ✅ OK`);
    } catch (error) {
      console.error(`      ❌ Erreur`);
    }
  }

  console.log('\n✅ Enseignants importés\n');
}

async function importStudents(students: Student[]) {
  console.log('👨‍🎓 Import des élèves (100 étudiants, cela peut prendre quelques minutes)...\n');

  const batchSize = 10;
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    console.log(`   Lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(students.length / batchSize)}: élèves ${i + 1}-${Math.min(i + batchSize, students.length)}`);

    for (const student of batch) {
      const userId = `user-student-${student.id}`;
      const studentId = `student-${student.id}`;
      const email = student.guardianEmail || `${student.registrationNumber}@kds-student.com`;

      try {
        // Insert user
        const userSQL = `
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  ${escapeSQL(userId)},
  ${escapeSQL(email)},
  '$2a$10$dummy.hash.${student.id}',
  'student',
  ${escapeSQL(student.firstName)},
  ${escapeSQL(student.lastName)},
  ${escapeSQL(student.guardianPhone)},
  ${student.status === 'active' ? 1 : 0}
);`.trim();

        executeD1Command(userSQL);

        // Insert student
        const studentSQL = `
INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status)
VALUES (
  ${escapeSQL(studentId)},
  ${escapeSQL(userId)},
  ${escapeSQL(student.registrationNumber)},
  ${escapeSQL(student.dateOfBirth)},
  ${escapeSQL(student.gender)},
  ${escapeSQL(student.nationality || 'Camerounaise')},
  ${escapeSQL(student.birthPlace)},
  ${escapeSQL(student.address)},
  ${escapeSQL(new Date().toISOString().split('T')[0])},
  ${escapeSQL(student.classId)},
  ${escapeSQL(student.gradeLevel)},
  ${escapeSQL(student.guardianPhone)},
  ${escapeSQL(student.medicalInfo)},
  ${escapeSQL(student.status)}
);`.trim();

        executeD1Command(studentSQL);
      } catch (error) {
        // Continue même en cas d'erreur
      }
    }
  }

  console.log('\n✅ Élèves importés\n');
}

async function main() {
  console.log('🚀 Import Direct vers D1 (Normalized Schema)\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Fetch data
    const { teachers, students } = await fetchData();

    // Import teachers first (fewer records)
    await importTeachers(teachers);

    // Import students in batches
    await importStudents(students);

    // Verify
    console.log('📊 Vérification...\n');
    executeD1Command('SELECT COUNT(*) as count FROM users WHERE role="teacher"');
    executeD1Command('SELECT COUNT(*) as count FROM users WHERE role="student"');
    executeD1Command('SELECT COUNT(*) as count FROM teachers');
    executeD1Command('SELECT COUNT(*) as count FROM students');

    console.log('\n✅ Import terminé avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

main();
