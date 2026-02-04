const bcrypt = require('bcrypt');
const crypto = require('crypto');

const password = 'Dk@r@t$chool@2026';
const saltRounds = 10;
const userId = crypto.randomUUID();

console.log('Generating hash for founder password...');

bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
    }
    console.log('Hash generated successfully.');

    // SQL statement
    // Note: Escaping the single quotes in the hash if any (bcrypt hashes usually don't have single quotes but good to be safe)
    // Actually bcrypt hash chars are [./A-Za-z0-9], so no single quotes.

    const sql = `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, created_at, updated_at) VALUES ('${userId}', 'ekeomian@theksp.org', '${hash}', 'admin', 'Evelyne', 'Keomian', '+225 00 00 00 00 00', 1, datetime('now'), datetime('now'));`;

    console.log('\n--- SQL COMMAND ---');
    console.log(sql);
    console.log('-------------------\n');

    console.log('--- LOCAL EXECUTION COMMAND ---');
    console.log(`npx wrangler d1 execute ksp-production-db --local --command "${sql.replace(/"/g, '\\"')}"`);
    console.log('-------------------------------\n');

    console.log('--- PRODUCTION EXECUTION COMMAND ---');
    // For remote, we might need to be careful with shell escaping of the hash if it sends via command line
    console.log(`npx wrangler d1 execute ksp-production-db --remote --command "${sql.replace(/"/g, '\\"')}"`);
    console.log('--------------------------------\n');
});
