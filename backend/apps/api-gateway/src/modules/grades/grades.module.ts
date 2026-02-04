import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { GradeCalculationService } from './services/grade-calculation.service';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Teacher } from '../teachers/entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade, Student, Subject, Teacher]),
    ActivityLogModule
  ],
  controllers: [GradesController],
  providers: [GradesService, GradeCalculationService],
  exports: [GradesService, GradeCalculationService],
})
export class GradesModule { }
