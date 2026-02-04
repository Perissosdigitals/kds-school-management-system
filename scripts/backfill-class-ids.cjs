#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function backfillClasses() {
    console.log('🔄 Starting backfill of Class IDs (CLS-YYYY-XXX)...\n');

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Get all classes ordered by creation date
        const { rows: classes } = await client.query(
            `SELECT id, created_at, academic_year, registration_number 
       FROM classes 
       ORDER BY created_at ASC`
        );

        console.log(`found ${classes.length} classes total.`);

        const yearCounters = {};
        let updatedCount = 0;

        for (const cls of classes) {
            if (cls.registration_number) {
                // If ID exists, parse it to update counter if needed
                const parts = cls.registration_number.split('-');
                if (parts.length === 3 && parts[0] === 'CLS') {
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
            if (cls.created_at) {
                year = new Date(cls.created_at).getFullYear();
            } else {
                year = new Date().getFullYear();
            }

            // Initialize counter if needed
            if (!yearCounters[year]) {
                // Check DB for max existing ID for this year just in case
                const { rows } = await client.query(
                    `SELECT registration_number FROM classes 
           WHERE registration_number LIKE $1 
           ORDER BY registration_number DESC LIMIT 1`,
                    [`CLS-${year}-%`]
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
            const registrationNumber = `CLS-${year}-${num.toString().padStart(3, '0')}`;

            // Update DB
            await client.query(
                `UPDATE classes SET registration_number = $1 WHERE id = $2`,
                [registrationNumber, cls.id]
            );

            console.log(`   Updated class ${cls.id} -> ${registrationNumber}`);
            updatedCount++;
        }

        console.log(`\n✅ Backfilled ${updatedCount} classes.`);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

backfillClasses();
