/**
 * Unified Cloudflare Migration Script
 * This script exports local PostgreSQL data to Cloudflare D1 and 
 * prepares binary assets for Cloudflare R2.
 */

import axios from 'axios';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { join, extname } from 'path';

const API_URL = 'http://localhost:3001/api/v1';
const R2_BUCKET = 'ksp-documents';

interface MigrationData {
    students: any[];
    teachers: any[];
    documents: any[];
    users: any[];
    classes: any[];
    attendance: any[];
    grades: any[];
    finance: any[];
    subjects: any[];
}

async function fetchAllData(): Promise<MigrationData> {
    console.log('📥 Fetching data from local API...');

    const [studentsRes, teachersRes, documentsRes, usersRes, classesRes, attendanceRes, gradesRes, financeRes, subjectsRes] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/teachers`),
        axios.get(`${API_URL}/documents`),
        axios.get(`${API_URL}/users`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/classes`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/attendance`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/grades`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/finance`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/subjects`).catch(() => ({ data: { data: [] } })),
    ]);

    const classes = classesRes.data.data || classesRes.data;
    const attendance = attendanceRes.data.data || attendanceRes.data;
    const grades = gradesRes.data.data || gradesRes.data;
    const finance = financeRes.data.data || financeRes.data;
    const subjects = subjectsRes.data.data || subjectsRes.data;

    console.log(`✅ Fetched: ${studentsRes.data.length} students, ${teachersRes.data.length} teachers, ${documentsRes.data.data.length} documents, ${classes.length} classes, ${attendance.length} attendance records, ${grades.length} grades, ${finance.length} transactions, ${subjects.length} subjects`);

    return {
        students: studentsRes.data,
        teachers: teachersRes.data,
        documents: documentsRes.data.data,
        users: usersRes.data,
        classes: classes,
        attendance: attendance,
        grades: grades,
        finance: finance,
        subjects: subjects,
    };
}

function escapeSQLString(str: string | null | undefined): string {
    if (str === null || str === undefined) return 'NULL';
    return `'${str.toString().replace(/'/g, "''")}'`;
}

