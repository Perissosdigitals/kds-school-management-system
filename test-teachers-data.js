// Test rapide pour voir les données des professeurs
import { teacherDetails } from './data/mockData.js';

console.log('=== DONNÉES DES PROFESSEURS ===\n');
teacherDetails.forEach(teacher => {
  console.log(`ID: ${teacher.id}`);
  console.log(`Nom: ${teacher.firstName} ${teacher.lastName}`);
  console.log(`Matière: ${teacher.subject}`);
  console.log(`Téléphone: ${teacher.phone}`);
  console.log(`Email: ${teacher.email}`);
  console.log(`Statut: ${teacher.status}`);
  console.log('---\n');
});
