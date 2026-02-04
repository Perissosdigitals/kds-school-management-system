const { Client } = require('pg');

const client = new Client({
    user: 'kds_admin',
    host: 'localhost',
    database: 'kds_school_db',
    password: 'kds_secure_password',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        console.log('✅ Connected to DB');

        const res = await client.query('SELECT id, type, "fileName", "filePath", "studentId" FROM documents');
        console.log('📄 Documents in DB:', JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('❌ Database Error:', err);
    } finally {
        await client.end();
    }
}

run();