async function main() {
    const isDryRun = process.argv.includes('--dry-run');

    try {
        const data = await fetchAllData();
        const uploadCommands: string[] = [];

        console.log('📂 Processing binary assets...');

        // 1. Process Student Photos
        data.students.forEach(student => {
            if (student.photoUrl && student.photoUrl.startsWith('/api/v1/students/photo/')) {
                const filename = student.photoUrl.split('/').pop();
                let localPath = join('uploads', 'students', 'photos', filename);
                if (!fs.existsSync(localPath)) localPath = join('backend', localPath);

                if (fs.existsSync(localPath)) {
                    const ext = extname(filename);
                    const storageKey = `photos/students/${student.id}${ext}`;
                    uploadCommands.push(`npx wrangler r2 object put ${R2_BUCKET}/${storageKey} --file=${localPath} --remote`);
                    // Update student record for SQL
                    student.photoUrl = `/api/v1/storage/${storageKey}`;
                }
            }
        });

        // 2. Process Documents
        data.documents.forEach(doc => {
            if (doc.filePath) {
                let localPath = doc.filePath;
                if (!fs.existsSync(localPath)) localPath = join('backend', localPath);

                if (fs.existsSync(localPath)) {
                    // Use the same path as storage key if it's already clean, or clean it
                    const storageKey = localPath.startsWith('./') ? localPath.substring(2) : localPath;
                    // Remove 'backend/' prefix for storage key to keep it clean if possible
                    const cleanKey = storageKey.startsWith('backend/') ? storageKey.substring(8) : storageKey;
                    uploadCommands.push(`npx wrangler r2 object put ${R2_BUCKET}/${cleanKey} --file=${localPath} --remote`);
                    // Update doc record for SQL
                    doc.filePath = cleanKey;
                }
            }
        });

        console.log(`🚀 Generated ${uploadCommands.length} R2 upload commands`);

        if (!isDryRun && uploadCommands.length > 0) {
            console.log('📤 Uploading to R2...');
            const uploadScript = 'upload_to_r2.sh';
            fs.writeFileSync(uploadScript, '#!/bin/bash\n' + uploadCommands.join('\n'));
            fs.chmodSync(uploadScript, '755');
            console.log(`✅ R2 upload script generated: ${uploadScript}`);
        }

        // 3. Generate D1 SQL
        console.log('📝 Generating D1 SQL...');
        let sql = `-- KSP Unified Migration\n-- Generated: ${new Date().toISOString()}\n\n`;

        // Disable foreign keys for bulk import
        sql += 'PRAGMA foreign_keys = OFF;\n\n';

        // Cleanup existing data for "brand new migration"
        sql += '-- CLEANUP\n';
        sql += 'DELETE FROM attendance;\n';
        sql += 'DELETE FROM grades;\n';
        sql += 'DELETE FROM documents;\n';
        sql += 'DELETE FROM transactions;\n';
        sql += 'DELETE FROM subjects;\n';
        sql += 'DELETE FROM students;\n';
        sql += 'DELETE FROM teachers;\n';
        sql += 'DELETE FROM classes;\n';
        sql += 'DELETE FROM users WHERE role != \'admin\';\n\n';

        // Users
        sql += '-- USERS\n';
        const userIds = new Set<string>();
        const userEmails = new Set<string>();

        data.users.forEach(user => {
            if (!userEmails.has(user.email)) {
                const firstName = user.firstName || user.email.split('@')[0];
                const lastName = user.lastName || 'User';
                let role = (user.role || 'staff').toLowerCase();
                if (role.includes('admin')) role = 'admin';
                else if (role.includes('enseignant') || role === 'teacher') role = 'teacher';
                else if (role.includes('élève') || role === 'student') role = 'student';
                else if (role === 'parent') role = 'parent';
                else role = 'staff';

                sql += `INSERT OR REPLACE INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES (${escapeSQLString(user.id)}, ${escapeSQLString(user.email)}, ${escapeSQLString(user.password || 'hash')}, ${escapeSQLString(role)}, ${escapeSQLString(firstName)}, ${escapeSQLString(lastName)}, ${escapeSQLString(user.phone)}, 1);\n`;
                userIds.add(user.id);
                userEmails.add(user.email);
            }
        });

        // Subjects
        sql += '\n-- SUBJECTS\n';
        data.subjects.forEach(sub => {
            sql += `INSERT OR REPLACE INTO subjects (id, name, code, coefficient, grade_level, is_active) VALUES (${escapeSQLString(sub.id)}, ${escapeSQLString(sub.name)}, ${escapeSQLString(sub.code)}, ${sub.coefficient || 1}, ${escapeSQLString(sub.gradeLevel)}, ${sub.isActive ? 1 : 0});\n`;
        });

        // Teachers
        sql += '\n-- TEACHERS\n';
        data.teachers.forEach(teacher => {
            let status = (teacher.status || 'active').toLowerCase();
            if (status.includes('actif')) status = 'active';
            sql += `INSERT OR REPLACE INTO teachers (id, user_id, specialization, hire_date, status) VALUES (${escapeSQLString(teacher.id)}, ${escapeSQLString(teacher.userId)}, ${escapeSQLString(teacher.specialization || teacher.subject)}, ${escapeSQLString(teacher.hireDate)}, ${escapeSQLString(status)});\n`;
        });

        // Classes
        sql += '\n-- CLASSES\n';
        data.classes.forEach(cls => {
            sql += `INSERT OR REPLACE INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active) VALUES (${escapeSQLString(cls.id)}, ${escapeSQLString(cls.name)}, ${escapeSQLString(cls.level)}, ${escapeSQLString(cls.academicYear)}, ${escapeSQLString(cls.mainTeacherId)}, ${escapeSQLString(cls.roomNumber)}, ${cls.capacity || 40}, 1);\n`;
        });

        // Students
        sql += '\n-- STUDENTS\n';
        data.students.forEach(student => {
            let status = (student.status || 'active').toLowerCase();
            if (status.includes('actif')) status = 'active';
            sql += `INSERT OR REPLACE INTO students (id, user_id, student_code, birth_date, gender, nationality, birth_place, address, enrollment_date, class_id, academic_level, emergency_contact, medical_info, status, photo_url) VALUES (${escapeSQLString(student.id)}, ${escapeSQLString(student.userId)}, ${escapeSQLString(student.registrationNumber)}, ${escapeSQLString(student.dob || student.dateOfBirth || '2010-01-01')}, ${escapeSQLString(student.gender)}, ${escapeSQLString(student.nationality)}, ${escapeSQLString(student.birthPlace)}, ${escapeSQLString(student.address)}, ${escapeSQLString(student.registrationDate)}, ${escapeSQLString(student.classId)}, ${escapeSQLString(student.gradeLevel)}, ${escapeSQLString(student.phone)}, ${escapeSQLString(student.medicalInfo)}, ${escapeSQLString(status)}, ${escapeSQLString(student.photoUrl)});\n`;
        });

        // Attendance
        sql += '\n-- ATTENDANCE\n';
        data.attendance.forEach(att => {
            sql += `INSERT OR REPLACE INTO attendance (id, student_id, class_id, date, status, period, is_justified, reason) VALUES (${escapeSQLString(att.id)}, ${escapeSQLString(att.studentId)}, ${escapeSQLString(att.classId)}, ${escapeSQLString(att.date)}, ${escapeSQLString(att.status)}, ${escapeSQLString(att.period)}, ${att.isJustified ? 1 : 0}, ${escapeSQLString(att.reason)});\n`;
        });

        // Grades
        sql += '\n-- GRADES\n';
        data.grades.forEach(g => {
            sql += `INSERT OR REPLACE INTO grades (id, student_id, subject_id, teacher_id, evaluation_type, value, max_value, coefficient, trimester, academic_year, evaluation_date) VALUES (${escapeSQLString(g.id)}, ${escapeSQLString(g.studentId)}, ${escapeSQLString(g.subjectId)}, ${escapeSQLString(g.teacherId)}, ${escapeSQLString(g.evaluationType)}, ${g.value}, ${g.maxValue || 20}, ${g.coefficient || 1}, ${escapeSQLString(g.trimester)}, ${escapeSQLString(g.academicYear)}, ${escapeSQLString(g.evaluationDate)});\n`;
        });

        // Finance Transactions
        sql += '\n-- TRANSACTIONS\n';
        data.finance.forEach(t => {
            sql += `INSERT OR REPLACE INTO transactions (id, student_id, type, category, amount, amount_paid, amount_remaining, status, payment_method, transaction_date, due_date, reference, description) VALUES (${escapeSQLString(t.id)}, ${escapeSQLString(t.studentId)}, ${escapeSQLString(t.type)}, ${escapeSQLString(t.category)}, ${t.amount}, ${t.amountPaid}, ${t.amountRemaining}, ${escapeSQLString(t.status)}, ${escapeSQLString(t.paymentMethod)}, ${escapeSQLString(t.transactionDate)}, ${escapeSQLString(t.dueDate)}, ${escapeSQLString(t.reference)}, ${escapeSQLString(t.description)});\n`;
        });

        // Documents
        sql += '\n-- DOCUMENTS\n';
        data.documents.forEach(doc => {
            const documentType = doc.document_type || doc.type || 'other';
            const filePath = doc.file_path || doc.filePath || 'uploads/documents/missing';
            const fileUrl = `/api/v1/storage/${filePath}`;
            sql += `INSERT OR REPLACE INTO documents (id, student_id, document_type, file_name, file_url, file_size, mime_type, uploaded_by, registration_number, title, type, entity_type, teacher_id, entity_id, file_path, access_level, description, expiry_date, is_active, download_count) VALUES (${escapeSQLString(doc.id)}, ${escapeSQLString(doc.student_id || doc.studentId)}, ${escapeSQLString(documentType)}, ${escapeSQLString(doc.file_name || doc.fileName)}, ${escapeSQLString(fileUrl)}, ${doc.file_size || 0}, ${escapeSQLString(doc.mime_type)}, ${escapeSQLString(doc.uploaded_by)}, ${escapeSQLString(doc.registration_number)}, ${escapeSQLString(doc.title)}, ${escapeSQLString(doc.type)}, ${escapeSQLString(doc.entity_type)}, ${escapeSQLString(doc.teacher_id)}, ${escapeSQLString(doc.entity_id)}, ${escapeSQLString(filePath)}, ${escapeSQLString(doc.access_level)}, ${escapeSQLString(doc.description)}, ${escapeSQLString(doc.expiry_date)}, ${doc.is_active || doc.isActive ? 1 : 0}, ${doc.download_count || 0});\n`;
        });

        const sqlFile = 'cloudflare-migration.sql';
        fs.writeFileSync(sqlFile, sql);
        console.log(`✅ D1 SQL generated: ${sqlFile}`);

        console.log('\n🎯 COMPLETE! Instructions:');
        console.log('1. Run R2 upload script: ./upload_to_r2.sh');
        console.log('2. Run D1 migration: npx wrangler d1 execute kds-school-db --remote --file=cloudflare-migration.sql');

    } catch (error) {
        console.error('❌ Migration failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

main();
