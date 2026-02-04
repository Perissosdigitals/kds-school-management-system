const http = require('http');

// Config
const API_HOST = 'localhost';
const API_PORT = 3002;
const EMAIL = 'admin@ksp-school.com';
const PASSWORD = 'password123';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: '/api/v1' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    console.error('Failed to parse JSON:', data);
                    reject(e);
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function verifyApi() {
    try {
        console.log('1. Logging in...');
        const loginRes = await request('POST', '/auth/login', {
            email: EMAIL,
            password: PASSWORD,
        });

        if (loginRes.status !== 200 && loginRes.status !== 201) {
            console.error('Login failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.access_token; // Adjust based on actual response structure
        console.log('✅ Login successful. Token obtained.');
        // console.log('Token:', token);

        console.log('\n2. Fetching students...');
        const studentsRes = await request('GET', '/students?limit=1', null, token);

        if (studentsRes.status !== 200) {
            console.error('Fetch students failed:', studentsRes.data);
            return;
        }

        const students = studentsRes.data;
        if (Array.isArray(students) && students.length > 0) {
            console.log('✅ Students fetched.');
            console.log('\n--- First Student JSON ---');
            console.log(JSON.stringify(students[0], null, 2));
            console.log('--------------------------\n');

            const hasReg = students[0].hasOwnProperty('registrationNumber');
            const hasRegSnake = students[0].hasOwnProperty('registration_number');

            console.log(`Has 'registrationNumber': ${hasReg}`);
            console.log(`Has 'registration_number': ${hasRegSnake}`);

            if (hasReg && students[0].registrationNumber) {
                console.log(`✅ registrationNumber is set: ${students[0].registrationNumber}`);
            } else {
                console.log('❌ registrationNumber is MISSING or empty!');
            }

        } else {
            console.log('⚠️ No students found.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyApi();
