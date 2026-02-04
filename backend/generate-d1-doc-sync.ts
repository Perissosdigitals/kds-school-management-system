import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';

// Load env vars
config({ path: '.env' });

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'ksp_admin', // Default from app.module
    password: process.env.DATABASE_PASSWORD || 'ksp_secure_password',
    database: process.env.DATABASE_NAME || 'ksp_school_db',
    synchronize: false,
});

async function run() {
    try {
        await dataSource.initialize();
        console.log('📦 Connected to PostgreSQL');

        const students = await dataSource.query('SELECT id, documents FROM students');
        console.log(`🔍 Found ${students.length} students`);

        let sql = '-- Sync Document Metadata from PostgreSQL\n';
        let count = 0;

        for (const student of students) {
            if (student.documents && Array.isArray(student.documents) && student.documents.length > 0) {
                const jsonStr = JSON.stringify(student.documents).replace(/'/g, "''");
                sql += `UPDATE students SET documents = '${jsonStr}' WHERE id = '${student.id}';\n`;
                count++;
            }
        }

        fs.writeFileSync('migrations/0003_sync_student_docs.sql', sql);
        console.log(`✅ Generated migrations/0003_sync_student_docs.sql with ${count} updates`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

run();
