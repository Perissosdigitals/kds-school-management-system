import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { User } from '../users/entities/user.entity';
import { SchoolClass } from '../classes/entities/class.entity';
import { TeacherClassAssignment } from '../classes/entities/teacher-class-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, User, SchoolClass, TeacherClassAssignment])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule { }
