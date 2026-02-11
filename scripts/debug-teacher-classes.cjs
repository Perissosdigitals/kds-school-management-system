const http = require('http');

// Configuration
const API_URL = 'http://localhost:3001/api/v1';
const CREDENTIALS = {
    email: 'admin-test@karatschool.org',
    password: 'TestAdmin2026!'
};

// Helper function to make HTTP requests
function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            method: method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(body));
                    } else {
                        console.error(`Request failed with status ${res.statusCode}: ${body}`);
                        reject(new Error(`Status ${res.statusCode}`));
                    }
                } catch (e) {
                    console.error('Failed to parse JSON:', body);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Request error: ${e.message}`);
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function debug() {
    try {
        console.log('1. Authenticating...');
        const authResponse = await request('POST', '/auth/login', CREDENTIALS);
        const token = authResponse.access_token || authResponse.accessToken;
        if (!token) throw new Error('No token received');
        console.log('   Authentication successful.');

        console.log('\n2. Fetching Teachers...');
        const teachers = await request('GET', '/teachers', null, token);
        console.log(`   Fetched ${teachers.length} teachers.`);

        if (teachers.length > 0) {
            const teacher = teachers[0];
            console.log('   Sample Teacher:', JSON.stringify({
                id: teacher.id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                classes: teacher.classes
            }, null, 2));

            if (!teacher.classes) {
                console.error('   ❌ "classes" field is MISSING in teacher object!');
            } else if (teacher.classes.length === 0) {
                console.warn('   ⚠️ "classes" field is present but EMPTY.');
            } else {
                console.log('   ✅ "classes" field is present and populated.');
            }
        }

        console.log('\n3. Fetching Classes...');
        const classesResponse = await request('GET', '/classes?limit=5', null, token);
        const classes = classesResponse.data || classesResponse; // Handle { data: [...] } or [...]
        console.log(`   Fetched ${classes.length} classes.`);

        if (classes.length > 0) {
            const cls = classes[0];
            console.log('   Sample Class:', JSON.stringify({
                id: cls.id,
                name: cls.name,
                mainTeacherId: cls.mainTeacherId,
                main_teacher_id: cls.main_teacher_id,
                teacherId: cls.teacherId,
                mainTeacher: cls.mainTeacher
            }, null, 2));

            if (cls.mainTeacherId || cls.main_teacher_id || (cls.mainTeacher && cls.mainTeacher.id)) {
                console.log('   ✅ Main Teacher data is present.');
            } else {
                console.warn('   ⚠️ Main Teacher data is MISSING or null.');
            }
        }

    } catch (error) {
        console.error('Debug failed:', error.message);
    }
}

debug();
