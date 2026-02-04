
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';
const LOGIN_EMAIL = 'admin@ksp-school.ci';
const LOGIN_PASS = 'admin123';
const ID = '7b585427-bedd-4a1f-8a2e-6f9ceb065a19'; // KOFFI KABLAN VALENTIN

async function debugPatch() {
    try {
        console.log('Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASS
        });
        const token = loginRes.data.accessToken;
        const headers = { Authorization: `Bearer ${token}` };

        console.log('GET student...');
        try {
            const getRes = await axios.get(`${API_URL}/students/${ID}`, { headers });
            console.log('GET OK:', getRes.status, getRes.data.firstName);
        } catch (e: any) {
            console.error('GET Failed:', e.response?.status, e.response?.data);
        }

        console.log('PATCH student...');
        try {
            const patchRes = await axios.patch(`${API_URL}/students/${ID}`, {
                status: 'En attente',
                phone: '0000000001'
            }, { headers });
            console.log('PATCH OK:', patchRes.status, patchRes.data);
        } catch (e: any) {
            console.error('PATCH Failed:', e.response?.status);
            console.error('Data:', JSON.stringify(e.response?.data, null, 2));
        }

    } catch (e) {
        console.error('Fatal', e);
    }
}
debugPatch();
