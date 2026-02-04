import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api/v1';
const LOGIN_EMAIL = 'admin@ksp-school.ci';
const LOGIN_PASS = 'admin123';
const CSV_FILE = path.join(process.cwd(), 'CM_class_clean.csv');

// Mapping for corrupted characters (MacRoman/Windows-1252 to UTF-8 mixups)
const CHAR_MAP: Record<string, string> = {
    '√©': 'é',
    '√â': 'É',
    '√ã': 'Ë',
    '√á': 'Ç',
    '√à': 'È',
    '√è': 'Ï',
    '√à': 'à',
    '√´': 'ë'
};

function fixEncoding(text: string): string {
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
        'AKISSI', 'YA', 'EUNICE', 'BERENICE', 'OCEANE', 'SYNTYCHE'
    ];

    // Male indicators
    const maleIndicators = [
        'JEAN', 'ANDY', 'MICKAEL', 'SYDNEY', 'URIEL', 'RAYANE',
        'MAEL', 'SAMUEL', 'NEMUEL', 'CHRIST', 'MATHIEU', 'EDEN',
        'WONDER', 'EVANGILE', 'ADRIEL', 'JERED', 'BIENVENU'
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
    console.log('🚀 Starting CM Class Import (CM1 & CM2)...');

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
        const classesRes = await axios.get(`${API_URL}/classes`, { headers });
        let allClasses = classesRes.data.data || classesRes.data;

        // Cache students to avoid duplicates
        const studentsRes = await axios.get(`${API_URL}/students?limit=2000`, { headers });
        const existingStudents = studentsRes.data.data || studentsRes.data;

        let currentClassName = '';
        let currentClassId = '';
        let studentsCreated = 0;
        let studentsUpdated = 0;
        let studentsSkipped = 0;

        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // Fix encoding
            line = fixEncoding(line);

            const cols = line.split(',');

            // Extract data from CSV columns
            const academicYear = cols[0]?.trim();
            const className = cols[1]?.trim();
            const fullName = cols[2]?.trim();
            const dob = formatDate(cols[3]?.trim());
            const pob = cols[4]?.trim() || 'Non spécifié';
            const regime = cols[5]?.trim();
            const phoneRaw = cols[6]?.trim();

            // Skip if no name
            if (!fullName || fullName.length < 3) continue;

            // Update current class context
            if (className && (className === 'CM1' || className === 'CM2')) {
                if (className !== currentClassName) {
                    currentClassName = className;
                    console.log(`\n🏫 Switching context to class: ${currentClassName}`);
                    currentClassId = await ensureClass(currentClassName, allClasses, headers);
                }
            }

            // Skip if no class context
            if (!currentClassId) {
                console.log(`⚠️  Skipping ${fullName} - no class context`);
                continue;
            }

            // Parse name (Ivorian format: LAST NAMES FIRST NAMES)
            const nameParts = fullName.split(' ');
            if (nameParts.length < 2) {
                console.log(`⚠️  Skipping ${fullName} - invalid name format`);
                continue;
            }

            // Split into last name and first name
            const lastName = nameParts.slice(0, Math.max(1, nameParts.length - 1)).join(' ');
            const firstName = nameParts.slice(-1).join(' ');

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
                const sName = `${s.lastName} ${s.firstName}`.toUpperCase();
                return sName === fullName.toUpperCase();
            });

            const basePayload = {
                firstName,
                lastName,
                dob: dob || '2014-01-01', // Default for CM students
                birthPlace: pob,
                nationality: 'Ivoirienne',
                gender,
                address: 'Non spécifié',
                medicalInfo: regime ? `Régime: ${regime}` : undefined,
                classId: currentClassId,
                gradeLevel: 'CM',
                status: 'En attente'
            };

            if (existing) {
                const updatePayload = {
                    ...basePayload,
                    phone: existing.phone || '0000000000',
                    emergencyContactPhone: phone || existing.emergencyContactPhone || '0000000000',
                };
                try {
                    await axios.put(`${API_URL}/students/${existing.id}`, updatePayload, { headers });
                    process.stdout.write(`✅ Updated ${fullName} (${gender})\n`);
                    studentsUpdated++;
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        console.error(`❌ 404 Update Failed (ID: ${existing.id}): Student not found.`);
                    } else if (err.response?.status === 429) {
                        await new Promise(r => setTimeout(r, 2000));
                        await axios.put(`${API_URL}/students/${existing.id}`, updatePayload, { headers });
                        studentsUpdated++;
                    } else {
                        console.error(`❌ Failed Update ${fullName}: ${err.message}`, err.response?.data);
                        studentsSkipped++;
                    }
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
                    if (err.response?.status === 400) {
                        console.error(`❌ Validation Error ${fullName}:`, JSON.stringify(err.response?.data, null, 2));
                        studentsSkipped++;
                    } else if (err.response?.status === 429) {
                        await new Promise(r => setTimeout(r, 2000));
                        await axios.post(`${API_URL}/students`, createPayload, { headers });
                        studentsCreated++;
                    } else {
                        console.error(`❌ Failed Create ${fullName}: ${err.message}`, err.response?.data);
                        studentsSkipped++;
                    }
                }
            }
            await new Promise(r => setTimeout(r, 100));
        }

        console.log('\n\n📊 Import Summary:');
        console.log(`✨ Students Created: ${studentsCreated}`);
        console.log(`✅ Students Updated: ${studentsUpdated}`);
        console.log(`⚠️  Students Skipped: ${studentsSkipped}`);
        console.log(`📚 Total Processed: ${studentsCreated + studentsUpdated + studentsSkipped}`);
        console.log('\n✅ CM Class Import Complete!');

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
                level: 'CM',
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
