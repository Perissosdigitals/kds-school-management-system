import { httpClient } from '../httpClient';
import { allStudents } from '../../data/mockData';
import type { Student } from '../../types';

// Mapper pour convertir les données de l'API au format frontend
const mapApiStudentToFrontend = (apiStudent: any): Student => {
  return {
    id: apiStudent.id || apiStudent.student_code,
    registrationDate: apiStudent.enrollment_date 
      ? new Date(apiStudent.enrollment_date).toLocaleDateString('fr-FR')
      : new Date().toLocaleDateString('fr-FR'),
    lastName: apiStudent.last_name || apiStudent.lastName || '',
    firstName: apiStudent.first_name || apiStudent.firstName || '',
    dob: apiStudent.dob || apiStudent.birth_date 
      ? new Date(apiStudent.dob || apiStudent.birth_date).toLocaleDateString('fr-FR')
      : '',
    // Le backend envoie déjà 'Masculin'/'Féminin', mais on gère aussi les anciens formats
    gender: apiStudent.gender === 'male' ? 'Masculin' : 
            apiStudent.gender === 'female' ? 'Féminin' : 
            apiStudent.gender, // Garde 'Masculin'/'Féminin' tel quel
    nationality: apiStudent.nationality || 'Ivoirienne',
    birthPlace: apiStudent.birth_place || apiStudent.birthPlace || '',
    address: apiStudent.address || '',
    phone: apiStudent.phone || '',
    email: apiStudent.email || '',
    gradeLevel: apiStudent.class_name || apiStudent.academic_level || apiStudent.gradeLevel || '',
    classId: apiStudent.class_id || apiStudent.classId, // ID de la classe spécifique
    previousSchool: apiStudent.previous_school || apiStudent.previousSchool || '',
    emergencyContactName: apiStudent.emergency_contact || apiStudent.emergencyContactName || '',
    emergencyContactPhone: apiStudent.emergencyContactPhone || '',
    medicalInfo: apiStudent.medical_info || apiStudent.medicalInfo || '',
    status: apiStudent.status === 'active' ? 'Actif' : apiStudent.status === 'inactive' ? 'Inactif' : apiStudent.status || 'En attente',
    documents: []
  };
};

/**
 * Enrichit un élève avec sa classe et son enseignant
 * Priorité: 1) classId direct, 2) gradeLevel (fallback)
 */
const enrichStudentWithRelations = async (student: Student): Promise<Student> => {
  // Import dynamique pour éviter les dépendances circulaires
  const { schoolClasses, teacherDetails } = await import('../../data/mockData');
  
  // Stratégie 1: Si classId est fourni, chercher directement la classe
  let studentClass = student.classId 
    ? schoolClasses.find(c => c.id === student.classId)
    : undefined;
  
  // Stratégie 2 (fallback): Chercher par niveau scolaire si classId non fourni
  if (!studentClass && student.gradeLevel) {
    studentClass = schoolClasses.find(c => c.level === student.gradeLevel);
  }
  
  // Trouver l'enseignant de cette classe
  let teacher = undefined;
  if (studentClass?.teacherId) {
    teacher = teacherDetails.find(t => t.id === studentClass.teacherId);
  }
  
  return {
    ...student,
    classId: studentClass?.id || student.classId,
    class: studentClass,
    teacherId: teacher?.id || student.teacherId,
    teacher: teacher
  };
};

