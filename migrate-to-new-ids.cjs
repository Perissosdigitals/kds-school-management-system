
const { Client } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'kds_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kds_school_db',
    password: process.env.DB_PASSWORD || 'kds_secure_password',
    port: parseInt(process.env.DB_PORT || '5432'),
};

const PREFIX = 'KSP';

async function migrateIds() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Jan 2026 belongs to academic year 2025-2026 -> 2526
        const yearCode = '2526';

        // 1. Migrate Students
        console.log('📊 Migrating Students...');
        const students = await client.query('SELECT id, registration_number, grade_level FROM students ORDER BY registration_date ASC, created_at ASC');
        for (let i = 0; i < students.rows.length; i++) {
            const student = students.rows[i];
            const gradeLevel = student.grade_level || 'STU';
            const match = gradeLevel.match(/^[a-zA-Z]+/);
            const context = match ? match[0].toUpperCase() : gradeLevel.substring(0, 3).toUpperCase();
            const seq = (i + 1).toString().padStart(3, '0');
            const newId = `${PREFIX}-S-${context}-${yearCode}-${seq}`;

            await client.query('UPDATE students SET registration_number = $1 WHERE id = $2', [newId, student.id]);
            // console.log(`   - Student ${student.id} -> ${newId}`);
        }
        console.log(`✅ Migrated ${students.rows.length} students.`);

        // 2. Migrate Teachers
        console.log('📊 Migrating Teachers...');
        const teachers = await client.query('SELECT id FROM teachers ORDER BY created_at ASC');
        for (let i = 0; i < teachers.rows.length; i++) {
            const teacher = teachers.rows[i];
            const seq = (i + 1).toString().padStart(3, '0');
            const newId = `${PREFIX}-T-${yearCode}-${seq}`;

            await client.query('UPDATE teachers SET registration_number = $1 WHERE id = $2', [newId, teacher.id]);
        }
        console.log(`✅ Migrated ${teachers.rows.length} teachers.`);

        // 3. Migrate Classes
        console.log('📊 Migrating Classes...');
        const classes = await client.query('SELECT id FROM classes ORDER BY created_at ASC');
        for (let i = 0; i < classes.rows.length; i++) {
            const cls = classes.rows[i];
            const seq = (i + 1).toString().padStart(3, '0');
            const newId = `${PREFIX}-C-${yearCode}-${seq}`;

            await client.query('UPDATE classes SET registration_number = $1 WHERE id = $2', [newId, cls.id]);
        }
        console.log(`✅ Migrated ${classes.rows.length} classes.`);

        // 4. Migrate Parents
        console.log('📊 Migrating Parents...');
        const parentsResult = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'parents'");
        if (parentsResult.rows[0].count > 0) {
            const parents = await client.query('SELECT id FROM parents ORDER BY id ASC');
            for (let i = 0; i < parents.rows.length; i++) {
                const parent = parents.rows[i];
                const seq = (i + 1).toString().padStart(3, '0');
                const newId = `${PREFIX}-P-${yearCode}-${seq}`;

                await client.query('UPDATE parents SET registration_number = $1 WHERE id = $2', [newId, parent.id]);
            }
            console.log(`✅ Migrated ${parents.rows.length} parents.`);
        }

        // 5. Migrate Subjects
        console.log('📊 Migrating Subjects...');
        const subjectsResult = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'subjects'");
        if (subjectsResult.rows[0].count > 0) {
            const subjects = await client.query('SELECT id FROM subjects ORDER BY name ASC');
            for (let i = 0; i < subjects.rows.length; i++) {
                const subject = subjects.rows[i];
                const seq = (i + 1).toString().padStart(3, '0');
                const newId = `${PREFIX}-B-${yearCode}-${seq}`;

                await client.query('UPDATE subjects SET registration_number = $1 WHERE id = $2', [newId, subject.id]);
            }
            console.log(`✅ Migrated ${subjects.rows.length} subjects.`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

migrateIds();
