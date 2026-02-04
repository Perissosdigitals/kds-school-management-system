import { httpClient } from '../httpClient';
import { Subject } from '../../types';

export const SubjectsService = {
    /**
     * Récupère tous les sujets
     */
    async getAll(): Promise<Subject[]> {
        try {
            const response = await httpClient.get<{ data: any[] }>('/subjects');
            // Handle both paginated and non-paginated responses
            const subjects = Array.isArray(response.data) ? response.data : response.data.data;

            return subjects.map((s: any) => ({
                id: s.id,
                registrationNumber: s.registrationNumber || s.registration_number || '',
                name: s.name,
                code: s.code,
                color: s.color,
                description: s.description,
                gradeLevel: s.grade_level || s.gradeLevel,
                weeklyHours: s.weekly_hours || s.weeklyHours,
                coefficient: s.coefficient
            }));
        } catch (error) {
            console.error('SubjectsService: Erreur API lors du chargement des matières', error);
            throw error;
        }
    }
};
