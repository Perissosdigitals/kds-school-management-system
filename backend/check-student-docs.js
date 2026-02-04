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
        const studentId = '230a16f6-33e5-427d-86f1-99eda8f11cdf';
        const res = await client.query('SELECT documents FROM students WHERE id = $1', [studentId]);
        console.log('🧑‍🎓 Student Documents JSONB:', JSON.stringify(res.rows[0].documents, null, 2));
    } catch (err) {
        console.error('❌ Database Error:', err);
    } finally {
        await client.end();
    }
}

run();
