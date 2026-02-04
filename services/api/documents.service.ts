import { httpClient } from '../httpClient';
import { config } from '../../config';
const { API_URL } = config;

export const DocumentsService = {
    /**
     * Upload a document file for a student
     */
    uploadFile: async (studentId: string, type: string, file: File, title?: string): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentId', studentId);
        formData.append('type', type);
        if (title) formData.append('title', title);
        else formData.append('title', type);

        const response = await httpClient.post('/documents/upload', formData);
        return response.data;
    },

    /**
     * Get the viewing URL for a document
     */
    getFileViewUrl: (id: string) => {
        // Construct the URL relative to the API base for internal consistency
        return `/api/v1/documents/${id}/view`;
    },

    /**
     * Get documents for a student
     */
    getStudentDocuments: async (studentId: string) => {
        const response = await httpClient.get(`/documents/student/${studentId}`);
        return response.data;
    }
};
