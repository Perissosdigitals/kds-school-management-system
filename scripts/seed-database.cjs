#!/usr/bin/env node

/**
 * Simple script to seed the database using pg
 * Run with: node scripts/seed-database.js
 */

const { Client } = require('../backend/node_modules/pg');
const { readFileSync } = require('fs');
const { join } = require('path');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '', // Trust authentication
  database: 'kds_school_db',
});

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Connect
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Read seed SQL file
    const seedPath = join(__dirname, '../backend/shared/database/seed-full-school.sql');
    console.log(`📂 Reading: ${seedPath}\n`);
    const seedSQL = readFileSync(seedPath, 'utf8');

    // Execute seed
    console.log('🚀 Executing seed SQL (this may take a minute)...\n');
    await client.query(seedSQL);

    // Get stats
    const [users, students, teachers, classes, grades, attendance] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM students'),
      client.query('SELECT COUNT(*) as count FROM teachers'),
      client.query('SELECT COUNT(*) as count FROM classes'),
      client.query('SELECT COUNT(*) as count FROM grades'),
      client.query('SELECT COUNT(*) as count FROM attendance'),
    ]);

    console.log('✅ Seed completed!\n');
    console.log('📊 Summary:');
    console.log('═'.repeat(40));
    console.log(`  Users:              ${users.rows[0].count}`);
    console.log(`  Students:           ${students.rows[0].count}`);
    console.log(`  Teachers:           ${teachers.rows[0].count}`);
    console.log(`  Classes:            ${classes.rows[0].count}`);
    console.log(`  Grades:             ${grades.rows[0].count}`);
    console.log(`  Attendance Records: ${attendance.rows[0].count}`);
    console.log('═'.repeat(40));
    console.log('\n🎉 Database ready for CRUD operations!\n');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

seed();
