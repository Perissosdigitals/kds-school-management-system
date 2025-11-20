/**
 * Fix PostgreSQL Students Data
 * Ajoute des dates de naissance réalistes pour tous les élèves
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gradeLevel: string;
  status: string;
}

// Génère une date de naissance réaliste selon le niveau scolaire
function generateBirthDate(gradeLevel: string): string {
  const currentYear = 2025;
  let age = 10; // Default

  // Mapping des niveaux scolaires → âge approximatif
  const gradeAgeMap: Record<string, number> = {
    'Maternelle': 4,
    'CP': 6,
    'CE1': 7,
    'CE2': 8,
    'CM1': 9,
    'CM2': 10,
    '6ème': 11,
    '6e': 11,
    '5ème': 12,
    '5e': 12,
    '4ème': 13,
    '4e': 13,
    '3ème': 14,
    '3e': 14,
    'Seconde': 15,
    'Première': 16,
    'Terminale': 17,
  };

  age = gradeAgeMap[gradeLevel] || 10;

  const birthYear = currentYear - age;
  const month = Math.floor(Math.random() * 12) + 1; // 1-12
  const day = Math.floor(Math.random() * 28) + 1; // 1-28 (pour éviter les problèmes de mois)

  return `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function fetchStudents(): Promise<Student[]> {
  console.log('📥 Récupération des élèves...\n');
  const response = await axios.get(`${API_URL}/students`);
  const students = response.data as Student[];
  console.log(`✅ ${students.length} élèves récupérés\n`);
  return students;
}

async function updateStudent(student: Student, birthDate: string): Promise<boolean> {
  try {
    await axios.put(`${API_URL}/students/${student.id}`, {
      dob: birthDate, // Le champ s'appelle 'dob' dans l'API
      status: 'Actif', // Garder le format français existant
    });
    return true;
  } catch (error) {
    console.error(`   ❌ Erreur pour ${student.firstName} ${student.lastName}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Correction des Données PostgreSQL\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Fetch all students
    const students = await fetchStudents();

    // Find students without birth date
    const studentsToFix = students.filter(s => !s.dateOfBirth);
    console.log(`⚠️  ${studentsToFix.length} élèves sans date de naissance\n`);

    if (studentsToFix.length === 0) {
      console.log('✅ Tous les élèves ont déjà une date de naissance!');
      return;
    }

    console.log('📝 Mise à jour des dates de naissance...\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < studentsToFix.length; i++) {
      const student = studentsToFix[i];
      const birthDate = generateBirthDate(student.gradeLevel);

      process.stdout.write(`   [${i + 1}/${studentsToFix.length}] ${student.firstName} ${student.lastName} (${student.gradeLevel}) → ${birthDate}...`);

      const success = await updateStudent(student, birthDate);
      
      if (success) {
        console.log(' ✅');
        successCount++;
      } else {
        console.log(' ❌');
        failCount++;
      }

      // Pause pour éviter de surcharger l'API
      if (i % 10 === 9) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Échecs: ${failCount}`);
    console.log('');

    if (successCount > 0) {
      console.log('🎉 Données PostgreSQL corrigées!');
      console.log('');
      console.log('🎯 Prochaine étape: Importer vers D1');
      console.log('   npx tsx scripts/import-sample-to-d1.ts');
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

main();