export const StudentsService = {
  /**
   * Récupère la liste de tous les élèves
   */
  async getStudents(params?: { page?: number; limit?: number }): Promise<Student[]> {
    try {
      console.log('StudentsService: Requête API pour les élèves...');
      const response = await httpClient.get<any[]>('/students', { params });
      const students = response.data.map(mapApiStudentToFrontend);
      
      // Enrichir avec les données relationnelles
      const enrichedStudents = await Promise.all(
        students.map(s => enrichStudentWithRelations(s))
      );
      
      console.log('StudentsService: Élèves chargés et enrichis:', enrichedStudents.length);
      return enrichedStudents;
    } catch (error) {
      console.warn('StudentsService: Erreur API, utilisation des données mock', error);
      // Enrichir aussi les mock data
      const enrichedMockData = await Promise.all(
        allStudents.map(s => enrichStudentWithRelations(s))
      );
      return enrichedMockData;
    }
  },

  /**
   * Récupère un élève par ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    try {
      console.log(`StudentsService: Récupération de l'élève ${id}...`);
      const response = await httpClient.get<any>(`/students/${id}`);
      const student = mapApiStudentToFrontend(response.data);
      return enrichStudentWithRelations(student);
    } catch (error) {
      console.warn(`StudentsService: Erreur lors de la récupération de l'élève ${id}`, error);
      const student = allStudents.find(s => s.id === id);
      return student ? enrichStudentWithRelations(student) : null;
    }
  },

  /**
   * Crée un nouvel élève
   */
  async createStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    console.log('📝 StudentsService: Début création élève...', studentData);
    
    try {
      // Mapper les champs frontend vers le format API
      // Note: registrationDate n'est pas accepté par le backend - il est géré automatiquement
      
      // Convertir le genre vers le format API backend: 'Masculin' ou 'Féminin'
      let genderValue: 'Masculin' | 'Féminin' = 'Masculin'; // valeur par défaut
      if (studentData.gender === 'Masculin' || studentData.gender === 'M' || studentData.gender === 'male') {
        genderValue = 'Masculin';
      } else if (studentData.gender === 'Féminin' || studentData.gender === 'F' || studentData.gender === 'female') {
        genderValue = 'Féminin';
      }
      
      const apiPayload = {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        dob: studentData.dob, // Le backend attend 'dob' (date of birth)
        gender: genderValue, // Le backend attend 'Masculin' ou 'Féminin'
        nationality: studentData.nationality,
        birthPlace: studentData.birthPlace,
        address: studentData.address,
        phone: studentData.phone,
        email: studentData.email || undefined,
        gradeLevel: studentData.gradeLevel,
        classId: studentData.classId || undefined, // ID de la classe spécifique
        previousSchool: studentData.previousSchool || undefined,
        emergencyContactName: studentData.emergencyContactName,
        emergencyContactPhone: studentData.emergencyContactPhone,
        medicalInfo: studentData.medicalInfo || undefined,
        status: studentData.status || 'En attente',
        // registrationDate est géré par le backend
      };
      
      console.log('📤 StudentsService: Tentative appel API avec payload:', apiPayload);
      const response = await httpClient.post<any>('/students', apiPayload);
      console.log('✅ StudentsService: Réponse API reçue:', response.data);
      
      // Mapper et enrichir la réponse
      const newStudent = mapApiStudentToFrontend(response.data);
      const enrichedStudent = await enrichStudentWithRelations(newStudent);
      
      console.log('🎉 StudentsService: Élève créé et enrichi avec succès:', enrichedStudent);
      return enrichedStudent;
      
    } catch (error: any) {
      console.error('❌ StudentsService: ERREUR lors de la création:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      // Déterminer si on peut utiliser le fallback local
      const shouldUseFallback = 
        !error.response || // Pas de réponse (problème réseau)
        error.response.status >= 500 || // Erreur serveur
        error.message?.includes('timeout') || // Timeout
        error.message?.includes('Network'); // Problème réseau
      
      if (shouldUseFallback) {
        console.warn('⚠️ StudentsService: API non disponible, activation du fallback local...');
        const newStudentId = `KDS24${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const localStudent: Student = {
          id: newStudentId,
          registrationDate: new Date().toLocaleDateString('fr-FR'),
          ...studentData,
          documents: []
        };
        
        // Ajouter aux mock data
        allStudents.push(localStudent);
        
        // Enrichir avec relations
        const enrichedStudent = await enrichStudentWithRelations(localStudent);
        console.log('✅ StudentsService: Élève créé localement avec succès:', enrichedStudent);
        return enrichedStudent;
      }
      
      // Pour les autres erreurs (400, 401, 403, etc.), on propage l'erreur
      console.error('🚫 StudentsService: Erreur non récupérable, propagation...');
      throw error;
    }
  },

  /**
   * Met à jour un élève
   */
  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    try {
      console.log(`StudentsService: Mise à jour de l'élève ${id}...`, studentData);
      
      // Mapper les champs frontend vers le format API
      const apiPayload: any = {};
      if (studentData.firstName) apiPayload.firstName = studentData.firstName;
      if (studentData.lastName) apiPayload.lastName = studentData.lastName;
      if (studentData.dob) apiPayload.dob = studentData.dob;
      if (studentData.gender) apiPayload.gender = studentData.gender;
      if (studentData.nationality) apiPayload.nationality = studentData.nationality;
      if (studentData.birthPlace) apiPayload.birthPlace = studentData.birthPlace;
      if (studentData.address) apiPayload.address = studentData.address;
      if (studentData.phone) apiPayload.phone = studentData.phone;
      if (studentData.email) apiPayload.email = studentData.email;
      if (studentData.gradeLevel) apiPayload.gradeLevel = studentData.gradeLevel;
      if (studentData.previousSchool) apiPayload.previousSchool = studentData.previousSchool;
      if (studentData.emergencyContactName) apiPayload.emergencyContactName = studentData.emergencyContactName;
      if (studentData.emergencyContactPhone) apiPayload.emergencyContactPhone = studentData.emergencyContactPhone;
      if (studentData.medicalInfo) apiPayload.medicalInfo = studentData.medicalInfo;
      if (studentData.status) apiPayload.status = studentData.status;
      // Conversion du genre si nécessaire
      if (studentData.gender) {
        apiPayload.gender = studentData.gender === 'Masculin' ? 'male' : 'female';
      }
      
      console.log(`StudentsService: Payload API pour mise à jour:`, apiPayload);
      const response = await httpClient.put<any>(`/students/${id}`, apiPayload);
      console.log('StudentsService: Réponse API:', response.data);
      
      // Mapper et enrichir la réponse
      const updatedStudent = mapApiStudentToFrontend(response.data);
      const enrichedStudent = await enrichStudentWithRelations(updatedStudent);
      
      console.log('StudentsService: Élève mis à jour et enrichi:', enrichedStudent);
      return enrichedStudent;
    } catch (error) {
      console.error('StudentsService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime un élève
   */
  async deleteStudent(id: string): Promise<void> {
    try {
      console.log(`StudentsService: Suppression de l'élève ${id}...`);
      await httpClient.delete(`/students/${id}`);
    } catch (error) {
      console.error('StudentsService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};
