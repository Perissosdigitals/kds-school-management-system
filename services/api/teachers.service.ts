import { httpClient } from '../httpClient';
import { teacherDetails } from '../../data/mockData';
import type { Teacher } from '../../types';

// Mapper pour convertir les données de l'API au format frontend
const mapApiTeacherToFrontend = (apiTeacher: any): Teacher => {
  let specializations: string[] = [];
  if (apiTeacher.specialization) {
    try {
      specializations = JSON.parse(apiTeacher.specialization);
    } catch {
      specializations = [apiTeacher.specialization];
    }
  }

  // Déterminer la matière principale
  let mainSubject = '';
  if (apiTeacher.subject) {
    mainSubject = apiTeacher.subject;
  } else if (apiTeacher.main_subject) {
    mainSubject = apiTeacher.main_subject;
  } else if (specializations.length > 0) {
    mainSubject = specializations[0];
  } else {
    mainSubject = 'Non spécifié';
  }

  return {
    id: apiTeacher.id,
    firstName: apiTeacher.first_name || apiTeacher.firstName || '',
    lastName: apiTeacher.last_name || apiTeacher.lastName || '',
    email: apiTeacher.email || '',
    phone: apiTeacher.phone || '',
    subject: mainSubject, // ⭐ IMPORTANT: Champ matière principale
    hireDate: apiTeacher.hire_date 
      ? new Date(apiTeacher.hire_date).toLocaleDateString('fr-FR')
      : new Date().toLocaleDateString('fr-FR'),
    specialization: specializations.join(', '),
    status: apiTeacher.status === 'active' ? 'Actif' : 'Inactif',
    subjects: specializations,
    address: apiTeacher.address || '',
    emergencyContact: apiTeacher.emergency_contact || '',
    qualifications: apiTeacher.qualifications || '',
    // Données relationnelles (si fournies par l'API)
    classes: apiTeacher.classes || [],
    students: apiTeacher.students || []
  };
};

/**
 * Enrichit un enseignant avec ses classes et élèves (mock data)
 */
const enrichTeacherWithRelations = async (teacher: Teacher): Promise<Teacher> => {
  // Import dynamique pour éviter les dépendances circulaires
  const { schoolClasses, allStudents } = await import('../../data/mockData');
  
  // Trouver les classes de cet enseignant
  const teacherClasses = schoolClasses.filter(c => c.teacherId === teacher.id);
  
  // Trouver les élèves de ces classes
  const classLevels = teacherClasses.map(c => c.level);
  const teacherStudents = allStudents.filter(s => classLevels.includes(s.gradeLevel));
  
  return {
    ...teacher,
    classes: teacherClasses,
    students: teacherStudents
  };
};

