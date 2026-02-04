import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3002/api/v1'; // Using port 3002 as confirmed in start-local.sh
const LOGIN_EMAIL = 'admin@ksp-school.ci';
const LOGIN_PASS = 'admin123';
const CSV_FILE = path.join(process.cwd(), 'CE_classe.csv');

// Mapping for corrupted characters (MacRoman/Windows-1252 to UTF-8 mixups)
const CHAR_MAP: Record<string, string> = {
    '√©': 'é',
    '√â': 'É',
    '√ã': 'Ë',
    '√á': 'Ç',
    '√à': 'È',
    '√è': 'Ï',
    '√´': 'ë',
    '√î': 'Ô'
};

function fixEncoding(text: string): string {
    if (!text) return '';
    let fixed = text;
    for (const [key, val] of Object.entries(CHAR_MAP)) {
        fixed = fixed.split(key).join(val);
    }
    return fixed;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// Detect gender from first name (Ivorian naming patterns)
function detectGender(fullName: string): 'Masculin' | 'Féminin' {
    const name = fullName.toUpperCase();

    // Female indicators
    const femaleIndicators = [
        'MARIE', 'ANGE', 'GRACE', 'ESTHER', 'FATOUMA', 'RAMATOU',
        'EMILIE', 'ORNELLA', 'YASMINE', 'NOURA', 'TENEBA',
        'AKISSI', 'YA', 'EUNICE', 'BERENICE', 'OCEANE', 'SYNTYCHE',
        'AURORE', 'VICTOIRE', 'LEILA', 'FAHIZATOU', 'DEBORAH', 'PRINCESSE',
        'VERONIQUE', 'PRUNELLE', 'CYNTICHE', 'MYRIAM', 'KELLIE', 'PRISCILLE',
        'CHANCELLE', 'ZALISSA', 'SITA', 'KARLA', 'MAUREEN'
    ];

    // Male indicators
    const maleIndicators = [
        'JEAN', 'ANDY', 'MICKAEL', 'SYDNEY', 'URIEL', 'RAYANE',
        'MAEL', 'SAMUEL', 'NEMUEL', 'CHRIST', 'MATHIEU', 'EDEN',
        'WONDER', 'EVANGILE', 'ADRIEL', 'JERED', 'BIENVENU',
        'MIRACLE', 'CLOSRAN', 'ELYSÉE', 'RUBEN', 'SYLVAIN', 'EHUD', 'KYLIAN',
        'DIEUDONNÉ', 'ONESIME', 'TERACH', 'ANDRE', 'DAVID', 'ELIMÉLEC',
        'ISMAEL', 'MARC', 'YVAN', 'ALAIN', 'LUC', 'MARVIN', 'BRAYAN',
        'ABDOUL', 'KADER', 'DARELL'
    ];

    for (const indicator of femaleIndicators) {
        if (name.includes(indicator)) return 'Féminin';
    }

    for (const indicator of maleIndicators) {
        if (name.includes(indicator)) return 'Masculin';
    }

    // Default to Masculin if uncertain
    return 'Masculin';
}

async function runImport() {
    console.log('🚀 Starting CE Class Import (CE1 & CE2)...');

    try {
        // 1. Login
        console.log('🔑 Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASS
        });
        const token = loginRes.data.accessToken;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login successful');

        // 2. Load and Parse CSV
        console.log('📂 Reading CSV:', CSV_FILE);
        const rawContent = fs.readFileSync(CSV_FILE, 'utf-8');
        const lines = rawContent.split('\n');

        // Cache classes
        console.log('🔄 Fetching existing classes...');
        const classesRes = await axios.get(`${API_URL}/classes`, { headers });
        let allClasses = classesRes.data.data || classesRes.data;

        // Cache students to avoid duplicates
        console.log('🔄 Fetching existing students...');
        const studentsRes = await axios.get(`${API_URL}/students?limit=2000`, { headers });
        const existingStudents = studentsRes.data.data || studentsRes.data;

        let currentClassName = '';
        let currentClassId = '';
        let studentsCreated = 0;
        let studentsUpdated = 0;
        let studentsSkipped = 0;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // Fix encoding
            line = fixEncoding(line);

            // Skip summary lines
            if (line.startsWith('Effectif') || line.startsWith('FILLES') || line.startsWith('GAR')) continue;
            // Skip header lines
            if (line.startsWith('Année Scolaire') || line.startsWith('Classe:')) continue;

            const cols = line.split(',');
            const col0 = cols[0]?.trim();

            // Detect class context change
            if (col0 === 'CE 1' || col0 === 'CE 2') {
                currentClassName = col0.replace(' ', ''); // "CE 1" -> "CE1"
                console.log(`\n🏫 Switching context to class: ${currentClassName}`);
                currentClassId = await ensureClass(currentClassName, allClasses, headers);
                continue;
            }

            // Skip if no name or context not set
            if (!currentClassId || !col0) continue;

            // Extract student data
            const fullName = col0;
            const dob = formatDate(cols[1]?.trim());
            const pob = cols[2]?.trim() || 'Non spécifié';
            const regime = cols[3]?.trim();
            const phoneRaw = cols[4]?.trim();
            // Extrait is col 5, ignored for now

            // Skip if looks like a header or garbage
            if (fullName === 'Classe: CE' || fullName.includes('Ann√©e')) continue;

            // Parse name (Ivorian format: LAST NAMES FIRST NAMES)
            // Assumption: Last names are uppercase at the start of the string, remaining is first names
            // But often it's just a string "LASTNAME FIRSTNAME"
            const nameParts = fullName.split(' ');
            if (nameParts.length < 2) {
                console.log(`⚠️  Skipping ${fullName} - invalid name format`);
                continue;
            }

            // Heuristic: Last word is first name, rest is last name? 
            // Or usually in these lists it's LAST NAME First Name.
            // Let's assume standard behavior: Last token is first name, rest is surname.
            const firstName = nameParts.slice(-2).join(' '); // Take last 2 words as first name? No, usually lots of last names.
            // Let's stick to safe split: Assume everything after proper case is first name? No, all uppercase in CSV.
            // Let's use simple split: Last word is first name, everything else is last name.
            const lastName = nameParts.slice(0, Math.max(1, nameParts.length - 1)).join(' ');
            const firstNameOnly = nameParts.slice(-1).join(' ');

            // Extract phone number
            let phone = '';
            if (phoneRaw) {
                phone = phoneRaw.split('/')[0].trim().replace(/[^0-9+]/g, '');
                if (phone.length > 20) phone = phone.substring(0, 20);
            }

            // Detect gender
            const gender = detectGender(fullName);

            // Find existing student
            const existing = existingStudents.find((s: any) => {
                const sName = `${s.lastName} ${s.firstName}`.toUpperCase().replace(/\s+/g, ' ');
                const csvName = fullName.toUpperCase().replace(/\s+/g, ' ');
                return sName === csvName;
            });

            const basePayload = {
                firstName: firstNameOnly,
                lastName: lastName,
                dob: dob || '2017-01-01', // Default for CE students (approx 8-9 years old)
                birthPlace: pob,
                nationality: 'Ivoirienne',
                gender,
                address: 'Non spécifié',
                medicalInfo: regime ? `Régime: ${regime}` : undefined,
                classId: currentClassId,
                gradeLevel: 'CE',
                status: 'Actif' // Set to Active immediately per user request imply "in place"
            };

            if (existing) {
                const updatePayload = {
                    ...basePayload,
                    phone: existing.phone || '0000000000',
                    emergencyContactPhone: phone || existing.emergencyContactPhone || '0000000000',
                };

                // Only update if important fields are missing or different?
                // For now, let's just log existence and optionally update if we want to enforce CSV data.
                // We'll update to ensure class is correct.
                if (existing.classId !== currentClassId) {
                    try {
                        await axios.put(`${API_URL}/students/${existing.id}`, updatePayload, { headers });
                        process.stdout.write(`✅ Updated class for ${fullName}\n`);
                        studentsUpdated++;
                    } catch (err: any) {
                        console.error(`❌ Failed Update ${fullName}: ${err.message}`);
                        studentsSkipped++;
                    }
                } else {
                    // process.stdout.write(`- Skipped ${fullName} (Already exists)\n`);
                    studentsSkipped++;
                }

            } else {
                const createPayload = {
                    ...basePayload,
                    phone: '0000000000',
                    emergencyContactName: 'Parent',
                    emergencyContactPhone: phone || '0000000000',
                    documents: []
                };
                try {
                    await axios.post(`${API_URL}/students`, createPayload, { headers });
                    process.stdout.write(`✨ Created ${fullName} (${gender})\n`);
                    studentsCreated++;
                } catch (err: any) {
                    if (err.response?.status === 429) {
                        await new Promise(r => setTimeout(r, 2000));
                        await axios.post(`${API_URL}/students`, createPayload, { headers });
                        studentsCreated++;
                    } else {
                        console.error(`❌ Failed Create ${fullName}: ${err.message}`, err.response?.data);
                        studentsSkipped++;
                    }
                }
            }
            await new Promise(r => setTimeout(r, 50)); // Tiny throttle
        }

        console.log('\n\n📊 Import Summary:');
        console.log(`✨ Students Created: ${studentsCreated}`);
        console.log(`✅ Students Updated: ${studentsUpdated}`);
        console.log(`⚠️  Students Skipped: ${studentsSkipped}`);
        console.log(`📚 Total Processed: ${studentsCreated + studentsUpdated + studentsSkipped}`);
        console.log('\n✅ CE Class Import Complete!');

    } catch (e: any) {
        console.error('Fatal:', e.message);
        if (e.response) {
            console.error('Response:', e.response.data);
        }
    }
}

async function ensureClass(name: string, allClasses: any[], headers: any) {
    let cls = allClasses.find((c: any) => c.name.toUpperCase() === name.toUpperCase());
    if (!cls) {
        console.log(`Creating Class ${name}...`);
        try {
            const res = await axios.post(`${API_URL}/classes`, {
                name: name,
                level: 'CE',
                academicYear: '2025-2026',
                capacity: 35
            }, { headers });
            cls = res.data;
            allClasses.push(cls);
            console.log(`✅ Class ${name} created with ID: ${cls.id}`);
        } catch (e: any) {
            console.error('Failed to create class:', e.message);
            throw e;
        }
    } else {
        console.log(`✅ Class ${name} found with ID: ${cls.id}`);
    }
    return cls.id;
}

runImport();
