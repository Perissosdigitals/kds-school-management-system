#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function backfillStudents() {
    console.log('🔄 Starting backfill of Student IDs (MAT-YYYY-XXX)...\n');

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Adjusted all column names to snake_case based on DB error hints
        const { rows: students } = await client.query(
            `SELECT id, registration_date, created_at, registration_number 
       FROM students 
       ORDER BY registration_date ASC, created_at ASC`
        );

        console.log(`found ${students.length} students total.`);

        const yearCounters = {};
        let updatedCount = 0;

        for (const student of students) {
            if (student.registration_number) {
                // If ID exists, update counter to avoid collisions
                const parts = student.registration_number.split('-');
                if (parts.length === 3 && parts[0] === 'MAT') {
                    const year = parseInt(parts[1]);
                    const num = parseInt(parts[2]);
                    if (!yearCounters[year] || num > yearCounters[year]) {
                        yearCounters[year] = num;
                    }
                }
                continue;
            }

            // Determine year from registration_date or created_at
            let year;
            if (student.registration_date) {
                year = new Date(student.registration_date).getFullYear();
            } else if (student.created_at) {
                year = new Date(student.created_at).getFullYear();
            } else {
                year = new Date().getFullYear();
            }

            // Validation: ensure year is reasonable
            if (isNaN(year) || year < 2000) year = new Date().getFullYear();

            // Initialize counter if needed
            if (!yearCounters[year]) {
                // Check DB for max existing ID for this year just in case
                const { rows } = await client.query(
                    `SELECT registration_number FROM students 
           WHERE registration_number LIKE $1 
           ORDER BY registration_number DESC LIMIT 1`,
                    [`MAT-${year}-%`]
                );

                let maxNum = 0;
                if (rows.length > 0) {
                    const parts = rows[0].registration_number.split('-');
                    maxNum = parseInt(parts[2]);
                }
                yearCounters[year] = maxNum;
            }

            // Increment
            yearCounters[year]++;
            const num = yearCounters[year];
            const registrationNumber = `MAT-${year}-${num.toString().padStart(3, '0')}`;

            // Update DB
            await client.query(
                `UPDATE students SET registration_number = $1 WHERE id = $2`,
                [registrationNumber, student.id]
            );

            updatedCount++;
        }

        console.log(`\n✅ Backfilled ${updatedCount} students.`);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

backfillStudents();
