import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SchoolClass } from '../../classes/entities/class.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from '../../subjects/entities/subject.entity';

export enum DayOfWeek {
  MONDAY = 'Lundi',
  TUESDAY = 'Mardi',
  WEDNESDAY = 'Mercredi',
  THURSDAY = 'Jeudi',
  FRIDAY = 'Vendredi',
  SATURDAY = 'Samedi'
}

@Entity('timetable_slots')
export class TimetableSlot {
  @ApiProperty({ description: 'Timetable slot unique identifier', example: 'uuid-v4' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Class ID', example: 'uuid-v4' })
  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ApiProperty({ description: 'Teacher ID', example: 'uuid-v4' })
  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @ApiProperty({ description: 'Subject ID', example: 'uuid-v4' })
  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @ApiProperty({ description: 'Day of week', enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @Column({ name: 'day_of_week', type: 'varchar', length: 20 })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Start time (HH:MM)', example: '08:00' })
  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime: string;

  @ApiProperty({ description: 'End time (HH:MM)', example: '09:00' })
  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime: string;

  @ApiPropertyOptional({ description: 'Room number', example: 'A101' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  room?: string;

  @ApiProperty({ description: 'Academic year', example: '2024-2025' })
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @ApiProperty({ description: 'Is slot active', example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SchoolClass, { eager: false })
  @JoinColumn({ name: 'class_id' })
  class?: SchoolClass;

  @ManyToOne(() => Teacher, { eager: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher?: Teacher;

  @ManyToOne(() => Subject, { eager: false })
  @JoinColumn({ name: 'subject_id' })
  subject?: Subject;
}
