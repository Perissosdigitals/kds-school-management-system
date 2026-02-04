
import { D1Database } from '@cloudflare/workers-types';

export class CloudflareAnalyticsService {
    constructor(private readonly db: D1Database) { }

    /**
     * Fetch consolidated dashboard metrics with dynamic fallback
     */
    async getDashboard() {
        try {
            const batchResults = await this.db.batch([
                // 1. Fast metrics from aggregation table
                this.db.prepare("SELECT metric_key, metric_value FROM dashboard_metrics"),

                // 2. Class Distribution & Occupancy
                this.db.prepare(`
          SELECT c.id, c.name as class_name, c.capacity,
                 (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND LOWER(s.status) IN ('active', 'actif')) as student_count,
                 u.first_name || ' ' || u.last_name as teacher_name
          FROM classes c
          LEFT JOIN teachers t ON c.main_teacher_id = t.id
          LEFT JOIN users u ON t.user_id = u.id
          WHERE c.is_active = 1
          ORDER BY c.level, c.name
        `),

                // 3. Class Performance (Average Grades)
                this.db.prepare(`
          SELECT c.id, c.name, AVG((g.value / g.max_value) * 100) as average
          FROM classes c
          JOIN students s ON s.class_id = c.id
          JOIN grades g ON g.student_id = s.id
          WHERE c.is_active = 1
          GROUP BY c.id, c.name
          ORDER BY average DESC
        `),

                // 4. Document Stats (Last 30 days)
                this.db.prepare(`
          SELECT 
            COUNT(*) as total_docs,
            SUM(CASE WHEN status IN ('pending', 'En attente') THEN 1 ELSE 0 END) as pending_docs,
            SUM(CASE WHEN status IN ('approved', 'Validé') THEN 1 ELSE 0 END) as approved_docs,
            SUM(CASE WHEN status IN ('rejected', 'Rejeté') THEN 1 ELSE 0 END) as rejected_docs
          FROM documents
        `)
            ]);

            const metricsRaw = batchResults[0]?.results || [];
            const metrics: Record<string, number> = {};
            metricsRaw.forEach((m: any) => { metrics[m.metric_key || m.metric_date] = m.metric_value; });

            const classes = batchResults[1]?.results || [];
            const performance = batchResults[2]?.results || [];
            const docs = batchResults[3]?.results?.[0] as any || {};

            return {
                students: {
                    total: metrics['total_students'] || 0,
                    male: metrics['students_male'] || 0,
                    female: metrics['students_female'] || 0
                },
                teachers: {
                    total: metrics['total_teachers'] || 0
                },
                classes: classes.map((c: any) => ({
                    ...c,
                    student_count: Number(c.student_count)
                })),
                documents: {
                    total_docs: docs.total_docs || 0,
                    pending_docs: metrics['pending_documents'] || docs.pending_docs || 0,
                    approved_docs: docs.approved_docs || 0,
                    rejected_docs: docs.rejected_docs || 0,
                    missing_docs: (metrics['total_students'] || 0) * 4 - (docs.total_docs || 0) // Approximation: 4 docs per student
                },
                classPerformances: performance.map((p: any) => ({
                    ...p,
                    average: Number(p.average || 0).toFixed(2)
                })),
                status: 'production_ready_d1',
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Analytics Error:', error);
            throw error;
        }
    }
}
