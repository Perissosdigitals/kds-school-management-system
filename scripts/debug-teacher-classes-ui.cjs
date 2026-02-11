#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function debugTeacherClasses() {
    try {
        console.log('🔍 Fetching teachers from backend API...\n');

        const response = await axios.get(`${API_BASE}/teachers`);
        const teachers = response.data;

        console.log(`📊 Total teachers: ${teachers.length}\n`);

        // Check first 3 teachers
        for (let i = 0; i < Math.min(3, teachers.length); i++) {
            const teacher = teachers[i];
            console.log(`\n👨‍🏫 Teacher ${i + 1}:`);
            console.log(`   Name: ${teacher.firstName} ${teacher.lastName}`);
            console.log(`   ID: ${teacher.id}`);
            console.log(`   Classes field exists: ${teacher.classes !== undefined}`);
            console.log(`   Classes is array: ${Array.isArray(teacher.classes)}`);
            console.log(`   Classes count: ${teacher.classes ? teacher.classes.length : 0}`);

            if (teacher.classes && teacher.classes.length > 0) {
                console.log(`   ✅ Classes assigned:`);
                teacher.classes.forEach((cls, idx) => {
                    console.log(`      ${idx + 1}. ${cls.name} (ID: ${cls.id})`);
                });
            } else {
                console.log(`   ⚠️  No classes assigned`);
            }
        }

        // Summary
        const teachersWithClasses = teachers.filter(t => t.classes && t.classes.length > 0);
        const teachersWithoutClasses = teachers.filter(t => !t.classes || t.classes.length === 0);

        console.log('\n\n📈 SUMMARY:');
        console.log(`   Teachers with classes: ${teachersWithClasses.length}`);
        console.log(`   Teachers without classes: ${teachersWithoutClasses.length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

debugTeacherClasses();
