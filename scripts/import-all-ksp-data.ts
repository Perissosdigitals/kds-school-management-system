#!/usr/bin/env npx tsx

/**
 * Import ALL Real KSP Student Data
 * This script imports students from CP, CE, and CM CSV files
 * Total expected: ~96 students (40 CP + 32 CE + 24 CM)
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = 'http://localhost:3002/api/v1';

// Login credentials
const ADMIN_EMAIL = 'admin@ksp-school.ci';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';

// Login function
async function login() {
    console.log('🔑 Logging in as admin...');
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });
        authToken = response.data.access_token;
        console.log('✅ Login successful\n');
    } catch (error: any) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Main import function
async function importAllKSPData() {
    console.log('🚀 Starting KSP Real Data Import...\n');
    console.log('═══════════════════════════════════════════\n');

    await login();

    // Import scripts in order
    const scripts = [
        { name: 'CP Classes', script: './import-cp-classes.ts' },
        { name: 'CE Classes', script: './import-ce-classes.ts' },
        { name: 'CM Classes', script: './import-cm-classes.ts' },
    ];

    let totalStudents = 0;

    for (const { name, script } of scripts) {
        console.log(`\n📚 Importing ${name}...`);
        console.log('─────────────────────────────────────────\n');

        try {
            // Run the import script
            const { execSync } = require('child_process');
            const scriptPath = path.join(__dirname, script);
            execSync(`npx tsx ${scriptPath}`, { stdio: 'inherit' });

            console.log(`✅ ${name} import completed\n`);
        } catch (error) {
            console.error(`❌ Error importing ${name}:`, error);
        }
    }

    // Get final count
    try {
        const response = await axios.get(`${API_BASE_URL}/students`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        totalStudents = response.data.length;
    } catch (error) {
        console.error('Error getting student count:', error);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ KSP REAL DATA IMPORT COMPLETE!');
    console.log('═══════════════════════════════════════════\n');
    console.log(`📊 Total Students Imported: ${totalStudents}`);
    console.log('\n🎉 Your MVP database is ready with real KSP data!\n');
    console.log('Bérakhot ve-Shalom! 🙏\n');
}

// Run the import
importAllKSPData().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
