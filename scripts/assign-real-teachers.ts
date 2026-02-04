import axios from 'axios';

const API_URL = 'http://localhost:3002/api/v1';

// Admin credentials
const ADMIN_EMAIL = 'admin@ksp-school.ci';
const ADMIN_PASSWORD = 'admin123';

async function assignTeachers() {
    console.log('👩‍🏫 Assigning Teachers to Classes...\n');

    try {
        // 1. Login
        console.log('🔑 Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });
        const token = loginRes.data.access_token;
        console.log('✅ Login successful\n');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Fetch Teachers
        console.log('📋 Fetching teachers...');
        const teachersRes = await axios.get(`${API_URL}/teachers`, { headers });
        const teachers = teachersRes.data.data || teachersRes.data;
        console.log(`✅ Found ${teachers.length} teachers`);

        // 3. Fetch Classes
        console.log('📋 Fetching classes...');
        const classesRes = await axios.get(`${API_URL}/classes`, { headers });
        const classes = classesRes.data.data || classesRes.data;
        console.log(`✅ Found ${classes.length} classes`);

        // 4. Define Assignments (simple FIFO based on subject match)
        const assignments = [
            // CP
            { level: 'CP', className: 'CP 1', teacherName: 'OULAI' },
            { level: 'CP', className: 'CP 2', teacherName: 'KOUAKOU' },
            // CE
            { level: 'CE', className: 'CE1', teacherName: 'TIEOULOU' },
            { level: 'CE', className: 'CE2', teacherName: 'BADO' },
            // CM
            { level: 'CM', className: 'CM1', teacherName: 'LEDJOU' },
            { level: 'CM', className: 'CM2', teacherName: 'KOMOIN' },
        ];

        console.log('\n🔄 Processing assignments...\n');

        for (const assignment of assignments) {
            // Find Class
            const cls = classes.find(c => c.name.includes(assignment.className) || c.name === assignment.className);
            if (!cls) {
                console.log(`⚠️  Class not found: ${assignment.className}`);
                continue;
            }

            // Find Teacher
            const teacher = teachers.find(t => t.lastName.includes(assignment.teacherName));
            if (!teacher) {
                console.log(`⚠️  Teacher not found: ${assignment.teacherName}`);
                continue;
            }

            // Assign
            await axios.put(`${API_URL}/classes/${cls.id}`, {
                mainTeacherId: teacher.id
            }, { headers });

            console.log(`✅ Assigned ${teacher.firstName} ${teacher.lastName} to ${cls.name}`);
        }

        console.log('\n🎉 Teacher assignment complete!');

    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

assignTeachers();
