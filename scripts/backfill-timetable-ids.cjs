#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function backfillTimetable() {
    console.log('🔄 Starting backfill of Timetable IDs (TMS-YYYY-XXX)...\n');

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Get all slots
        const { rows: slots } = await client.query(
            `SELECT id, academic_year, created_at, registration_number 
       FROM timetable_slots 
       ORDER BY created_at ASC`
        );

        console.log(`found ${slots.length} timetable slots total.`);

        const yearCounters = {};
        let updatedCount = 0;

        // First pass: Find max existing numbers per year
        for (const slot of slots) {
            if (slot.registration_number) {
                // Format: TMS-YYYY-XXX
                const parts = slot.registration_number.split('-');
                if (parts.length === 3 && parts[0] === 'TMS') {
                    const year = parseInt(parts[1]);
                    const num = parseInt(parts[2]);
                    if (!yearCounters[year] || num > yearCounters[year]) {
                        yearCounters[year] = num;
                    }
                }
            }
        }

        // Second pass: Update missing IDs
        for (const slot of slots) {
            if (!slot.registration_number) {
                // Determine year from academic_year (e.g., "2024-2025" -> 2024)
                let year = new Date().getFullYear();

                if (slot.academic_year && slot.academic_year.includes('-')) {
                    const yearStr = slot.academic_year.split('-')[0];
                    const parsed = parseInt(yearStr);
                    if (!isNaN(parsed) && parsed > 2000) {
                        year = parsed;
                    }
                } else if (slot.created_at) {
                    year = new Date(slot.created_at).getFullYear();
                }

                if (!yearCounters[year]) yearCounters[year] = 0;
                yearCounters[year]++;

                const num = yearCounters[year];
                const registrationNumber = `TMS-${year}-${num.toString().padStart(3, '0')}`;

                await client.query(
                    `UPDATE timetable_slots SET registration_number = $1 WHERE id = $2`,
                    [registrationNumber, slot.id]
                );

                // console.log(`   Updated slot -> ${registrationNumber}`);
                updatedCount++;
            }
        }

        console.log(`\n✅ Backfilled ${updatedCount} timetable slots.`);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

backfillTimetable();
