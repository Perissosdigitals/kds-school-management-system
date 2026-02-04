const { Client } = require('pg');

const client = new Client({
    user: 'kds_admin',
    password: 'kds_secure_password',
    host: 'localhost',
    database: 'kds_school_db',
    port: 5432,
});

const teachers = [
    { lastName: "HOUIN", firstName: "JOCELYNE", subject: "Maternelle" },
    { lastName: "SOMPOHI", firstName: "AVISSEY", subject: "Maternelle" },
    { lastName: "OULAI", firstName: "EMMANUELLA", subject: "CP" },
    { lastName: "KOUAKOU", firstName: "EVELYNE REGINE", subject: "CP" },
    { lastName: "TIEOULOU", firstName: "SYNTHIA", subject: "CE" },
    { lastName: "BADO", firstName: "DIANE NADEGE", subject: "CE" },
    { lastName: "LEDJOU", firstName: "LYDIE", subject: "CM" },
    { lastName: "KOMOIN", firstName: "PAMELA", subject: "CM" },
    { lastName: "KONAN", firstName: "MOÏSE", subject: "SPORT" },
    { lastName: "YOMAN", firstName: "CEDRICK", subject: "ANGLAIS / INFORMATIQUE" }
];

function generateEmail(first, last) {
    const cleanFirst = first.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = last.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanFirst}.${cleanLast}@ksp.school`;
}

function generatePhone(index) {
    const suffix = (index + 1).toString().padStart(2, '0');
    return `+225 07 00 00 00 ${suffix}`;
}

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Clean existing references to teachers
        console.log('Cleaning teacher references in classes...');
        await client.query('UPDATE classes SET main_teacher_id = NULL');

        console.log('Cleaning timetable slots...');
        await client.query('DELETE FROM timetable_slots');

        // Clean existing teachers
        console.log('Cleaning existing teachers...');
        await client.query('DELETE FROM teachers');

        // Insert new teachers
        console.log('Inserting new teachers...');
        const values = teachers.map((t, index) => {
            const email = generateEmail(t.firstName, t.lastName);
            const phone = generatePhone(index);
            return `('${t.lastName}', '${t.firstName}', '${t.subject}', '${phone}', '${email}', 'Actif')`;
        });

        const query = `
      INSERT INTO teachers (last_name, first_name, subject, phone, email, status)
      VALUES ${values.join(',\n')}
      RETURNING *;
    `;

        const res = await client.query(query);
        console.log(`Successfully inserted ${res.rows.length} teachers:`);
        res.rows.forEach(r => console.log(` - ${r.first_name} ${r.last_name} (${r.subject})`));

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await client.end();
    }
}

run();
