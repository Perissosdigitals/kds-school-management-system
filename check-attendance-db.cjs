const { Client } = require('pg');

const client = new Client({
    user: 'kds_admin',
    host: 'localhost',
    database: 'kds_school_db',
    password: 'kds_secure_password',
    port: 5432,
});

async function checkAttendance() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        const res = await client.query(`
      SELECT id, student_id, class_id, date, period, status, created_at, updated_at 
      FROM attendance 
      ORDER BY date DESC, created_at DESC 
      LIMIT 20
    `);

        console.log('📊 Recent Attendance Records:');
        console.table(res.rows);

        const counts = await client.query(`
        SELECT status, COUNT(*) 
        FROM attendance 
        GROUP BY status
    `);
        console.log('📊 Status Counts:');
        console.table(counts.rows);

        const periods = await client.query(`
        SELECT period, COUNT(*) 
        FROM attendance 
        GROUP BY period
    `);
        console.log('📊 Period Counts:');
        console.table(periods.rows);

    } catch (err) {
        console.error('❌ Error', err.stack);
    } finally {
        await client.end();
    }
}

checkAttendance();
