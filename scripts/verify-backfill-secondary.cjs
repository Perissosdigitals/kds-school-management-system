#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function verifyBackfill() {
    try {
        await client.connect();

        // Check Subjects
        const { rows: subjects } = await client.query(
            `SELECT count(*) as total, 
              count(registration_number) as filled 
       FROM subjects`
        );
        console.log('Subjects:', subjects[0]);

        const { rows: sampleSubjects } = await client.query(
            `SELECT name, registration_number FROM subjects LIMIT 3`
        );
        console.log('Sample Subjects:', sampleSubjects);

        // Check Timetable
        const { rows: slots } = await client.query(
            `SELECT count(*) as total, 
              count(registration_number) as filled 
       FROM timetable_slots`
        );
        console.log('\nTimetable Slots:', slots[0]);

        const { rows: sampleSlots } = await client.query(
            `SELECT id, academic_year, registration_number FROM timetable_slots LIMIT 3`
        );
        console.log('Sample Slots:', sampleSlots);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

verifyBackfill();
