#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function inspectSpecificStudent() {
    try {
        await client.connect();

        // Check for students appearing in the screenshot
        const names = ['SAN PRUNELLE', 'LASME YEBOLE', 'KOUTOUAN KOUTOUAN', 'KOUADIO KOUASSI'];

        for (const namePart of names) {
            const { rows } = await client.query(
                `SELECT id, registration_number, first_name, last_name 
         FROM students 
         WHERE first_name ILIKE $1 OR last_name ILIKE $1`,
                [`%${namePart}%`]
            );

            if (rows.length > 0) {
                console.log(`\nFound matches for "${namePart}":`);
                rows.forEach(s => {
                    console.log(`${s.first_name} ${s.last_name} | ID: ${s.registration_number}`);
                });
            } else {
                console.log(`\nNo match for "${namePart}"`);
            }
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

inspectSpecificStudent();
