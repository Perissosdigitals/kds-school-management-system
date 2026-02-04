#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function backfillTeachers() {
    console.log('🔄 Starting backfill of Teacher IDs (ENS-YYYY-XXX)...\n');

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Corrected to snake_case column names based on established pattern
        const { rows: teachers } = await client.query(
            `SELECT id, hire_date, created_at, registration_number 
       FROM teachers 
       ORDER BY hire_date ASC, created_at ASC`
        );

        console.log(`found ${teachers.length} teachers total.`);

        const yearCounters = {};
        let updatedCount = 0;

        for (const teacher of teachers) {
            if (teacher.registration_number) {
                // If ID exists, update counter
                const parts = teacher.registration_number.split('-');
                if (parts.length === 3 && parts[0] === 'ENS') {
                    const year = parseInt(parts[1]);
                    const num = parseInt(parts[2]);
                    if (!yearCounters[year] || num > yearCounters[year]) {
                        yearCounters[year] = num;
                    }
                }
                continue;
            }

            // Determine year
            let year;
            if (teacher.hire_date) {
                year = new Date(teacher.hire_date).getFullYear();
            } else if (teacher.created_at) {
                year = new Date(teacher.created_at).getFullYear();
            } else {
                year = new Date().getFullYear();
            }

            // Validation
            if (isNaN(year) || year < 2000) year = new Date().getFullYear();

            // Initialize counter if needed
            if (!yearCounters[year]) {
                // Check DB for max existing ID for this year
                const { rows } = await client.query(
                    `SELECT registration_number FROM teachers 
           WHERE registration_number LIKE $1 
           ORDER BY registration_number DESC LIMIT 1`,
                    [`ENS-${year}-%`]
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
            const registrationNumber = `ENS-${year}-${num.toString().padStart(3, '0')}`;

            // Update DB
            await client.query(
                `UPDATE teachers SET registration_number = $1 WHERE id = $2`,
                [registrationNumber, teacher.id]
            );

            updatedCount++;
        }

        console.log(`\n✅ Backfilled ${updatedCount} teachers.`);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

backfillTeachers();
