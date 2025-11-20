/**
 * Script pour assigner automatiquement les élèves aux classes
 * selon leur niveau scolaire (gradeLevel)
 * 
 * BARUCH HASHEM!
 * 
 * Usage: npx ts-node scripts/assign-students-to-classes.ts
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  classId: string | null;
  registrationNumber: string;
}

interface SchoolClass {
  id: string;
  name: string;
  level: string;
  capacity: number;
  students?: any[];
}

async function getAllStudents(): Promise<Student[]> {
  console.log('📚 Récupération de tous les élèves...');
  const response = await axios.get(`${API_BASE_URL}/students?limit=200`);
  const students = response.data.data || response.data;
  console.log(`✅ ${students.length} élèves trouvés`);
  return students;
}

async function getAllClasses(): Promise<SchoolClass[]> {
  console.log('🏫 Récupération de toutes les classes...');
  const response = await axios.get(`${API_BASE_URL}/classes?limit=50`);
  const classes = response.data.data || response.data;
  console.log(`✅ ${classes.length} classes trouvées`);
  return classes;
}

async function updateStudent(studentId: string, classId: string): Promise<void> {
  await axios.put(`${API_BASE_URL}/students/${studentId}`, {
    classId: classId
  });
}

async function assignStudentsToClasses() {
  console.log('\n🎓 === ASSIGNATION DES ÉLÈVES AUX CLASSES ===\n');
  
  try {
    // 1. Récupérer toutes les données
    const students = await getAllStudents();
    const classes = await getAllClasses();

    // 2. Grouper les classes par niveau
    const classesByLevel = new Map<string, SchoolClass[]>();
    classes.forEach(cls => {
      if (!classesByLevel.has(cls.level)) {
        classesByLevel.set(cls.level, []);
      }
      classesByLevel.get(cls.level)!.push(cls);
    });

    console.log('\n📊 Classes disponibles par niveau:');
    classesByLevel.forEach((classList, level) => {
      const totalCapacity = classList.reduce((sum, cls) => sum + cls.capacity, 0);
      console.log(`  ${level}: ${classList.length} classe(s), capacité totale: ${totalCapacity}`);
    });

    // 3. Grouper les élèves par niveau
    const studentsByLevel = new Map<string, Student[]>();
    students.forEach(student => {
      const level = student.gradeLevel;
      if (!studentsByLevel.has(level)) {
        studentsByLevel.set(level, []);
      }
      studentsByLevel.get(level)!.push(student);
    });

    console.log('\n📊 Élèves par niveau:');
    studentsByLevel.forEach((studentList, level) => {
      console.log(`  ${level}: ${studentList.length} élève(s)`);
    });

    // 4. Assigner les élèves aux classes
    console.log('\n🔄 Début de l\'assignation...\n');

    let totalAssigned = 0;
    let totalErrors = 0;

    for (const [level, studentList] of studentsByLevel.entries()) {
      const availableClasses = classesByLevel.get(level);
      
      if (!availableClasses || availableClasses.length === 0) {
        console.log(`⚠️  Aucune classe disponible pour le niveau ${level} (${studentList.length} élèves)`);
        continue;
      }

      console.log(`\n📝 Assignation pour ${level}:`);
      console.log(`   ${studentList.length} élèves → ${availableClasses.length} classe(s)`);

      // Répartir équitablement les élèves
      let classIndex = 0;
      const studentsPerClass = Math.ceil(studentList.length / availableClasses.length);

      for (let i = 0; i < studentList.length; i++) {
        const student = studentList[i];
        const targetClass = availableClasses[classIndex];

        // Vérifier la capacité
        const currentCount = (i % studentsPerClass) + 1;
        if (currentCount > targetClass.capacity) {
          console.log(`⚠️  Classe ${targetClass.name} pleine, passage à la suivante`);
          classIndex = (classIndex + 1) % availableClasses.length;
        }

        try {
          await updateStudent(student.id, targetClass.id);
          console.log(`   ✅ ${student.firstName} ${student.lastName} (${student.registrationNumber}) → ${targetClass.name}`);
          totalAssigned++;

          // Passer à la classe suivante tous les X élèves
          if ((i + 1) % studentsPerClass === 0 && classIndex < availableClasses.length - 1) {
            classIndex++;
          }
        } catch (error) {
          console.error(`   ❌ Erreur pour ${student.firstName} ${student.lastName}:`, error.response?.data?.message || error.message);
          totalErrors++;
        }

        // Pause pour ne pas surcharger l'API
        if (i % 10 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // 5. Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE L\'ASSIGNATION');
    console.log('='.repeat(60));
    console.log(`✅ Élèves assignés avec succès: ${totalAssigned}`);
    console.log(`❌ Erreurs rencontrées: ${totalErrors}`);
    console.log(`📚 Total traité: ${totalAssigned + totalErrors} / ${students.length}`);
    
    // 6. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const updatedClasses = await getAllClasses();
    console.log('\n📊 Occupation des classes:');
    
    updatedClasses
      .sort((a, b) => a.level.localeCompare(b.level) || a.name.localeCompare(b.name))
      .forEach(cls => {
        const count = cls.students?.length || 0;
        const percentage = ((count / cls.capacity) * 100).toFixed(0);
        const bar = '█'.repeat(Math.floor(count / 2));
        console.log(`  ${cls.name.padEnd(15)} ${count.toString().padStart(2)}/${cls.capacity} [${percentage}%] ${bar}`);
      });

    console.log('\n✨ BARUCH HASHEM! Assignation terminée avec succès! ✨\n');

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    throw error;
  }
}

// Exécution
assignStudentsToClasses()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script échoué:', error);
    process.exit(1);
  });

export { assignStudentsToClasses };
