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
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from '../../subjects/entities/subject.entity';

export enum EvaluationType {
  DEVOIR = 'Devoir',
  INTERROGATION = 'Interrogation',
  EXAMEN = 'Examen',
  CONTROLE_CONTINU = 'Contrôle continu',
  PROJET = 'Projet',
  ORAL = 'Oral',
}

export enum Trimester {
  FIRST = 'Premier trimestre',
  SECOND = 'Deuxième trimestre',
  THIRD = 'Troisième trimestre',
}

@Entity('grades')
export class Grade {
  @ApiProperty({ description: 'Grade ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Student ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ApiProperty({ description: 'Subject ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174002' })
  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @ApiProperty({ description: 'Teacher ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174003' })
  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @ApiProperty({ description: 'Evaluation type', enum: EvaluationType, example: EvaluationType.EXAMEN })
  @Column({ name: 'evaluation_type', type: 'varchar', length: 30 })
  evaluationType: EvaluationType;

  @ApiProperty({ description: 'Grade value (0-20)', example: 15.5 })
  @Column({ type: 'decimal', precision: 4, scale: 2 })
  value: number;

  @ApiProperty({ description: 'Maximum grade possible', example: 20, default: 20 })
  @Column({ name: 'max_value', type: 'decimal', precision: 4, scale: 2, default: 20 })
  maxValue: number;

  @ApiProperty({ description: 'Trimester', enum: Trimester, example: Trimester.FIRST })
  @Column({ type: 'varchar', length: 30 })
  trimester: Trimester;

  @ApiProperty({ description: 'Academic year', example: '2024-2025' })
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @ApiProperty({ description: 'Evaluation date', example: '2024-11-18' })
  @Column({ name: 'evaluation_date', type: 'date' })
  evaluationDate: Date;

  @ApiPropertyOptional({ description: 'Evaluation title', example: 'Devoir de Mathématiques - Géométrie' })
  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @ApiPropertyOptional({ description: 'Coefficient for this evaluation', example: 2 })
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 1, nullable: true })
  coefficient?: number;

  @ApiPropertyOptional({ description: 'Comments from teacher', example: 'Très bon travail, continuez ainsi!' })
  @Column({ type: 'text', nullable: true })
  comments?: string;

  @ApiProperty({ description: 'Is visible to parents', example: true, default: true })
  @Column({ name: 'visible_to_parents', type: 'boolean', default: true })
  visibleToParents: boolean;

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

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject?: Subject;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher?: Teacher;
}
