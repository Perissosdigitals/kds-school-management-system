/**
 * Population complète d'une école primaire ivoirienne
 * - Toutes les classes: CP1, CP2, CE1, CE2, CM1, CM2
 * - 100 élèves répartis
 * - 8 professeurs assignés
 * - Emplois du temps complets (Lun-Ven, 8h30-12h, 14h30-17h30)
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

// Structure école primaire ivoirienne
const SCHOOL_STRUCTURE = [
  { name: 'CP1-A', level: 'CP1', capacity: 30, targetStudents: 28 },
  { name: 'CP1-B', level: 'CP1', capacity: 30, targetStudents: 27 },
  { name: 'CP2-A', level: 'CP2', capacity: 30, targetStudents: 26 },
  { name: 'CE1-A', level: 'CE1', capacity: 28, targetStudents: 25 },
  { name: 'CE2-A', level: 'CE2', capacity: 28, targetStudents: 24 },
  { name: 'CM1-A', level: 'CM1', capacity: 28, targetStudents: 23 },
  { name: 'CM2-A', level: 'CM2', capacity: 28, targetStudents: 22 },
  { name: 'CM2-B', level: 'CM2', capacity: 28, targetStudents: 25 },
];

// Emploi du temps type par niveau (programme ivoirien)
const TIMETABLES = {
  CP1: [
    { day: 'Lundi', startTime: '08:30', endTime: '10:00', subject: 'Lecture' },
    { day: 'Lundi', startTime: '10:15', endTime: '12:00', subject: 'Écriture' },
    { day: 'Lundi', startTime: '14:30', endTime: '16:00', subject: 'Mathématiques' },
    { day: 'Lundi', startTime: '16:15', endTime: '17:30', subject: 'Éducation physique' },
    
    { day: 'Mardi', startTime: '08:30', endTime: '10:00', subject: 'Mathématiques' },
    { day: 'Mardi', startTime: '10:15', endTime: '12:00', subject: 'Lecture' },
    { day: 'Mardi', startTime: '14:30', endTime: '16:00', subject: 'Dessin' },
    { day: 'Mardi', startTime: '16:15', endTime: '17:30', subject: 'Chant' },
    
    { day: 'Mercredi', startTime: '08:30', endTime: '10:00', subject: 'Écriture' },
    { day: 'Mercredi', startTime: '10:15', endTime: '12:00', subject: 'Calcul' },
    
    { day: 'Jeudi', startTime: '08:30', endTime: '10:00', subject: 'Lecture' },
    { day: 'Jeudi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Jeudi', startTime: '14:30', endTime: '16:00', subject: 'Sciences d\'observation' },
    { day: 'Jeudi', startTime: '16:15', endTime: '17:30', subject: 'Langage' },
    
    { day: 'Vendredi', startTime: '08:30', endTime: '10:00', subject: 'Écriture' },
    { day: 'Vendredi', startTime: '10:15', endTime: '12:00', subject: 'Calcul' },
    { day: 'Vendredi', startTime: '14:30', endTime: '16:00', subject: 'Éducation civique' },
    { day: 'Vendredi', startTime: '16:15', endTime: '17:30', subject: 'Récréation éducative' },
  ],
  CP2: [
    { day: 'Lundi', startTime: '08:30', endTime: '10:00', subject: 'Lecture' },
    { day: 'Lundi', startTime: '10:15', endTime: '12:00', subject: 'Écriture' },
    { day: 'Lundi', startTime: '14:30', endTime: '16:00', subject: 'Mathématiques' },
    { day: 'Lundi', startTime: '16:15', endTime: '17:30', subject: 'Éducation physique' },
    
    { day: 'Mardi', startTime: '08:30', endTime: '10:00', subject: 'Mathématiques' },
    { day: 'Mardi', startTime: '10:15', endTime: '12:00', subject: 'Français' },
    { day: 'Mardi', startTime: '14:30', endTime: '16:00', subject: 'Sciences' },
    { day: 'Mardi', startTime: '16:15', endTime: '17:30', subject: 'Dessin' },
    
    { day: 'Mercredi', startTime: '08:30', endTime: '10:00', subject: 'Lecture' },
    { day: 'Mercredi', startTime: '10:15', endTime: '12:00', subject: 'Calcul' },
    
    { day: 'Jeudi', startTime: '08:30', endTime: '10:00', subject: 'Français' },
    { day: 'Jeudi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Jeudi', startTime: '14:30', endTime: '16:00', subject: 'Histoire-Géographie' },
    { day: 'Jeudi', startTime: '16:15', endTime: '17:30', subject: 'Éducation civique' },
    
    { day: 'Vendredi', startTime: '08:30', endTime: '10:00', subject: 'Écriture' },
    { day: 'Vendredi', startTime: '10:15', endTime: '12:00', subject: 'Calcul' },
    { day: 'Vendredi', startTime: '14:30', endTime: '16:00', subject: 'Arts plastiques' },
    { day: 'Vendredi', startTime: '16:15', endTime: '17:30', subject: 'Chant' },
  ],
  CE1: [
    { day: 'Lundi', startTime: '08:30', endTime: '10:00', subject: 'Français' },
    { day: 'Lundi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Lundi', startTime: '14:30', endTime: '16:00', subject: 'Sciences' },
    { day: 'Lundi', startTime: '16:15', endTime: '17:30', subject: 'Éducation physique' },
    
    { day: 'Mardi', startTime: '08:30', endTime: '10:00', subject: 'Mathématiques' },
    { day: 'Mardi', startTime: '10:15', endTime: '12:00', subject: 'Français' },
    { day: 'Mardi', startTime: '14:30', endTime: '16:00', subject: 'Histoire-Géographie' },
    { day: 'Mardi', startTime: '16:15', endTime: '17:30', subject: 'Dessin' },
    
    { day: 'Mercredi', startTime: '08:30', endTime: '10:00', subject: 'Lecture' },
    { day: 'Mercredi', startTime: '10:15', endTime: '12:00', subject: 'Calcul mental' },
    
    { day: 'Jeudi', startTime: '08:30', endTime: '10:00', subject: 'Français' },
    { day: 'Jeudi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Jeudi', startTime: '14:30', endTime: '16:00', subject: 'Sciences et Technologie' },
    { day: 'Jeudi', startTime: '16:15', endTime: '17:30', subject: 'Éducation civique' },
    
    { day: 'Vendredi', startTime: '08:30', endTime: '10:00', subject: 'Dictée' },
    { day: 'Vendredi', startTime: '10:15', endTime: '12:00', subject: 'Géométrie' },
    { day: 'Vendredi', startTime: '14:30', endTime: '16:00', subject: 'Arts plastiques' },
    { day: 'Vendredi', startTime: '16:15', endTime: '17:30', subject: 'Informatique' },
  ],
  CE2: [
    { day: 'Lundi', startTime: '08:30', endTime: '10:00', subject: 'Français' },
    { day: 'Lundi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Lundi', startTime: '14:30', endTime: '16:00', subject: 'Sciences' },
    { day: 'Lundi', startTime: '16:15', endTime: '17:30', subject: 'Éducation physique' },
    
    { day: 'Mardi', startTime: '08:30', endTime: '10:00', subject: 'Mathématiques' },
    { day: 'Mardi', startTime: '10:15', endTime: '12:00', subject: 'Grammaire' },
    { day: 'Mardi', startTime: '14:30', endTime: '16:00', subject: 'Histoire-Géographie' },
    { day: 'Mardi', startTime: '16:15', endTime: '17:30', subject: 'Anglais' },
    
    { day: 'Mercredi', startTime: '08:30', endTime: '10:00', subject: 'Lecture' },
    { day: 'Mercredi', startTime: '10:15', endTime: '12:00', subject: 'Calcul' },
    
    { day: 'Jeudi', startTime: '08:30', endTime: '10:00', subject: 'Conjugaison' },
    { day: 'Jeudi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Jeudi', startTime: '14:30', endTime: '16:00', subject: 'Sciences et Technologie' },
    { day: 'Jeudi', startTime: '16:15', endTime: '17:30', subject: 'Éducation civique et morale' },
    
    { day: 'Vendredi', startTime: '08:30', endTime: '10:00', subject: 'Orthographe' },
    { day: 'Vendredi', startTime: '10:15', endTime: '12:00', subject: 'Géométrie' },
    { day: 'Vendredi', startTime: '14:30', endTime: '16:00', subject: 'Arts plastiques' },
    { day: 'Vendredi', startTime: '16:15', endTime: '17:30', subject: 'Informatique' },
  ],
  CM1: [
    { day: 'Lundi', startTime: '08:30', endTime: '10:00', subject: 'Français' },
    { day: 'Lundi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Lundi', startTime: '14:30', endTime: '16:00', subject: 'Sciences Physiques' },
    { day: 'Lundi', startTime: '16:15', endTime: '17:30', subject: 'Éducation physique' },
    
    { day: 'Mardi', startTime: '08:30', endTime: '10:00', subject: 'Mathématiques' },
    { day: 'Mardi', startTime: '10:15', endTime: '12:00', subject: 'Grammaire' },
    { day: 'Mardi', startTime: '14:30', endTime: '16:00', subject: 'Histoire' },
    { day: 'Mardi', startTime: '16:15', endTime: '17:30', subject: 'Anglais' },
    
    { day: 'Mercredi', startTime: '08:30', endTime: '10:00', subject: 'Lecture suivie' },
    { day: 'Mercredi', startTime: '10:15', endTime: '12:00', subject: 'Problèmes' },
    
    { day: 'Jeudi', startTime: '08:30', endTime: '10:00', subject: 'Conjugaison' },
    { day: 'Jeudi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Jeudi', startTime: '14:30', endTime: '16:00', subject: 'Géographie' },
    { day: 'Jeudi', startTime: '16:15', endTime: '17:30', subject: 'Éducation civique et morale' },
    
    { day: 'Vendredi', startTime: '08:30', endTime: '10:00', subject: 'Dictée préparée' },
    { day: 'Vendredi', startTime: '10:15', endTime: '12:00', subject: 'Géométrie' },
    { day: 'Vendredi', startTime: '14:30', endTime: '16:00', subject: 'Sciences de la Vie' },
    { day: 'Vendredi', startTime: '16:15', endTime: '17:30', subject: 'Informatique' },
  ],
  CM2: [
    { day: 'Lundi', startTime: '08:30', endTime: '10:00', subject: 'Français' },
    { day: 'Lundi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Lundi', startTime: '14:30', endTime: '16:00', subject: 'Sciences Physiques' },
    { day: 'Lundi', startTime: '16:15', endTime: '17:30', subject: 'Éducation physique' },
    
    { day: 'Mardi', startTime: '08:30', endTime: '10:00', subject: 'Mathématiques' },
    { day: 'Mardi', startTime: '10:15', endTime: '12:00', subject: 'Grammaire' },
    { day: 'Mardi', startTime: '14:30', endTime: '16:00', subject: 'Histoire' },
    { day: 'Mardi', startTime: '16:15', endTime: '17:30', subject: 'Anglais' },
    
    { day: 'Mercredi', startTime: '08:30', endTime: '10:00', subject: 'Expression écrite' },
    { day: 'Mercredi', startTime: '10:15', endTime: '12:00', subject: 'Calcul rapide' },
    
    { day: 'Jeudi', startTime: '08:30', endTime: '10:00', subject: 'Conjugaison' },
    { day: 'Jeudi', startTime: '10:15', endTime: '12:00', subject: 'Mathématiques' },
    { day: 'Jeudi', startTime: '14:30', endTime: '16:00', subject: 'Géographie' },
    { day: 'Jeudi', startTime: '16:15', endTime: '17:30', subject: 'Éducation à la citoyenneté' },
    
    { day: 'Vendredi', startTime: '08:30', endTime: '10:00', subject: 'Orthographe' },
    { day: 'Vendredi', startTime: '10:15', endTime: '12:00', subject: 'Géométrie et mesures' },
    { day: 'Vendredi', startTime: '14:30', endTime: '16:00', subject: 'Sciences de la Vie et de la Terre' },
    { day: 'Vendredi', startTime: '16:15', endTime: '17:30', subject: 'Informatique' },
  ],
};

async function main() {
  console.log('🏫 POPULATION ÉCOLE PRIMAIRE IVOIRIENNE\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Récupérer tous les enseignants
    console.log('📋 Étape 1: Récupération des enseignants...');
    const teachersRes = await axios.get(`${API_URL}/teachers`);
    const teachers = teachersRes.data;
    console.log(`✅ ${teachers.length} enseignants disponibles\n`);

    // 2. Récupérer tous les élèves
    console.log('📋 Étape 2: Récupération des élèves...');
    const studentsRes = await axios.get(`${API_URL}/students`);
    const allStudents = studentsRes.data;
    console.log(`✅ ${allStudents.length} élèves disponibles\n`);

    // 3. Supprimer les anciennes classes pour recommencer proprement
    console.log('🧹 Étape 3: Nettoyage des anciennes classes...');
    const existingClassesRes = await axios.get(`${API_URL}/classes`);
    const existingClasses = existingClassesRes.data.data || [];
    let deletedCount = 0;
    for (const cls of existingClasses) {
      try {
        await axios.delete(`${API_URL}/classes/${cls.id}`);
        deletedCount++;
      } catch (error) {
        console.log(`   ⚠️  Impossible de supprimer ${cls.name} (élèves assignés)`);
      }
    }
    console.log(`✅ ${deletedCount} anciennes classes supprimées (${existingClasses.length - deletedCount} conservées)\n`);

    // 4. Créer les nouvelles classes
    console.log('🏗️  Étape 4: Création des classes ivoiriennes...\n');
    const createdClasses = [];
    
    for (let i = 0; i < SCHOOL_STRUCTURE.length; i++) {
      const classInfo = SCHOOL_STRUCTURE[i];
      const teacher = teachers[i % teachers.length]; // Rotation des profs
      
      const classData = {
        name: classInfo.name,
        level: classInfo.level,
        academicYear: '2024-2025',
        capacity: classInfo.capacity,
        roomNumber: `Salle ${i + 1}`,
        mainTeacherId: teacher.id,
      };

      const response = await axios.post(`${API_URL}/classes`, classData);
      createdClasses.push({ ...response.data, ...classInfo });
      
      console.log(`   ✅ ${classInfo.name} - Prof: ${teacher.firstName} ${teacher.lastName} (Salle ${i + 1})`);
    }
    console.log(`\n✅ ${createdClasses.length} classes créées\n`);

    // 5. Répartir les élèves dans les classes
    console.log('👨‍🎓 Étape 5: Assignation des élèves aux classes...\n');
    
    // Grouper les élèves par niveau (gradeLevel)
    const studentsByLevel: Record<string, any[]> = {
      'CP': [],
      'CE1': [],
      'CE2': [],
      'CM1': [],
      'CM2': [],
    };

    allStudents.forEach((student: any) => {
      const level = student.gradeLevel;
      if (level === 'CP') studentsByLevel['CP'].push(student);
      else if (level === 'CE1') studentsByLevel['CE1'].push(student);
      else if (level === 'CE2') studentsByLevel['CE2'].push(student);
      else if (level === 'CM1') studentsByLevel['CM1'].push(student);
      else if (level === 'CM2') studentsByLevel['CM2'].push(student);
    });

    let totalAssigned = 0;

    for (const cls of createdClasses) {
      const baseLevel = cls.level.replace(/[12]$/, ''); // CP1/CP2 -> CP
      const availableStudents = studentsByLevel[baseLevel] || [];
      const studentsToAssign = availableStudents.splice(0, cls.targetStudents);

      for (const student of studentsToAssign) {
        try {
          await axios.put(`${API_URL}/students/${student.id}`, {
            classId: cls.id,
          });
          totalAssigned++;
        } catch (error) {
          console.error(`   ⚠️  Erreur assignation ${student.firstName} ${student.lastName}`);
        }
      }

      console.log(`   ✅ ${cls.name}: ${studentsToAssign.length} élèves assignés`);
    }

    console.log(`\n✅ Total: ${totalAssigned} élèves assignés\n`);

    // 6. Créer les emplois du temps
    console.log('📅 Étape 6: Génération des emplois du temps...\n');

    for (const cls of createdClasses) {
      const baseLevel = cls.level.replace(/[AB]$/, '').replace(/[12]$/, ''); // CP1-A -> CP
      const timetable = TIMETABLES[baseLevel] || TIMETABLES['CP1'];

      for (const session of timetable) {
        try {
          await axios.post(`${API_URL}/timetable`, {
            classId: cls.id,
            day: session.day,
            subject: session.subject,
            startTime: session.startTime,
            endTime: session.endTime,
            academicYear: '2024-2025',
          });
        } catch (error) {
          // Silencieux pour ne pas polluer les logs
        }
      }

      console.log(`   ✅ ${cls.name}: Emploi du temps créé`);
    }

    console.log('\n');
    console.log('='.repeat(60));
    console.log('🎉 ÉCOLE PRIMAIRE IVOIRIENNE COMPLÈTE!\n');
    console.log(`📊 Statistiques finales:`);
    console.log(`   - ${createdClasses.length} classes actives`);
    console.log(`   - ${totalAssigned} élèves répartis`);
    console.log(`   - ${teachers.length} enseignants titulaires`);
    console.log(`   - Emplois du temps: Lun-Ven, 8h30-12h, 14h30-17h30`);
    console.log('');
    console.log('🎯 Testez maintenant l\'interface de gestion des classes!');
    console.log('   http://localhost:5173\n');

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
