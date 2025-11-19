import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../../modules/auth/entities/user.entity';
import { Teacher } from '../../modules/teachers/entities/teacher.entity';
import { Student } from '../../modules/students/entities/student.entity';
import { SchoolClass } from '../../modules/classes/entities/class.entity';
import { Subject } from '../../modules/subjects/entities/subject.entity';
import { TimetableSlot } from '../../modules/timetable/entities/timetable-slot.entity';
import { Grade } from '../../modules/grades/entities/grade.entity';
import { Attendance } from '../../modules/attendance/entities/attendance.entity';
import { Transaction } from '../../modules/finance/entities/transaction.entity';
import { Document } from '../../modules/documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Teacher,
      Student,
      SchoolClass,
      Subject,
      TimetableSlot,
      Grade,
      Attendance,
      Transaction,
      Document,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
