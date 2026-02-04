import { httpClient } from '../httpClient';
import type { SystemActivity, User } from '../../types';

export const ActivityService = {
    /**
     * Enregistre une nouvelle activité dans le système
     */
    async logActivity(
        user: User,
        action: string,
        category: SystemActivity['category'],
        details?: string,
        classId?: string,
        studentId?: string
    ): Promise<SystemActivity> {
        const activity: any = {
            timestamp: new Date().toISOString(),
            user_id: user.id,
            user_name: user.name || `${user.first_name} ${user.last_name}`,
            user_role: user.role,
            action,
            category,
            details,
            class_id: classId,
            student_id: studentId,
        };

        try {
            console.log(`[ActivityService] Logging: ${action} (${category})`);
            const response = await httpClient.post<SystemActivity>('activities', activity);
            return response.data;
        } catch (error) {
            console.error('[ActivityService] Error logging activity:', error);
            // Fallback local persistence if needed (e.g. localStorage)
            const localActivity: SystemActivity = {
                id: `local-${Date.now()}`,
                ...activity
            };
            return localActivity;
        }
    },

    /**
     * Récupère toutes les activités du système
     */
    async getActivities(): Promise<SystemActivity[]> {
        try {
            const response = await httpClient.get<SystemActivity[]>('/activities');
            return response.data;
        } catch (error) {
            console.error('[ActivityService] Error fetching activities:', error);
            return [];
        }
    }
};
