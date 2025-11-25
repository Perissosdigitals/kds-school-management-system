#!/usr/bin/env ts-node
/**
 * Script d'exemple pour ajouter plusieurs notes pour une matière
 * 
 * Usage: ts-node add-multiple-grades-example.ts
 */

interface GradeData {
  studentId: string;
  subjectId: string;
  teacherId: string;
  evaluationType: 'Devoir' | 'Interrogation' | 'Examen' | 'Contrôle continu' | 'Projet' | 'Oral';
  value: number;
  maxValue: number;
  coefficient: number;
  trimester: string;
  academicYear: string;
  evaluationDate: string;
  title?: string;
  comments?: string;
  visibleToParents?: boolean;
}

// Configuration de base
const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  academicYear: '2024-2025',
  trimester: 'Premier trimestre',
};

/**
 * Classe utilitaire pour gérer les notes
 */
class GradeManager {
  private apiUrl: string;
  private authToken: string;

  constructor(apiUrl: string, authToken?: string) {
    this.apiUrl = apiUrl;
    this.authToken = authToken || '';
  }

  /**
   * Ajouter une seule note
   */
  async addGrade(gradeData: GradeData): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        },
        body: JSON.stringify(gradeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('✅ Note ajoutée:', result.data.id);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout:', error);
      throw error;
    }
  }

  /**
   * Ajouter plusieurs notes en une fois (bulk)
   */
  async addGradesBulk(grades: GradeData[]): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/grades/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        },
        body: JSON.stringify({ grades }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log(`✅ ${grades.length} notes ajoutées en masse`);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout en masse:', error);
      throw error;
    }
  }

  /**
   * Récupérer les notes d'un élève
   */
  async getStudentGrades(
    studentId: string,
    trimester?: string,
    academicYear?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      studentId,
      ...(trimester && { trimester }),
      ...(academicYear && { academicYear }),
    });

    const response = await fetch(`${this.apiUrl}/api/grades?${params}`, {
      headers: {
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Calculer la moyenne d'un élève
   */
  async calculateStudentAverage(
    studentId: string,
    trimester?: string,
    academicYear?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      ...(trimester && { trimester }),
      ...(academicYear && { academicYear }),
    });

    const response = await fetch(
      `${this.apiUrl}/api/grades/analytics/student/${studentId}/performance?${params}`,
      {
        headers: {
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Afficher les résultats d'une matière
   */
  displaySubjectResults(subjectData: any): void {
    console.log('\n' + '='.repeat(60));
    console.log(`📚 Matière: ${subjectData.name} (Coef. ${subjectData.coefficient})`);
    console.log('='.repeat(60));
    console.log(`📊 Nombre de notes: ${subjectData.gradeCount || subjectData.grades.length}`);
    console.log(`📈 Moyenne: ${subjectData.average}/20`);
    console.log(`📉 Min: ${subjectData.minGrade || Math.min(...subjectData.grades.map((g: any) => g.normalizedValue))}`);
    console.log(`📈 Max: ${subjectData.maxGrade || Math.max(...subjectData.grades.map((g: any) => g.normalizedValue))}`);
    console.log('\n📝 Détail des notes:');
    console.log('-'.repeat(60));

    subjectData.grades.forEach((grade: any, index: number) => {
      const appreciation = this.getAppreciation(grade.normalizedValue);
      console.log(
        `  ${index + 1}. ${grade.date || grade.evaluationDate} - ${grade.type || grade.evaluationType}: ` +
        `${grade.normalizedValue}/20 (coef ${grade.coefficient}) ${appreciation}`
      );
    });
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Obtenir l'appréciation
   */
  private getAppreciation(note: number): string {
    if (note >= 18) return '🌟 Excellent';
    if (note >= 16) return '✨ Très bien';
    if (note >= 14) return '👍 Bien';
    if (note >= 12) return '😊 Assez bien';
    if (note >= 10) return '🙂 Passable';
    return '😟 Insuffisant';
  }
}

/**
 * EXEMPLE 1: Ajouter plusieurs notes pour une matière
 */
async function exemple1_AjouterNotesMatiere() {
  console.log('\n🎯 EXEMPLE 1: Ajouter plusieurs notes en Mathématiques\n');

  const manager = new GradeManager(CONFIG.apiUrl);

  // IDs (à remplacer par vos vrais IDs)
  const studentId = '99245563-0359-4a54-be9d-b5ecac6a7d59'; // Exemple: Daniel Abitbol
  const mathSubjectId = 'VOTRE_MATH_SUBJECT_ID';
  const teacherId = 'VOTRE_TEACHER_ID';

  // Créer plusieurs notes pour Mathématiques
  const notesMathematiques: GradeData[] = [
    {
      studentId,
      subjectId: mathSubjectId,
      teacherId,
      evaluationType: 'Devoir',
      value: 15,
      maxValue: 20,
      coefficient: 1,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-09-15',
      title: 'Devoir 1 - Les fractions',
      comments: 'Bon travail!',
      visibleToParents: true,
    },
    {
      studentId,
      subjectId: mathSubjectId,
      teacherId,
      evaluationType: 'Interrogation',
      value: 18,
      maxValue: 20,
      coefficient: 1,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-09-22',
      title: 'Interrogation - Calcul mental',
      visibleToParents: true,
    },
    {
      studentId,
      subjectId: mathSubjectId,
      teacherId,
      evaluationType: 'Examen',
      value: 14,
      maxValue: 20,
      coefficient: 3, // ⚠️ Coefficient plus important pour l'examen
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-10-05',
      title: 'Examen - Premier Trimestre',
      visibleToParents: true,
    },
    {
      studentId,
      subjectId: mathSubjectId,
      teacherId,
      evaluationType: 'Contrôle continu',
      value: 17,
      maxValue: 20,
      coefficient: 2,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-10-15',
      title: 'Contrôle - Géométrie',
      visibleToParents: true,
    },
  ];

  console.log(`📝 Ajout de ${notesMathematiques.length} notes en Mathématiques...\n`);

  // Option A: Ajouter une par une (pour voir le détail)
  for (const note of notesMathematiques) {
    await manager.addGrade(note);
  }

  // Option B: Ajouter en masse (plus rapide)
  // await manager.addGradesBulk(notesMathematiques);

  console.log('\n✅ Toutes les notes ont été ajoutées!\n');

  // Calculer et afficher la moyenne
  const performance = await manager.calculateStudentAverage(
    studentId,
    CONFIG.trimester,
    CONFIG.academicYear
  );

  const mathSubject = performance.subjects.find((s: any) => s.subjectId === mathSubjectId);
  if (mathSubject) {
    manager.displaySubjectResults(mathSubject);
  }

  // Vérification du calcul
  console.log('🔍 Vérification du calcul:');
  const somme = mathSubject.grades.reduce(
    (acc: number, g: any) => acc + g.normalizedValue * g.coefficient,
    0
  );
  const totalCoef = mathSubject.grades.reduce((acc: number, g: any) => acc + g.coefficient, 0);
  const moyenneCalculee = somme / totalCoef;

  console.log(`  Somme pondérée: ${somme.toFixed(2)}`);
  console.log(`  Total coefficients: ${totalCoef}`);
  console.log(`  Moyenne calculée: ${moyenneCalculee.toFixed(2)}/20`);
  console.log(`  Moyenne API: ${mathSubject.average}/20`);
  console.log(`  ✅ Match: ${Math.abs(moyenneCalculee - mathSubject.average) < 0.01 ? 'OUI' : 'NON'}\n`);
}

/**
 * EXEMPLE 2: Ajouter des notes pour toutes les matières d'un élève
 */
async function exemple2_AjouterNotesToutesLesmatieres() {
  console.log('\n🎯 EXEMPLE 2: Ajouter des notes pour toutes les matières\n');

  const manager = new GradeManager(CONFIG.apiUrl);

  const studentId = 'VOTRE_STUDENT_ID';
  const teacherId = 'VOTRE_TEACHER_ID';

  // Définir les matières avec leurs IDs
  const matieres = [
    { id: 'MATH_ID', name: 'Mathématiques' },
    { id: 'FRENCH_ID', name: 'Français' },
    { id: 'ENGLISH_ID', name: 'Anglais' },
    { id: 'SCIENCE_ID', name: 'Sciences' },
  ];

  const toutesLesNotes: GradeData[] = [];

  // Pour chaque matière, créer 3-4 notes
  for (const matiere of matieres) {
    console.log(`📚 Création de notes pour ${matiere.name}...`);

    // Devoir
    toutesLesNotes.push({
      studentId,
      subjectId: matiere.id,
      teacherId,
      evaluationType: 'Devoir',
      value: Math.floor(Math.random() * 5) + 13, // Note entre 13 et 18
      maxValue: 20,
      coefficient: 1,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-09-15',
      title: `Devoir 1 - ${matiere.name}`,
      visibleToParents: true,
    });

    // Interrogation
    toutesLesNotes.push({
      studentId,
      subjectId: matiere.id,
      teacherId,
      evaluationType: 'Interrogation',
      value: Math.floor(Math.random() * 5) + 14,
      maxValue: 20,
      coefficient: 1,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-09-25',
      title: `Interrogation - ${matiere.name}`,
      visibleToParents: true,
    });

    // Examen (coefficient plus important)
    toutesLesNotes.push({
      studentId,
      subjectId: matiere.id,
      teacherId,
      evaluationType: 'Examen',
      value: Math.floor(Math.random() * 5) + 12,
      maxValue: 20,
      coefficient: 3,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-10-05',
      title: `Examen ${CONFIG.trimester} - ${matiere.name}`,
      visibleToParents: true,
    });

    // Contrôle
    toutesLesNotes.push({
      studentId,
      subjectId: matiere.id,
      teacherId,
      evaluationType: 'Contrôle continu',
      value: Math.floor(Math.random() * 5) + 13,
      maxValue: 20,
      coefficient: 2,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate: '2024-10-15',
      title: `Contrôle - ${matiere.name}`,
      visibleToParents: true,
    });
  }

  console.log(`\n📝 Ajout de ${toutesLesNotes.length} notes au total...\n`);

  // Ajouter en masse
  await manager.addGradesBulk(toutesLesNotes);

  // Calculer la moyenne générale
  const performance = await manager.calculateStudentAverage(
    studentId,
    CONFIG.trimester,
    CONFIG.academicYear
  );

  console.log('\n📊 RÉSULTAT COMPLET:\n');
  console.log('='.repeat(60));
  console.log(`👤 Élève: ${studentId}`);
  console.log(`📈 Moyenne générale: ${performance.generalAverage}/20`);
  console.log('='.repeat(60));

  performance.subjects.forEach((subject: any) => {
    console.log(`\n  📚 ${subject.name} (Coef. ${subject.coefficient})`);
    console.log(`     Moyenne: ${subject.average}/20`);
    console.log(`     Notes: ${subject.gradeCount} | Min: ${subject.minGrade} | Max: ${subject.maxGrade}`);
  });

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * EXEMPLE 3: Ajouter des notes pour toute une classe
 */
async function exemple3_AjouterNotesTouteLaClasse() {
  console.log('\n🎯 EXEMPLE 3: Ajouter des notes pour toute une classe\n');

  const manager = new GradeManager(CONFIG.apiUrl);

  // IDs à remplacer
  const classeId = 'VOTRE_CLASSE_ID';
  const subjectId = 'VOTRE_SUBJECT_ID';
  const teacherId = 'VOTRE_TEACHER_ID';

  // Récupérer les élèves de la classe (simulation)
  const students = [
    { id: 'STUDENT_1_ID', name: 'Élève 1' },
    { id: 'STUDENT_2_ID', name: 'Élève 2' },
    { id: 'STUDENT_3_ID', name: 'Élève 3' },
    // ... autres élèves
  ];

  const toutesLesNotes: GradeData[] = [];

  // Créer un devoir pour tous les élèves
  const evaluationDate = '2024-09-20';
  const evaluationType: any = 'Devoir';

  console.log(`📝 Création d'un devoir pour ${students.length} élèves...\n`);

  for (const student of students) {
    const note = Math.floor(Math.random() * 11) + 10; // Note entre 10 et 20

    toutesLesNotes.push({
      studentId: student.id,
      subjectId,
      teacherId,
      evaluationType,
      value: note,
      maxValue: 20,
      coefficient: 1,
      trimester: CONFIG.trimester,
      academicYear: CONFIG.academicYear,
      evaluationDate,
      title: 'Devoir 1',
      visibleToParents: true,
    });

    console.log(`  ✅ ${student.name}: ${note}/20`);
  }

  console.log(`\n📤 Envoi des ${toutesLesNotes.length} notes...\n`);

  await manager.addGradesBulk(toutesLesNotes);

  console.log('✅ Notes ajoutées pour toute la classe!\n');
}

/**
 * Menu principal
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  📚 SYSTÈME DE GESTION DES NOTES - EXEMPLES');
  console.log('='.repeat(60));

  const args = process.argv.slice(2);
  const exemple = args[0] || '1';

  try {
    switch (exemple) {
      case '1':
        await exemple1_AjouterNotesMatiere();
        break;
      case '2':
        await exemple2_AjouterNotesToutesLesmatieres();
        break;
      case '3':
        await exemple3_AjouterNotesTouteLaClasse();
        break;
      default:
        console.log('\n❌ Exemple non reconnu. Utilisez: 1, 2, ou 3\n');
        console.log('Usage:');
        console.log('  ts-node add-multiple-grades-example.ts 1  # Ajouter notes pour une matière');
        console.log('  ts-node add-multiple-grades-example.ts 2  # Ajouter notes toutes matières');
        console.log('  ts-node add-multiple-grades-example.ts 3  # Ajouter notes toute la classe');
        console.log('');
    }
  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }

  console.log('✅ Script terminé avec succès!\n');
}

// Exécuter si lancé directement
if (require.main === module) {
  main();
}

export { GradeManager, CONFIG };
