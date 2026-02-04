const { Client } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

const client = new Client({
    user: process.env.DATABASE_USER || 'kds_admin',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'kds_school_db',
    password: process.env.DATABASE_PASSWORD || 'kds_secure_password',
    port: process.env.DATABASE_PORT || 5432,
});

async function inspect() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        const res = await client.query('SELECT id, first_name, last_name, registration_number FROM students LIMIT 10');
        console.log('\n--- Student Registration Numbers ---');
        console.table(res.rows);

        const nullCount = await client.query('SELECT COUNT(*) FROM students WHERE registration_number IS NULL OR registration_number = \'\'');
        console.log(`\n❌ Students with NULL/Empty registration_number: ${nullCount.rows[0].count}`);

        const totalCount = await client.query('SELECT COUNT(*) FROM students');
        console.log(`📊 Total students: ${totalCount.rows[0].count}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

inspect();
