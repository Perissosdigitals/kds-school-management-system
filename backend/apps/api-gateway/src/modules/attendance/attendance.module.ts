import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { Student } from '../students/entities/student.entity';
import { SchoolClass } from '../classes/entities/class.entity';
import { TimetableSlot } from '../timetable/entities/timetable-slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Student, SchoolClass, TimetableSlot]),
    ActivityLogModule
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule { }
