import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';
const LOGIN_EMAIL = 'admin@ksp-school.ci';
const LOGIN_PASS = 'admin123';

async function testStudentUpdate() {
    try {
        console.log('🔑 Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASS
        });
        const token = loginRes.data.accessToken;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login OK\n');

        // Get first student
        console.log('📋 Fetching students...');
        const studentsRes = await axios.get(`${API_URL}/students?limit=1`, { headers });
        const student = (studentsRes.data.data || studentsRes.data)[0];

        if (!student) {
            console.error('❌ No students found');
            return;
        }

        console.log(`Found student: ${student.firstName} ${student.lastName}`);
        console.log(`Current gender: ${student.gender}\n`);

        // Try to update gender
        console.log('🔄 Attempting to update gender to Féminin...');
        const updatePayload = {
            gender: 'Féminin'
        };

        try {
            const updateRes = await axios.put(`${API_URL}/students/${student.id}`, updatePayload, { headers });
            console.log('✅ Update successful!');
            console.log('Response:', updateRes.data);
        } catch (err: any) {
            console.error('❌ Update failed!');
            console.error('Status:', err.response?.status);
            console.error('Error:', JSON.stringify(err.response?.data, null, 2));
        }

    } catch (error: any) {
        console.error('Fatal error:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testStudentUpdate();
