#!/usr/bin/env node

const { Client } = require('../backend/node_modules/pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kds_admin',
    password: 'kds_secure_password',
    database: 'kds_school_db',
});

async function backfillDocuments() {
    console.log('🔄 Starting backfill of Document IDs (DOC-YYYY-XXX)...\n');

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Get all documents ordered by creation date
        // Note: TypeORM might use "createdAt" or "created_at" depending on strategy.
        // Error suggested "documents.createdAt".
        const { rows: documents } = await client.query(
            `SELECT id, "createdAt", registration_number 
       FROM documents 
       ORDER BY "createdAt" ASC`
        );

        console.log(`found ${documents.length} documents total.`);

        const yearCounters = {};
        let updatedCount = 0;

        for (const doc of documents) {
            if (doc.registration_number) {
                // If ID exists, update counter
                const parts = doc.registration_number.split('-');
                if (parts.length === 3 && parts[0] === 'DOC') {
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
            if (doc.createdAt) {
                year = new Date(doc.createdAt).getFullYear();
            } else {
                year = new Date().getFullYear();
            }

            // Initialize counter if needed
            if (!yearCounters[year]) {
                // Check DB for max existing ID for this year just in case
                const { rows } = await client.query(
                    `SELECT registration_number FROM documents 
           WHERE registration_number LIKE $1 
           ORDER BY registration_number DESC LIMIT 1`,
                    [`DOC-${year}-%`]
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
            const registrationNumber = `DOC-${year}-${num.toString().padStart(3, '0')}`;

            // Update DB
            await client.query(
                `UPDATE documents SET registration_number = $1 WHERE id = $2`,
                [registrationNumber, doc.id]
            );

            console.log(`   Updated doc ${doc.id} -> ${registrationNumber}`);
            updatedCount++;
        }

        console.log(`\n✅ Backfilled ${updatedCount} documents.`);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await client.end();
    }
}

backfillDocuments();
