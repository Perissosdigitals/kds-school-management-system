const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DATABASE_USER || 'kds_admin',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'kds_school_db',
  password: process.env.DATABASE_PASSWORD || 'kds_secure_password',
  port: process.env.DATABASE_PORT || 5432,
});

async function checkContent() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const tables = ['students', 'teachers', 'classes', 'users'];
    
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`📊 ${table}: ${res.rows[0].count} rows`);
      } catch (err) {
        console.log(`❌ Error querying ${table}: ${err.message}`);
      }
    }

  } catch (err) {
    console.error('❌ Connection error', err.stack);
  } finally {
    await client.end();
  }
}

checkContent();
