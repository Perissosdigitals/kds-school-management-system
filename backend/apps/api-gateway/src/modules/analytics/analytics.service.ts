import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardMetrics } from './entities/dashboard-metrics.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(DashboardMetrics)
    private metricsRepository: Repository<DashboardMetrics>,
  ) { }

  async getDashboard() {
    try {
      // 1. Fetch student-level document metrics dynamically
      // This ensures we have the same categorization as the Documentation page
      const docStatsQuery = `
        WITH student_doc_counts AS (
          SELECT 
            s.id,
            COUNT(d.id) FILTER (WHERE d.validation_state IN ('valid', 'Validé')) as validated_count,
            COUNT(d.id) FILTER (WHERE d.validation_state IN ('pending', 'En attente', 'En attente de validation')) as pending_count,
            COUNT(d.id) FILTER (WHERE d.validation_state IN ('rejected', 'Rejeté')) as rejected_count
          FROM students s
          LEFT JOIN documents d ON s.id = d.student_id
          WHERE LOWER(s.status::text) IN ('active', 'actif')
          GROUP BY s.id
        )
        SELECT
          COUNT(*) as total_students,
          COUNT(*) FILTER (WHERE validated_count >= 4) as complete_folders,
          COUNT(*) FILTER (WHERE COALESCE(validated_count, 0) < 4) as incomplete_folders,
          COUNT(*) FILTER (WHERE pending_count > 0 AND validated_count < 4) as pending_folders,
          COUNT(*) FILTER (WHERE COALESCE(validated_count, 0) = 0 AND COALESCE(pending_count, 0) = 0) as empty_folders,
          COUNT(*) FILTER (WHERE rejected_count > 0) as rejected_folders,
          SUM(GREATEST(0, 4 - (COALESCE(validated_count, 0) + COALESCE(pending_count, 0)))) as total_missing_docs,
          SUM(COALESCE(pending_count, 0)) as total_pending_docs
        FROM student_doc_counts;
      `;

      const [docStatsResult] = await this.metricsRepository.query(docStatsQuery);
      this.logger.log(`[Analytics] Dynamic result for folder logic: ${JSON.stringify(docStatsResult)}`);

      const totalStudents = parseInt(docStatsResult?.total_students || 0);
      const completeFolders = parseInt(docStatsResult?.complete_folders || 0);
      const incompleteFolders = parseInt(docStatsResult?.incomplete_folders || 0);
      const pendingFolders = parseInt(docStatsResult?.pending_folders || 0);
      const emptyFolders = parseInt(docStatsResult?.empty_folders || 0);
      const rejectedFolders = parseInt(docStatsResult?.rejected_folders || 0);
      const totalMissingDocs = parseInt(docStatsResult?.total_missing_docs || 0);
      const totalPendingDocs = parseInt(docStatsResult?.total_pending_docs || 0);

      // 2. Fetch basic counts for gender distribution
      const genderStats = await this.metricsRepository.query(`
        SELECT 
          COUNT(*) FILTER (WHERE LOWER(gender::text) IN ('male', 'masculin', 'm')) as male,
          COUNT(*) FILTER (WHERE LOWER(gender::text) IN ('female', 'féminin', 'f')) as female
        FROM students
        WHERE LOWER(status::text) IN ('active', 'actif')
      `);

      const totalTeachers = await this.metricsRepository.query(`
        SELECT COUNT(*) as total FROM teachers WHERE LOWER(status::text) IN ('active', 'actif')
      `);

      // 3. Fetch class distribution dynamically
      const classes = await this.metricsRepository.query(`
        SELECT 
          c.id, 
          c.name as class_name, 
          c.capacity, 
          COUNT(s.id) as student_count,
          COALESCE(t.first_name || ' ' || t.last_name, 'Non assigné') as teacher_name
        FROM classes c
        LEFT JOIN students s ON c.id = s.class_id AND LOWER(s.status::text) IN ('active', 'actif')
        LEFT JOIN teachers t ON c.main_teacher_id = t.id
        GROUP BY c.id, c.name, c.capacity, t.first_name, t.last_name
        ORDER BY c.name ASC
      `);

      // 4. Fetch class performances
      const classPerformances = await this.metricsRepository.query(`
        SELECT 
          c.id, 
          c.name, 
          COALESCE(AVG(g.value * 100.0 / NULLIF(g.max_value, 0)), 0) as average
        FROM classes c
        JOIN students s ON c.id = s.class_id
        JOIN grades g ON s.id = g.student_id
        GROUP BY c.id, c.name
      `);

      return {
        students: {
          total: totalStudents,
          male: parseInt(genderStats[0]?.male || 0),
          female: parseInt(genderStats[0]?.female || 0),
        },
        teachers: {
          total: parseInt(totalTeachers[0]?.total || 0),
        },
        classes: classes.map(c => ({
          ...c,
          student_count: parseInt(c.student_count)
        })),
        documents: {
          total_docs: totalStudents * 4 - totalMissingDocs,
          pending_docs: totalPendingDocs, // Total number of pending documents
          pending_students: pendingFolders, // Number of students with pending docs
          approved_docs: completeFolders, // Number of students with 4 validated docs
          incomplete_folders: incompleteFolders, // Number of students missing docs
          rejected_docs: rejectedFolders, // Number of students with rejections
          missing_docs: emptyFolders, // Number of students with no docs at all
          total_missing: totalMissingDocs // Absolute count of missing files
        },
        classPerformances: classPerformances.map(cp => ({
          id: cp.id,
          name: cp.name,
          average: parseFloat(cp.average)
        })),
        lastUpdated: new Date(),
        status: 'realtime_dynamic_aggregated'
      };
    } catch (error) {
      this.logger.error('Error calculating dynamic dashboard metrics', error.stack);
      return {
        students: { total: 0, male: 0, female: 0 },
        teachers: { total: 0 },
        classes: [],
        documents: { total_docs: 0, pending_docs: 0, approved_docs: 0, rejected_docs: 0, missing_docs: 0 },
        status: 'error_fallback'
      };
    }
  }
}
