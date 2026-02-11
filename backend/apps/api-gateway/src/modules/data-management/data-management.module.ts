import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataManagementController } from './data-management.controller';
import { DataManagementService } from './data-management.service';
import { ExportService } from './services/export.service';
import { ImportService } from './services/import.service';
import { BackupService } from './services/backup.service';
import { ValidationService } from './services/validation.service';
import { MigrationService } from './services/migration.service';
import { Grade } from '../grades/entities/grade.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Student } from '../students/entities/student.entity';
import { SchoolClass } from '../classes/entities/class.entity';
import { Teacher } from '../teachers/entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade, Attendance, Student, SchoolClass, Teacher]),
  ],
  controllers: [DataManagementController],
  providers: [
    DataManagementService,
    ExportService,
    ImportService,
    BackupService,
    ValidationService,
    MigrationService,
  ],
  exports: [ExportService, ImportService, BackupService, ValidationService, MigrationService],
})
export class DataManagementModule { }
