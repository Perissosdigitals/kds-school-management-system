/**
 * Import SAMPLE data to D1 (10 students + 3 teachers)
 * Quick test import with minimal data
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
    const escapedSql = sql.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const command = `npx wrangler d1 execute kds-school-db --remote --command="${escapedSql}"`;
    execSync(command, { stdio: 'inherit', shell: '/bin/zsh' });
  } catch (error: any) {
    if (error.status !== 0) {
      console.error('❌ Erreur SQL');
    }
  }
}

async function fetchData() {
  console.log('📥 Récupération d\'un échantillon de données...\n');

  const [studentsRes, teachersRes] = await Promise.all([
    axios.get(`${API_URL}/students`),
    axios.get(`${API_URL}/teachers`),
  ]);

  // Take students with valid birth dates (up to 30 to ensure we get at least 10 valid ones)
  const allStudents = studentsRes.data as Student[];
  const studentsWithBirthDate = allStudents.filter(s => s.dateOfBirth).slice(0, 10);
  const teachers = (teachersRes.data as Teacher[]).slice(0, 3);

  console.log(`✅ Élèves: ${studentsWithBirthDate.length} (échantillon avec date de naissance valide)`);
  console.log(`✅ Enseignants: ${teachers.length} (échantillon)\n`);

  return { students: studentsWithBirthDate, teachers };
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

    console.log(`   [${i + 1}/${teachers.length}] ${teacher.firstName} ${teacher.lastName}`);

    // Insert user
    const userSQL = `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES (${escapeSQL(userId)}, ${escapeSQL(teacher.email)}, '$2a$10$dummyhash', 'teacher', ${escapeSQL(teacher.firstName)}, ${escapeSQL(teacher.lastName)}, ${escapeSQL(teacher.phone)}, ${teacher.status === 'active' ? 1 : 0});`;

    executeD1Command(userSQL);

    // Insert teacher (normalize status)
    const normalizedStatus = teacher.status?.toLowerCase() === 'actif' || teacher.status?.toLowerCase() === 'active' ? 'active' : 'inactive';
    const teacherSQL = `INSERT INTO teachers (id, user_id, specialization, hire_date, status) VALUES (${escapeSQL(teacherId)}, ${escapeSQL(userId)}, ${escapeSQL(teacher.specialization || teacher.subject)}, ${escapeSQL(teacher.hireDate || '2024-01-01')}, '${normalizedStatus}');`;

    executeD1Command(teacherSQL);
  }

  console.log('\n✅ Enseignants importés\n');
}

async function importStudents(students: Student[]) {
  console.log('👨‍🎓 Import des élèves...\n');

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const userId = `user-student-${student.id}`;
    const studentId = `student-${student.id}`;
    const email = student.guardianEmail || `${student.registrationNumber}@kds-student.com`;

    console.log(`   [${i + 1}/${students.length}] ${student.firstName} ${student.lastName}`);

    // Skip students without birth_date
    if (!student.dateOfBirth) {
      console.log(`      ⚠️  Ignoré (date de naissance manquante)`);
      continue;
    }

    // Insert user
    const userSQL = `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES (${escapeSQL(userId)}, ${escapeSQL(email)}, '$2a$10$dummyhash', 'student', ${escapeSQL(student.firstName)}, ${escapeSQL(student.lastName)}, ${escapeSQL(student.guardianPhone)}, 1);`;

    executeD1Command(userSQL);

    // Insert student (normalize status)
    const normalizedStatus = student.status?.toLowerCase() === 'actif' || student.status?.toLowerCase() === 'active' ? 'active' : 'inactive';
    const studentSQL = `INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status) VALUES (${escapeSQL(studentId)}, ${escapeSQL(userId)}, ${escapeSQL(student.registrationNumber)}, ${escapeSQL(student.dateOfBirth)}, ${escapeSQL(student.gender)}, ${escapeSQL(student.nationality || 'Camerounaise')}, ${escapeSQL(student.birthPlace)}, ${escapeSQL(student.address)}, '2024-09-01', ${escapeSQL(student.classId)}, ${escapeSQL(student.gradeLevel)}, ${escapeSQL(student.guardianPhone)}, ${escapeSQL(student.medicalInfo)}, '${normalizedStatus}');`;

    executeD1Command(studentSQL);
  }

  console.log('\n✅ Élèves importés\n');
}

async function main() {
  console.log('🚀 Import Échantillon vers D1 (10 élèves + 3 enseignants)\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Fetch sample data
    const { teachers, students } = await fetchData();

    // Import teachers
    await importTeachers(teachers);

    // Import students
    await importStudents(students);

    // Verify
    console.log('📊 Vérification des données importées...\n');
    
    console.log('👥 Users:');
    executeD1Command('SELECT COUNT(*) as count FROM users WHERE role="teacher"');
    executeD1Command('SELECT COUNT(*) as count FROM users WHERE role="student"');
    
    console.log('\n👨‍🏫 Teachers:');
    executeD1Command('SELECT COUNT(*) as count FROM teachers');
    
    console.log('\n👨‍🎓 Students:');
    executeD1Command('SELECT COUNT(*) as count FROM students');

    console.log('\n✅ Import échantillon terminé avec succès!');
    console.log('\n🎯 Prochaine étape: Tester l\'API Worker');
    console.log('   curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/students');
    console.log('   curl https://kds-backend-api.perissosdigitals.workers.dev/api/v1/teachers\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

main();
