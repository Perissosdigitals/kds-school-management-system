
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';
const LOGIN_EMAIL = 'admin@ksp-school.ci';
const LOGIN_PASS = 'admin123';

interface ImportedStudent {
    name: string;
    dob: string;
    pob: string;
    regime: string;
    parentPhone: string;
    hasExtract: boolean;
}

const studentsToImport: ImportedStudent[] = [
    { name: 'KOUAMÉ GERMIMA MERVEILLE', dob: '27/5/2020', pob: 'DALOA', regime: 'Cantine', parentPhone: '07-57-14-17-17 / 07-58-38-00-99', hasExtract: true },
    { name: 'MENZAN KOUASSI DINIS ELIE', dob: '4/10/2020', pob: 'SONGON', regime: 'Sans Cantine', parentPhone: '07-88-91-42-81', hasExtract: true },
    { name: 'NIKIEMA FRED ELISÉE', dob: '15/6/2020', pob: 'ALLOKOI S/P ANYAMA', regime: 'Sans Cantine', parentPhone: '07-58-38-00-99/ 07-57-14-17-17', hasExtract: true },
    { name: 'NIKIEMA WENDKOUNI ESTELLE', dob: '10/5/2016', pob: 'ALLOKOI S/P ANYAMA', regime: 'Social', parentPhone: '07-09-16-14-09', hasExtract: false },
    { name: 'OUEDRAOGO NEIMATOU', dob: '16/3/2019', pob: 'BURKINA FASO', regime: 'Social', parentPhone: '', hasExtract: false },
    { name: 'POKOU MILANE LEROY', dob: '15/3/2021', pob: 'COCODY', regime: 'Sans Cantine', parentPhone: '07-58-26-84-76', hasExtract: true },
    { name: 'PORQUET ELYNE CAMILLE KEREN', dob: '24/2/2019', pob: 'DJEBONOUA', regime: 'Sans Cantine', parentPhone: '', hasExtract: true },
    { name: 'SAWADOGO ANGE MARIE VIANNEY', dob: '28/8/2020', pob: 'ATTINGUIE', regime: 'Cantine', parentPhone: '07-08-50-02-42', hasExtract: true },
    { name: 'TANOH KABLAN MARC RAYAN', dob: '7/9/2020', pob: 'ALLOKOI S/P ANYAMA', regime: 'Sans Cantine', parentPhone: '05-85-48-90-37', hasExtract: true },
    { name: 'TRAORE CHECK SOULEYMANE', dob: '8/1/2019', pob: 'YOPOUGON', regime: 'Sans Cantine', parentPhone: '05-01-30-70-28', hasExtract: true },
    { name: 'YAO KONAN ILAN DEREK', dob: '4/12/2019', pob: 'BOUAKE', regime: 'Cantine', parentPhone: '07-49-74-79-60', hasExtract: true },
    { name: 'YAPI APO FLEUR LOEÏSE GENTILLA', dob: '27/10/2020', pob: 'ALLOKOI S/P ANYAMA', regime: 'Sans Cantine', parentPhone: '07-47-13-27-37 / 01-01-17-61-14', hasExtract: true },
    { name: 'YÉ GUELAMOU NOURA RASSOULA', dob: '2/10/2020', pob: 'BOUAKE', regime: 'Cantine', parentPhone: '07-08-19-46-23', hasExtract: true },
    { name: 'TIÉ PRINCESSE DELORD', dob: '2/7/2018', pob: 'ANONO', regime: 'Social', parentPhone: '05-46-57-50-02', hasExtract: false },
    { name: 'KOFFI KABLAN VALENTIN', dob: '14/2/2020', pob: 'UNKNOWN', regime: 'Sans Cantine', parentPhone: '', hasExtract: false }
];

async function importStudents() {
    console.log('🚀 Starting Student Import...');

    try {
        // 0. Check Health
        console.log('💓 Check API Health...');
        try {
            await axios.get(`${API_URL}/health`);
            console.log('✅ API is reachable');
        } catch (e: any) {
            console.error('❌ API Unreachable:', e.message);
            if (e.code === 'ECONNREFUSED') {
                console.error('   Ensure Backend is running on port 3001');
            }
            return;
        }

        // 1. Login
        console.log('🔑 Logging in as', LOGIN_EMAIL);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASS
        });
        const token = loginRes.data.accessToken;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login successful');

        // 2. Get existing students to check duplicates
        const existingRes = await axios.get(`${API_URL}/students?limit=1000`, { headers });
        const existingStudents = existingRes.data.data || existingRes.data;
        console.log(`📋 Found ${existingStudents.length} existing students`);

        // 3. Process imports
        for (const student of studentsToImport) {
            // Split name
            const nameParts = student.name.split(' ');
            const lastName = nameParts.slice(0, Math.max(1, nameParts.length - 1)).join(' ');
            const firstName = nameParts.slice(-1).join(' ');

            const formattedDob = formatDateForApi(student.dob);

            // Check duplicate (Name + DOB)
            const isDuplicate = existingStudents.some((s: any) => {
                const sName = `${s.lastName} ${s.firstName}`.toUpperCase();
                const inputName = student.name.toUpperCase();

                const dobMatch = s.dob === formattedDob || s.dateOfBirth === formattedDob;
                const nameMatch = sName.includes(lastName.toUpperCase()) && sName.includes(firstName.toUpperCase());

                return nameMatch && dobMatch;
            });

            if (isDuplicate) {
                console.log(`⚠️  Skipping duplicate: ${student.name}`);
                continue;
            }

            // Prepare payload
            // Fix validation: Phone required, max length 20, no dateAdded in docs
            let emPhone = student.parentPhone.split('/')[0].trim();
            // Remove spaces or non-digits for cleaner data if needed, but simple truncate is safer for now
            if (emPhone.length > 20) emPhone = emPhone.substring(0, 20);

            const payload = {
                firstName: firstName,
                lastName: lastName,
                dob: formattedDob,
                birthPlace: student.pob === 'UNKNOWN' ? 'Non spécifié' : student.pob,
                nationality: 'Ivoirienne',
                gender: 'Masculin',
                address: 'Non spécifié',
                phone: '',
                medicalInfo: `Régime: ${student.regime}`,
                emergencyContactName: 'Parent/Tuteur',
                emergencyContactPhone: emPhone,
                gradeLevel: 'Maternelle',
                status: 'En attente',
                documents: student.hasExtract ? [
                    { type: 'Extrait de naissance', status: 'Validé' }
                ] : []
            };

            try {
                await axios.post(`${API_URL}/students`, payload, { headers });
                console.log(`✅ Imported: ${student.name}`);
            } catch (err: any) {
                console.error(`❌ Failed to import ${student.name}:`, err.response?.data?.message || err.message);
            }
        }

        console.log('\n📊 Import Complete.');

    } catch (error: any) {
        console.error('❌ Fatal Error:', error);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

function formatDateForApi(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return dateStr;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

importStudents();
