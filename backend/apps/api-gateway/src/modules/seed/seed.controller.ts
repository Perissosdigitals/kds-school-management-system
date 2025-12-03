import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('seed')
export class SeedController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Post('full-school')
  @HttpCode(HttpStatus.OK)
  async seedFullSchool() {
    console.log('🌱 Starting full school seed...');
    
    try {
      // Read the seed SQL file
      const seedFilePath = join(__dirname, '../../../../shared/database/seed-full-school.sql');
      const seedSQL = readFileSync(seedFilePath, 'utf8');

      // Execute the seed SQL
      await this.dataSource.query(seedSQL);

      // Get summary statistics
      const [users, students, teachers, classes, subjects, grades, attendance, timetable, transactions] =
        await Promise.all([
          this.dataSource.query('SELECT COUNT(*) as count FROM users'),
          this.dataSource.query('SELECT COUNT(*) as count FROM students'),
          this.dataSource.query('SELECT COUNT(*) as count FROM teachers'),
          this.dataSource.query('SELECT COUNT(*) as count FROM classes'),
          this.dataSource.query('SELECT COUNT(*) as count FROM subjects'),
          this.dataSource.query('SELECT COUNT(*) as count FROM grades'),
          this.dataSource.query('SELECT COUNT(*) as count FROM attendance'),
          this.dataSource.query('SELECT COUNT(*) as count FROM timetable_slots'),
          this.dataSource.query('SELECT COUNT(*) as count FROM financial_transactions'),
        ]);

      // Get class distribution
      const classDistribution = await this.dataSource.query(`
        SELECT c.name, c.level, COUNT(s.id) as student_count
        FROM classes c
        LEFT JOIN students s ON s.class_id = c.id
        GROUP BY c.id, c.name, c.level
        ORDER BY c.level, c.name
      `);

      return {
        success: true,
        message: 'Database seeded successfully with full school year data',
        summary: {
          users: parseInt(users[0].count),
          students: parseInt(students[0].count),
          teachers: parseInt(teachers[0].count),
          classes: parseInt(classes[0].count),
          subjects: parseInt(subjects[0].count),
          grades: parseInt(grades[0].count),
          attendance: parseInt(attendance[0].count),
          timetableSlots: parseInt(timetable[0].count),
          financialTransactions: parseInt(transactions[0].count),
        },
        classDistribution,
      };
    } catch (error) {
      console.error('❌ Error seeding database:', error.message);
      throw error;
    }
  }
}
