import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('subjects')
export class Subject {
  @ApiProperty({ description: 'Subject unique identifier', example: 'uuid-v4' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Subject name', example: 'Mathématiques' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Subject code', example: 'MATH101' })
  @ApiProperty({ description: 'Subject code', example: 'MATH101' })
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @ApiProperty({ description: 'Registration number', example: 'SUB-001' })
  @Column({ name: 'registration_number', type: 'varchar', length: 20, unique: true, nullable: true })
  registrationNumber: string;

  @ApiPropertyOptional({ description: 'Subject description', example: 'Algèbre et géométrie' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Grade level', example: 'Sixième' })
  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @ApiProperty({ description: 'Weekly hours', example: 4 })
  @Column({ name: 'weekly_hours', type: 'integer' })
  weeklyHours: number;

  @ApiProperty({ description: 'Coefficient for grade calculation', example: 2 })
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 1.0 })
  coefficient: number;

  @ApiPropertyOptional({ description: 'Subject color for UI', example: '#3b82f6' })
  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string;

  @ApiProperty({ description: 'Is subject active', example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
