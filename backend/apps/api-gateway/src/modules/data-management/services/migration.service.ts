import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { SchoolClass } from '../../classes/entities/class.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { MigrationOptionsDto } from '../dto/migration-options.dto';

export interface MigrationResult {
  success: boolean;
  fromYear: string;
  toYear: string;
  studentsUpdated: number;
  classesCreated: number;
  gradesArchived?: number;
  attendanceArchived?: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(SchoolClass)
    private classRepository: Repository<SchoolClass>,
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private dataSource: DataSource,
  ) {}

  async migrateAcademicYear(options: MigrationOptionsDto): Promise<MigrationResult> {
    const startedAt = new Date();
    this.logger.log(`Starting academic year migration from ${options.currentYear} to ${options.newYear}`);

    const errors: string[] = [];
    let studentsUpdated = 0;
    let classesCreated = 0;
    let gradesArchived = 0;
    let attendanceArchived = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Créer les nouvelles classes pour la nouvelle année
      if (options.copyEnrollments) {
        const currentClasses = await this.classRepository.find({
          where: { academicYear: options.currentYear, isActive: true },
        });

        for (const currentClass of currentClasses) {
          // Déterminer le niveau suivant
          const nextLevel = this.getNextLevel(currentClass.level);
          
          if (nextLevel) {
            const newClass = this.classRepository.create({
              name: currentClass.name.replace(options.currentYear, options.newYear),
              level: nextLevel,
              academicYear: options.newYear,
              mainTeacherId: currentClass.mainTeacherId,
              roomNumber: currentClass.roomNumber,
              capacity: currentClass.capacity,
              isActive: true,
            });

            await queryRunner.manager.save(newClass);
            classesCreated++;
            this.logger.log(`Created new class: ${newClass.name}`);
          }
        }
      }

      // 2. Migrer les élèves vers les nouvelles classes
      if (options.copyEnrollments) {
        const students = await this.studentRepository.find({
          relations: ['class'],
        });

        for (const student of students) {
          if (student.class && student.class.academicYear === options.currentYear) {
            const nextLevel = this.getNextLevel(student.class.level);
            
            if (nextLevel) {
              // Trouver la classe correspondante dans la nouvelle année
              const newClass = await queryRunner.manager.findOne(SchoolClass, {
                where: {
                  level: nextLevel,
                  academicYear: options.newYear,
                  isActive: true,
                },
              });

              if (newClass) {
                student.classId = newClass.id;
                await queryRunner.manager.save(student);
                studentsUpdated++;
              } else {
                errors.push(`No class found for student ${student.id} at level ${nextLevel}`);
              }
            }
          }
        }

        this.logger.log(`Updated ${studentsUpdated} students to new classes`);
      }

      // 3. Archiver les anciennes notes si demandé
      if (options.archiveOldData) {
        const oldGrades = await this.gradesRepository.count({
          where: { academicYear: options.currentYear },
        });
        
        // Dans une vraie application, on déplacerait vers une table d'archive
        // Pour l'instant, on les marque juste comme "visibleToParents: false"
        await queryRunner.manager.update(
          Grade,
          { academicYear: options.currentYear },
          { visibleToParents: false }
        );
        
        gradesArchived = oldGrades;
        this.logger.log(`Archived ${gradesArchived} grades from ${options.currentYear}`);
      }

      // 4. Archiver les anciennes présences si demandé
      if (options.archiveOldData) {
        // Compter les présences de l'ancienne année
        const oldAttendances = await queryRunner.manager
          .createQueryBuilder(Attendance, 'attendance')
          .where('EXTRACT(YEAR FROM attendance.date) = :year', {
            year: parseInt(options.currentYear.split('-')[0])
          })
          .getCount();

        attendanceArchived = oldAttendances;
        this.logger.log(`Counted ${attendanceArchived} attendance records from ${options.currentYear}`);
      }

      // 5. Réinitialiser les notes si demandé
      if (options.resetGrades) {
        // Ne pas supprimer, juste désactiver la visibilité
        await queryRunner.manager.update(
          Grade,
          { academicYear: options.newYear },
          { visibleToParents: false }
        );
        this.logger.log('Reset grades visibility for new academic year');
      }

      await queryRunner.commitTransaction();

      const completedAt = new Date();
      this.logger.log(`Academic year migration completed successfully in ${completedAt.getTime() - startedAt.getTime()}ms`);

      return {
        success: true,
        fromYear: options.currentYear,
        toYear: options.newYear,
        studentsUpdated,
        classesCreated,
        gradesArchived,
        attendanceArchived,
        errors,
        startedAt,
        completedAt,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Academic year migration failed', error);
      
      errors.push(error.message);
      
      return {
        success: false,
        fromYear: options.currentYear,
        toYear: options.newYear,
        studentsUpdated,
        classesCreated,
        gradesArchived,
        attendanceArchived,
        errors,
        startedAt,
        completedAt: new Date(),
      };
    } finally {
      await queryRunner.release();
    }
  }

  private getNextLevel(currentLevel: string): string | null {
    const levelMap: Record<string, string> = {
      '6ème': '5ème',
      '5ème': '4ème',
      '4ème': '3ème',
      '3ème': '2nde',
      '2nde': '1ère',
      '1ère': 'Terminale',
      'Terminale': null, // Diplômés
      'CP': 'CE1',
      'CE1': 'CE2',
      'CE2': 'CM1',
      'CM1': 'CM2',
      'CM2': '6ème',
      'PS': 'MS',
      'MS': 'GS',
      'GS': 'CP',
    };

    return levelMap[currentLevel] || null;
  }

  async previewMigration(options: MigrationOptionsDto): Promise<any> {
    this.logger.log(`Previewing migration from ${options.currentYear} to ${options.newYear}`);

    const currentClasses = await this.classRepository.find({
      where: { academicYear: options.currentYear, isActive: true },
    });

    const studentsToMigrate = await this.studentRepository.count({
      where: { class: { academicYear: options.currentYear } },
    });

    const gradesToArchive = await this.gradesRepository.count({
      where: { academicYear: options.currentYear },
    });

    return {
      currentClasses: currentClasses.length,
      studentsToMigrate,
      gradesToArchive,
      estimatedClassesToCreate: currentClasses.filter(c => this.getNextLevel(c.level) !== null).length,
      levelTransitions: currentClasses.map(c => ({
        from: `${c.level} (${options.currentYear})`,
        to: `${this.getNextLevel(c.level)} (${options.newYear})`,
      })),
    };
  }
}
