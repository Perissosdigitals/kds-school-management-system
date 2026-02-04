import { httpClient } from '../httpClient';
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
    registrationNumber: apiTeacher.registrationNumber || apiTeacher.registration_number || '',
    subject: mainSubject, // ⭐ IMPORTANT: Champ matière principale
    hireDate: apiTeacher.hire_date
      ? new Date(apiTeacher.hire_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    specialization: specializations.join(', '),
    status: (apiTeacher.status === 'active' || apiTeacher.status === 'Actif') ? 'Actif' : 'Inactif',
    subjects: specializations,
    address: apiTeacher.address || '',
    emergencyContact: apiTeacher.emergency_contact || '',
    qualifications: apiTeacher.qualifications || '',
    // Données relationnelles (si fournies par l'API)
    classes: apiTeacher.classes || [],
    students: apiTeacher.students || []
  };
};

// Note: enrichTeacherWithRelations was removed to avoid overwriting real API data with mock data.

export const TeachersService = {
  /**
   * Récupère la liste de tous les enseignants
   */
  async getTeachers(params?: { page?: number; limit?: number }): Promise<Teacher[]> {
    try {
      console.log('TeachersService: Requête API pour les enseignants...');
      const response = await httpClient.get<any[]>('/teachers', { params });
      const teachers = response.data.map(mapApiTeacherToFrontend);

      console.log('TeachersService: Enseignants chargés:', teachers.length);
      return teachers;
    } catch (error) {
      console.error('TeachersService: Erreur lors du chargement des enseignants', error);
      throw error;
    }
  },

  /**
   * Récupère un enseignant par ID
   */
  async getTeacherById(id: string): Promise<Teacher | null> {
    try {
      console.log(`TeachersService: Récupération de l'enseignant ${id}...`);
      const response = await httpClient.get<any>(`/teachers/${id}`);
      return mapApiTeacherToFrontend(response.data);
    } catch (error) {
      console.error(`TeachersService: Erreur lors de la récupération de l'enseignant ${id}`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel enseignant
   */
  async createTeacher(teacherData: Omit<Teacher, 'id'> & { classIds?: string[] }): Promise<Teacher> {
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
        status: teacherData.status, // 'Actif' ou 'Inactif'
        classIds: teacherData.classIds || []
      };

      console.log('📤 TeachersService: Envoi vers API POST /teachers', apiPayload);
      const response = await httpClient.post<any>('/teachers', apiPayload);
      console.log('✅ TeachersService: Réponse API reçue:', response.data);

      // Mapper et enrichir la réponse
      const newTeacher = mapApiTeacherToFrontend(response.data);
      console.log('✅ TeachersService: Enseignant créé:', newTeacher);
      return newTeacher;
    } catch (error: any) {
      console.error('❌ TeachersService: ERREUR lors de la création:', error);
      throw error;
    }
  },

  /**
   * Met à jour un enseignant
   */
  async updateTeacher(id: string, teacherData: Partial<Teacher> & { classIds?: string[] }): Promise<Teacher> {
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
      if (teacherData.status) apiPayload.status = teacherData.status; // Pass 'Actif' or 'Inactif' directly
      if (teacherData.classIds) apiPayload.classIds = teacherData.classIds;

      console.log(`TeachersService: Payload API pour mise à jour:`, apiPayload);
      const response = await httpClient.put<any>(`/teachers/${id}`, apiPayload);
      console.log('TeachersService: Réponse API:', response.data);

      // Mapper et enrichir la réponse
      const updatedTeacher = mapApiTeacherToFrontend(response.data);
      console.log('TeachersService: Enseignant mis à jour:', updatedTeacher);
      return updatedTeacher;
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('TeachersService: Erreur lors de la suppression', error);
      throw error;
    }
  }
};

// Export pour compatibilité rétroactive
export const getTeachers = async (): Promise<Teacher[]> => {
  return TeachersService.getTeachers();
};
