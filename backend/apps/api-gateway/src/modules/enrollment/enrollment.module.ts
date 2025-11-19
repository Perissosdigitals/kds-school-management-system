import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { Student } from '../students/entities/student.entity';
import { SchoolClass } from '../classes/entities/class.entity';
import { Transaction } from '../finance/entities/transaction.entity';
import { Teacher } from '../teachers/entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      SchoolClass,
      Transaction,
      Teacher,
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
