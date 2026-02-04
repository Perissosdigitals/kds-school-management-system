
const { Client } = require('pg');

async function verifyPersistence() {
    const client = new Client({
        user: 'kds_admin',
        host: 'localhost',
        database: 'kds_school_db',
        password: 'kds_secure_password',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const res = await client.query('SELECT status, count(*) FROM attendance GROUP BY status');
        console.log('\n📊 Attendance Status Breakdown in DB:');
        res.rows.forEach(row => {
            console.log(` - ${row.status}: ${row.count}`);
        });

        const recentRecords = await client.query('SELECT id, student_id, class_id, date, period, status FROM attendance ORDER BY updated_at DESC LIMIT 5');
        console.log('\n🔍 Recent Attendance Records:');
        recentRecords.rows.forEach(row => {
            console.log(` - [${row.date.toISOString().split('T')[0]}] Student: ${row.student_id}, Period: ${row.period}, Status: ${row.status}`);
        });

        // Check for any records with French status (should be empty now)
        const frenchStatusRes = await client.query("SELECT id, status FROM attendance WHERE status IN ('Présent', 'Absent', 'Retard', 'Absent excusé')");
        if (frenchStatusRes.rows.length > 0) {
            console.log('\n⚠️ Found records with unexpected French status:');
            frenchStatusRes.rows.forEach(row => console.log(` - ${row.id}: ${row.status}`));
        } else {
            console.log('\n✅ No records with French status found (standardization working).');
        }

    } catch (err) {
        console.error('❌ Error testing database:', err.message);
    } finally {
        await client.end();
    }
}

verifyPersistence();
