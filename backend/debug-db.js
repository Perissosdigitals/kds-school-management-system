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

        // Find records created TODAY (after 08:00 UTC to be safe, covering the 10:44 event)
        // We look for ANY records created recently
        const res = await client.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date_str, 
        period, 
        status,
        class_id,
        (SELECT name FROM classes WHERE id = attendance.class_id) as class_name,
        created_at 
      FROM attendance 
      WHERE created_at > CURRENT_DATE
      ORDER BY created_at DESC 
      LIMIT 20
    `);

        console.log('🕵️ Recent Creations (All Classes):', JSON.stringify(res.rows, null, 2));

        // Specifically check for CE1 class
        const ce1 = await client.query("SELECT id, name FROM classes WHERE name LIKE '%CE1%'");
        console.log('🏫 Checking CE1 Class:', JSON.stringify(ce1.rows, null, 2));

        if (ce1.rows.length > 0) {
            const ce1Id = ce1.rows[0].id;
            const ce1Count = await client.query('SELECT COUNT(*) FROM attendance WHERE class_id = $1', [ce1Id]);
            console.log(`📊 Total Attendance Records for CE1 (${ce1Id}): ${ce1Count.rows[0].count}`);
        }

    } catch (err) {
        console.error('❌ Database Error:', err);
    } finally {
        await client.end();
    }
}

run();
