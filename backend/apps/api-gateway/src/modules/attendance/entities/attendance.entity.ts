import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Student } from '../../students/entities/student.entity';
import { SchoolClass } from '../../classes/entities/class.entity';
import { TimetableSlot } from '../../timetable/entities/timetable-slot.entity';

export enum AttendanceStatus {
  PRESENT = 'Présent',
  ABSENT = 'Absent',
  LATE = 'Retard',
  EXCUSED = 'Absent excusé',
}

@Entity('attendance')
export class Attendance {
  @ApiProperty({ description: 'Attendance ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Student ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ApiProperty({ description: 'Class ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174002' })
  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ApiPropertyOptional({ description: 'Timetable Slot ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174003' })
  @Column({ name: 'timetable_slot_id', type: 'uuid', nullable: true })
  timetableSlotId?: string;

  @ApiProperty({ description: 'Attendance date', example: '2024-11-18' })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @Column({ type: 'varchar', length: 20 })
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Time student arrived (for late status)', example: '08:35' })
  @Column({ name: 'arrival_time', type: 'varchar', length: 5, nullable: true })
  arrivalTime?: string;

  @ApiPropertyOptional({ description: 'Reason for absence or lateness', example: 'Rendez-vous médical' })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiPropertyOptional({ description: 'Is absence justified with document', example: true })
  @Column({ name: 'is_justified', type: 'boolean', default: false })
  isJustified: boolean;

  @ApiPropertyOptional({ description: 'Document URL for justification' })
  @Column({ name: 'justification_document', type: 'varchar', length: 500, nullable: true })
  justificationDocument?: string;

  @ApiPropertyOptional({ description: 'Comments from teacher or administration' })
  @Column({ type: 'text', nullable: true })
  comments?: string;

  @ApiProperty({ description: 'Recorded by user ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174004' })
  @Column({ name: 'recorded_by', type: 'uuid' })
  recordedBy: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student?: Student;

  @ManyToOne(() => SchoolClass)
  @JoinColumn({ name: 'class_id' })
  class?: SchoolClass;

  @ManyToOne(() => TimetableSlot, { nullable: true })
  @JoinColumn({ name: 'timetable_slot_id' })
  timetableSlot?: TimetableSlot;
}
