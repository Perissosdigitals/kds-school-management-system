
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api/v1';
const LOGIN_EMAIL = 'admin@ksp-school.ci';
const LOGIN_PASS = 'admin123';
const CSV_FILE = path.join(process.cwd(), 'Cp_class.csv');

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

async function runImport() {
    console.log('🚀 Starting CP Class Import...');

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

        let currentClassName = '';
        let currentClassId = '';

        // Cache classes
        const classesRes = await axios.get(`${API_URL}/classes`, { headers });
        let allClasses = classesRes.data.data || classesRes.data;

        // Cache students to avoid duplicates
        const studentsRes = await axios.get(`${API_URL}/students?limit=2000`, { headers });
        const existingStudents = studentsRes.data.data || studentsRes.data;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // Fix encoding immediately
            line = fixEncoding(line);

            const cols = line.split(',');

            // Detect Class Header
            if (cols[0].toUpperCase().startsWith('CP 1') || line.includes('Classe: CP') && lines[i + 1]?.startsWith('CP 1')) {
                if (cols[0].trim() === 'CP 1') {
                    currentClassName = 'CP 1';
                    console.log(`\n🏫 Switching context to class: ${currentClassName}`);
                    currentClassId = await ensureClass(currentClassName, allClasses, headers);
                    continue;
                }
            }
            if (cols[0].trim() === 'CP 2') {
                currentClassName = 'CP 2';
                console.log(`\n🏫 Switching context to class: ${currentClassName}`);
                currentClassId = await ensureClass(currentClassName, allClasses, headers);
                continue;
            }

            // Skip non-student lines
            if (line.startsWith('Année') || line.startsWith('Classe:') || line.startsWith('Effectif') || line.startsWith('FILLES') || line.startsWith('GARÇONS')) {
                continue;
            }

            const name = cols[0]?.trim();
            if (!name || name.includes('Total') || name.toUpperCase() === 'NOM ET ENVIRON') continue;

            const nameParts = name.split(' ');
            if (nameParts.length < 2) continue;

            const lastName = nameParts.slice(0, Math.max(1, nameParts.length - 1)).join(' ');
            const firstName = nameParts.slice(-1).join(' ');

            const dob = formatDate(cols[1]?.trim());
            const pob = cols[2]?.trim() || 'Non spécifié';
            const regime = cols[3]?.trim();
            const phoneRaw = cols[4]?.trim();

            let phone = '';
            if (phoneRaw) {
                phone = phoneRaw.split('/')[0].trim().replace(/[^0-9+]/g, '');
                if (phone.length > 20) phone = phone.substring(0, 20);
            }

            // Find existing student
            const existing = existingStudents.find((s: any) => {
                const sName = `${s.lastName} ${s.firstName}`.toUpperCase();
                return sName === name.toUpperCase();
            });

            const basePayload = {
                firstName,
                lastName,
                dob: dob || '2019-01-01',
                birthPlace: pob,
                nationality: 'Ivoirienne',
                gender: 'Masculin',
                address: 'Non spécifié',
                medicalInfo: regime ? `Régime: ${regime}` : undefined,
                classId: currentClassId,
                gradeLevel: 'CP',
                status: 'En attente'
            };

            if (existing) {
                const updatePayload = {
                    ...basePayload,
                    phone: existing.phone || '0000000000',
                    emergencyContactPhone: phone || existing.emergencyContactPhone || '0000000000',
                };
                try {
                    // Changed PATCH to PUT
                    await axios.put(`${API_URL}/students/${existing.id}`, updatePayload, { headers });
                    process.stdout.write(`✅ Updated ${name}\n`);
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        console.error(`❌ 404 Update Failed (ID: ${existing.id}): Student not found.`);
                    } else if (err.response?.status === 429) {
                        await new Promise(r => setTimeout(r, 2000));
                        await axios.put(`${API_URL}/students/${existing.id}`, updatePayload, { headers });
                    } else {
                        console.error(`❌ Failed Update ${name}: ${err.message}`, err.response?.data);
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
                    process.stdout.write(`✨ Created ${name}\n`);
                } catch (err: any) {
                    if (err.response?.status === 400) {
                        console.error(`❌ Validation Error ${name}:`, JSON.stringify(err.response?.data, null, 2));
                    } else if (err.response?.status === 429) {
                        await new Promise(r => setTimeout(r, 2000));
                        await axios.post(`${API_URL}/students`, createPayload, { headers });
                    } else {
                        console.error(`❌ Failed Create ${name}: ${err.message}`, err.response?.data);
                    }
                }
            }
            await new Promise(r => setTimeout(r, 100));
        }

    } catch (e: any) {
        console.error('Fatal:', e);
    }
}

async function ensureClass(name: string, allClasses: any[], headers: any) {
    let cls = allClasses.find((c: any) => c.name.toUpperCase() === name.toUpperCase());
    if (!cls) {
        console.log(`Creating Class ${name}...`);
        try {
            const res = await axios.post(`${API_URL}/classes`, {
                name: name,
                level: 'CP',
                academicYear: '2025-2026',
                capacity: 35
            }, { headers });
            cls = res.data;
            allClasses.push(cls);
        } catch (e) {
            console.error('Failed to create class:', e);
            throw e;
        }
    }
    return cls.id;
}

runImport();
