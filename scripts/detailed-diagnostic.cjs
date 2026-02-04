const { Client } = require('pg');
const http = require('http');

const dbConfig = {
    user: 'kds_admin',
    host: 'localhost',
    database: 'kds_school_db',
    password: 'kds_secure_password',
    port: 5432,
};

async function diagnostic() {
    const client = new Client(dbConfig);
    try {
        console.log('--- DATABASE CHECK ---');
        await client.connect();
        const dbRes = await client.query('SELECT id, first_name, last_name, registration_number FROM students LIMIT 5');
        console.log('Raw DB rows:');
        console.log(JSON.stringify(dbRes.rows, null, 2));

        console.log('\n--- API CHECK ---');
        // We need to login first to get a token
        const loginData = await apiRequest('POST', '/api/v1/auth/login', {
            email: 'admin@ksp-school.com',
            password: 'password123'
        });

        if (!loginData.access_token) {
            console.error('Login failed, cannot check API');
            return;
        }

        const students = await apiRequest('GET', '/api/v1/students?limit=5', null, loginData.access_token);
        console.log('Raw API response (first 5):');
        console.log(JSON.stringify(students.map(s => ({
            id: s.id,
            name: s.lastName,
            registrationNumber: s.registrationNumber,
            registration_number: s.registration_number
        })), null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

function apiRequest(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve(data); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

diagnostic();
