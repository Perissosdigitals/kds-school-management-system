
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';
const LOGIN_EMAIL = 'admin@ksp-school.ci';
const LOGIN_PASS = 'admin123';

// The exact list of names we WANT to KEEP
const KEEP_NAMES = [
    'KOUAMÉ GERMIMA MERVEILLE',
    'MENZAN KOUASSI DINIS ELIE',
    'NIKIEMA FRED ELISÉE',
    'NIKIEMA WENDKOUNI ESTELLE',
    'OUEDRAOGO NEIMATOU',
    'POKOU MILANE LEROY',
    'PORQUET ELYNE CAMILLE KEREN',
    'SAWADOGO ANGE MARIE VIANNEY',
    'TANOH KABLAN MARC RAYAN',
    'TRAORE CHECK SOULEYMANE',
    'YAO KONAN ILAN DEREK',
    'YAPI APO FLEUR LOEÏSE GENTILLA',
    'YÉ GUELAMOU NOURA RASSOULA',
    'TIÉ PRINCESSE DELORD',
    'KOFFI KABLAN VALENTIN'
];

async function cleanupStudents() {
    console.log('🧹 Starting Student Cleanup...');
    console.log('🛡️  Protected List (KEEP):', KEEP_NAMES.length, 'students');

    try {
        // 1. Login
        console.log('🔑 Logging in as', LOGIN_EMAIL);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASS
        });
        const token = loginRes.data.accessToken;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login successful');

        // 2. Get All Students
        console.log('📋 Fetching student list...');
        const res = await axios.get(`${API_URL}/students?limit=1000`, { headers });
        const allStudents = res.data.data || res.data;
        console.log(`📋 Found total ${allStudents.length} students in database.`);

        let deletedCount = 0;
        let keptCount = 0;

        for (const student of allStudents) {
            // Construct full name for comparison (uppercase)
            const fullName = `${student.lastName} ${student.firstName}`.toUpperCase().trim();

            // Check if this student is in our KEEP list
            // We check if the KEEP list *contains* this student's name
            // Logic: Does any name in KEEP_NAMES match this student?
            const isProtected = KEEP_NAMES.some(keepName => {
                // Precise matching: The Keep Name must equal the Student Name
                // Or closely match (ignoring extra spaces)
                return keepName.toUpperCase().trim() === fullName;
            });

            if (isProtected) {
                console.log(`🛡️  Keeping: ${fullName}`);
                keptCount++;
            } else {
                process.stdout.write(`🗑️  Deleting: ${fullName} (ID: ${student.id})... `);
                try {
                    await axios.delete(`${API_URL}/students/${student.id}`, { headers });
                    console.log('✅ Deleted');
                    deletedCount++;
                    // Rate limiting protection
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (err: any) {
                    console.log('❌ Failed:', err.message);
                    if (err.response?.status === 429) {
                        console.log('⏳ Rate limited, waiting 5s...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
            }
        }

        console.log('\n════════════════════════════');
        console.log(`📊 Cleanup Summary:`);
        console.log(`✅ Kept: ${keptCount}`);
        console.log(`🗑️  Deleted: ${deletedCount}`);
        console.log('════════════════════════════');

    } catch (error: any) {
        console.error('❌ Fatal Error:', error);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.code === 'ECONNRESET') {
            console.error('❌ Connection Reset. The backend might have crashed or is restarting.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('❌ Connection Refused. Is the backend running on port 3001?');
        }
    }
}

cleanupStudents();