export const TeachersService = {
  /**
   * Récupère la liste de tous les enseignants
   */
  async getTeachers(params?: { page?: number; limit?: number }): Promise<Teacher[]> {
    try {
      console.log('TeachersService: Requête API pour les enseignants...');
      const response = await httpClient.get<any[]>('/teachers', { params });
      const teachers = response.data.map(mapApiTeacherToFrontend);
      
      // Enrichir avec les données relationnelles
      const enrichedTeachers = await Promise.all(
        teachers.map(t => enrichTeacherWithRelations(t))
      );
      
      console.log('TeachersService: Enseignants chargés et enrichis:', enrichedTeachers.length);
      return enrichedTeachers;
    } catch (error) {
      console.warn('TeachersService: Erreur API, utilisation des données mock', error);
      // Enrichir aussi les mock data
      const enrichedMockData = await Promise.all(
        teacherDetails.map(t => enrichTeacherWithRelations(t))
      );
      return enrichedMockData;
    }
  },

  /**
   * Récupère un enseignant par ID
   */
  async getTeacherById(id: string): Promise<Teacher | null> {
    try {
      console.log(`TeachersService: Récupération de l'enseignant ${id}...`);
      const response = await httpClient.get<any>(`/teachers/${id}`);
      const teacher = mapApiTeacherToFrontend(response.data);
      return enrichTeacherWithRelations(teacher);
    } catch (error) {
      console.warn(`TeachersService: Erreur lors de la récupération de l'enseignant ${id}`, error);
      const teacher = teacherDetails.find(t => t.id === id);
      return teacher ? enrichTeacherWithRelations(teacher) : null;
    }
  },

  /**
   * Crée un nouvel enseignant
   */
  async createTeacher(teacherData: Omit<Teacher, 'id'>): Promise<Teacher> {
    console.log('📝 TeachersService.createTeacher: Début de la création...', teacherData);
    
    try {
      // Mapper les champs frontend vers le format API
      const apiPayload = {
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        email: teacherData.email,
        phone: teacherData.phone,
        subject: teacherData.subject,
        specialization: teacherData.specialization || '',
        hireDate: teacherData.hireDate || new Date().toISOString(),
        address: teacherData.address || '',
        emergencyContact: teacherData.emergencyContact || '',
        qualifications: teacherData.qualifications || '',
        status: teacherData.status === 'Actif' ? 'active' : 'inactive',
      };
      
      console.log('📤 TeachersService: Envoi vers API POST /teachers', apiPayload);
      const response = await httpClient.post<any>('/teachers', apiPayload);
      console.log('✅ TeachersService: Réponse API reçue:', response.data);
      
      // Mapper et enrichir la réponse
      const newTeacher = mapApiTeacherToFrontend(response.data);
      const enrichedTeacher = await enrichTeacherWithRelations(newTeacher);
      
      console.log('✅ TeachersService: Enseignant créé et enrichi:', enrichedTeacher);
      return enrichedTeacher;
    } catch (error: any) {
      console.error('❌ TeachersService: ERREUR lors de la création:', error);
      console.error('❌ Détails:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Détecter si fallback nécessaire
      const shouldFallback = 
        !error.response || // Pas de connexion réseau
        error.code === 'ECONNABORTED' || // Timeout
        error.response?.status >= 500 || // Erreur serveur
        error.message?.toLowerCase().includes('network'); // Erreur réseau
      
      if (shouldFallback) {
        console.warn('⚠️ TeachersService: API non disponible, création locale (mode fallback)');
        const newTeacherId = `teacher-${Date.now()}`;
        const localTeacher: Teacher = {
          id: newTeacherId,
          ...teacherData,
          status: teacherData.status || 'Actif',
          classes: [],
          students: []
        };
        
        // Ajouter aux mock data
        teacherDetails.push(localTeacher);
        
        // Enrichir avec relations
        const enrichedTeacher = await enrichTeacherWithRelations(localTeacher);
        console.log('🚫 TeachersService: Enseignant créé localement (mode offline):', enrichedTeacher);
        return enrichedTeacher;
      }
      
      // Erreur API à propager
      console.error('🚫 TeachersService: Erreur API non récupérable, propagation...');
      throw error;
    }
  },

  /**
   * Met à jour un enseignant
   */
  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<Teacher> {
    try {
      console.log(`TeachersService: Mise à jour de l'enseignant ${id}...`, teacherData);
      
      // Mapper les champs frontend vers le format API
      const apiPayload: any = {};
      if (teacherData.firstName) apiPayload.firstName = teacherData.firstName;
      if (teacherData.lastName) apiPayload.lastName = teacherData.lastName;
      if (teacherData.email) apiPayload.email = teacherData.email;
      if (teacherData.phone) apiPayload.phone = teacherData.phone;
      if (teacherData.subject) apiPayload.subject = teacherData.subject;
      if (teacherData.specialization) apiPayload.specialization = teacherData.specialization;
      if (teacherData.hireDate) apiPayload.hireDate = teacherData.hireDate;
      if (teacherData.address) apiPayload.address = teacherData.address;
      if (teacherData.emergencyContact) apiPayload.emergencyContact = teacherData.emergencyContact;
      if (teacherData.qualifications) apiPayload.qualifications = teacherData.qualifications;
      if (teacherData.status) apiPayload.status = teacherData.status === 'Actif' ? 'active' : 'inactive';
      
      console.log(`TeachersService: Payload API pour mise à jour:`, apiPayload);
      const response = await httpClient.put<any>(`/teachers/${id}`, apiPayload);
      console.log('TeachersService: Réponse API:', response.data);
      
      // Mapper et enrichir la réponse
      const updatedTeacher = mapApiTeacherToFrontend(response.data);
      const enrichedTeacher = await enrichTeacherWithRelations(updatedTeacher);
      
      console.log('TeachersService: Enseignant mis à jour et enrichi:', enrichedTeacher);
      return enrichedTeacher;
    } catch (error) {
      console.error('TeachersService: Erreur lors de la mise à jour', error);
      throw error;
    }
  },

  /**
   * Supprime un enseignant
   */
  async deleteTeacher(id: string): Promise<void> {
    try {
      console.log(`TeachersService: Suppression de l'enseignant ${id}...`);
      await httpClient.delete(`/teachers/${id}`);
    } catch (error) {
      console.error('TeachersService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};

// Export pour compatibilité rétroactive
export const getTeachers = async (): Promise<Teacher[]> => {
  return TeachersService.getTeachers();
};
