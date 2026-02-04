#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function inspectStudents() {
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Using snake_case column names based on established pattern
        const { rows: students } = await client.query(
            `SELECT id, registration_number, first_name, last_name 
       FROM students 
       LIMIT 10`
        );

        console.log('--- First 10 Students ---');
        students.forEach(s => {
            console.log(`${s.id} | ${s.first_name} ${s.last_name} | ID: ${s.registration_number}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

inspectStudents();
