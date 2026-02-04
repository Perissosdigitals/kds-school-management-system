
const { Client } = require('pg');

const dbConfig = {
    user: 'kds_admin',
    host: 'localhost',
    database: 'kds_school_db',
    password: 'kds_secure_password',
    port: 5432,
};

async function backfillIds() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('✅ Connected to database');

        const currentYear = new Date().getFullYear().toString();

        // 1. Backfill Teachers
        console.log('📊 Backfilling Teachers...');
        const teachers = await client.query('SELECT id, registration_number FROM teachers ORDER BY created_at ASC');
        let teacherCount = 0;
        for (const teacher of teachers.rows) {
            if (!teacher.registration_number) {
                teacherCount++;
                const newId = `ENS-${currentYear}-${teacherCount.toString().padStart(3, '0')}`;
                await client.query('UPDATE teachers SET registration_number = $1 WHERE id = $2', [newId, teacher.id]);
                console.log(`   - Teacher ${teacher.id} -> ${newId}`);
            }
        }
        console.log(`✅ Backfilled ${teacherCount} teachers.`);

        // 2. Backfill Students (Update old KSP format to MAT-YYYY)
        console.log('📊 Backfilling Students...');
        const students = await client.query('SELECT id, registration_number FROM students ORDER BY registration_date ASC, created_at ASC');
        let studentCount = 0;
        for (const student of students.rows) {
            // Check if it's the old format (e.g., KSP24001)
            if (student.registration_number && student.registration_number.startsWith('KSP')) {
                studentCount++;
                const seqMatch = student.registration_number.match(/\d+$/);
                const seq = seqMatch ? seqMatch[0].slice(-3) : studentCount.toString().padStart(3, '0');
                const newId = `MAT-${currentYear}-${seq}`;
                await client.query('UPDATE students SET registration_number = $1 WHERE id = $2', [newId, student.id]);
                console.log(`   - Student ${student.id} (${student.registration_number}) -> ${newId}`);
            } else if (!student.registration_number) {
                studentCount++;
                const newId = `MAT-${currentYear}-${studentCount.toString().padStart(3, '0')}`;
                await client.query('UPDATE students SET registration_number = $1 WHERE id = $2', [newId, student.id]);
                console.log(`   - Student ${student.id} (empty) -> ${newId}`);
            }
        }
        console.log(`✅ Updated/Backfilled ${studentCount} students.`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

backfillIds();
