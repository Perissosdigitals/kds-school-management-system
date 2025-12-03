#!/usr/bin/env node

/**
 * Database Seed Runner
 * Executes the comprehensive seed SQL file to populate the database
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration - try multiple password options
const dbConfig = {
  host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432'),
  user: process.env.DATABASE_USER || process.env.DB_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.DATABASE_NAME || process.env.DB_NAME || 'kds_school_db',
};

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');
  console.log('Database Config:', {
    ...dbConfig,
    password: '****',
  });

  const client = new Client(dbConfig);

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database\n');

    // Read the seed SQL file
    const seedFilePath = join(__dirname, 'seed-full-school.sql');
    console.log(`📂 Reading seed file: ${seedFilePath}\n`);
    const seedSQL = readFileSync(seedFilePath, 'utf8');

    // Execute the seed SQL
    console.log('🚀 Executing seed SQL...\n');
    await client.query(seedSQL);

    console.log('\n✅ Database seeded successfully!\n');

    // Query summary statistics
    const stats = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM students'),
      client.query('SELECT COUNT(*) as count FROM teachers'),
      client.query('SELECT COUNT(*) as count FROM classes'),
      client.query('SELECT COUNT(*) as count FROM subjects'),
      client.query('SELECT COUNT(*) as count FROM grades'),
      client.query('SELECT COUNT(*) as count FROM attendance'),
      client.query('SELECT COUNT(*) as count FROM timetable_slots'),
      client.query('SELECT COUNT(*) as count FROM financial_transactions'),
    ]);

    console.log('📊 Database Summary:');
    console.log('═══════════════════════════════════');
    console.log(`   Users:                  ${stats[0].rows[0].count}`);
    console.log(`   Students:               ${stats[1].rows[0].count}`);
    console.log(`   Teachers:               ${stats[2].rows[0].count}`);
    console.log(`   Classes:                ${stats[3].rows[0].count}`);
    console.log(`   Subjects:               ${stats[4].rows[0].count}`);
    console.log(`   Grades:                 ${stats[5].rows[0].count}`);
    console.log(`   Attendance Records:     ${stats[6].rows[0].count}`);
    console.log(`   Timetable Slots:        ${stats[7].rows[0].count}`);
    console.log(`   Financial Transactions: ${stats[8].rows[0].count}`);
    console.log('═══════════════════════════════════\n');

    // Query class distribution
    const classDistribution = await client.query(`
      SELECT c.name, c.level, COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
      GROUP BY c.id, c.name, c.level
      ORDER BY c.level, c.name
    `);

    console.log('📚 Class Distribution:');
    console.log('═══════════════════════════════════');
    classDistribution.rows.forEach(row => {
      console.log(`   ${row.name.padEnd(20)} (${row.level}): ${row.student_count} students`);
    });
    console.log('═══════════════════════════════════\n');

    console.log('🎉 All done! Your database is ready for CRUD operations.\n');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the seed
seedDatabase();
