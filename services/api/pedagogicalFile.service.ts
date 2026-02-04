import { httpClient } from '../httpClient';
import type { Grade, Evaluation, PedagogicalNote } from '../../types';

export interface PedagogicalFileData {
  academicData: {
    overallAverage: number;
    averagePerSubject: { subject: string; average: number }[];
  };
  attendanceData: {
    absences: number;
    lates: number;
  };
  recentGrades: (Grade & { evaluationInfo?: Evaluation })[];
  pedagogicalNotes: PedagogicalNote[];
}

export const PedagogicalFileService = {
  /**
   * Récupère le dossier pédagogique complet d'un élève
   */
  async getPedagogicalFile(studentId: string): Promise<PedagogicalFileData> {
    try {
      console.log(`PedagogicalFileService: Récupération du dossier pour l'élève ${studentId}...`);
      const response = await httpClient.get<PedagogicalFileData>(`/students/${studentId}/pedagogical-file`);
      return response.data;
    } catch (error) {
      console.error(`PedagogicalFileService: Erreur API lors du chargement du dossier ${studentId}`, error);
      return {
        academicData: { overallAverage: 0, averagePerSubject: [] },
        attendanceData: { absences: 0, lates: 0 },
        recentGrades: [],
        pedagogicalNotes: []
      };
    }
  },

  /**
   * Ajoute une note pédagogique
   */
  async addPedagogicalNote(studentId: string, note: Omit<PedagogicalNote, 'id'>): Promise<PedagogicalNote> {
    try {
      console.log(`PedagogicalFileService: Ajout d'une note pédagogique...`);
      const response = await httpClient.post<PedagogicalNote>(`/students/${studentId}/pedagogical-notes`, note);
      return response.data;
    } catch (error) {
      console.error('PedagogicalFileService: Erreur lors de l\'ajout', error);
      throw error;
    }
  }
};

export const getPedagogicalFileData = async (studentId: string): Promise<PedagogicalFileData> => {
  return PedagogicalFileService.getPedagogicalFile(studentId);
};
