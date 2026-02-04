#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function backfillSubjects() {
    console.log('🔄 Starting backfill of Subject IDs (SUB-XXX)...\n');

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Get all subjects
        const { rows: subjects } = await client.query(
            `SELECT id, name, code, registration_number 
       FROM subjects 
       ORDER BY created_at ASC`
        );

        console.log(`found ${subjects.length} subjects total.`);

        let counter = 0;
        let updatedCount = 0;

        // First pass: Find max existing number
        for (const subject of subjects) {
            if (subject.registration_number) {
                const parts = subject.registration_number.split('-');
                if (parts.length === 2 && parts[0] === 'SUB') {
                    const num = parseInt(parts[1]);
                    if (num > counter) counter = num;
                }
            }
        }

        // Second pass: Update missing IDs
        for (const subject of subjects) {
            if (!subject.registration_number) {
                counter++;
                const registrationNumber = `SUB-${counter.toString().padStart(3, '0')}`;

                await client.query(
                    `UPDATE subjects SET registration_number = $1 WHERE id = $2`,
                    [registrationNumber, subject.id]
                );

                console.log(`   Updated subject ${subject.name} -> ${registrationNumber}`);
                updatedCount++;
            }
        }

        console.log(`\n✅ Backfilled ${updatedCount} subjects.`);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

backfillSubjects();
