import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('classes')
export class SchoolClass {
  @ApiProperty({ description: 'ID unique de la classe' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numéro d\'enregistrement unique (ex: CLS-2025-001)' })
  @Column({ name: 'registration_number', length: 20, unique: true, nullable: true })
  registrationNumber: string;

  @ApiProperty({ description: 'Nom de la classe', example: '6ème A' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: 'Niveau scolaire', example: '6ème' })
  @Column({ length: 50 })
  level: string;

  @ApiProperty({ description: 'Année scolaire', example: '2024-2025' })
  @Column({ name: 'academic_year', length: 20 })
  academicYear: string;

  @ApiPropertyOptional({ description: 'ID de l\'enseignant principal' })
  @Column({ name: 'main_teacher_id', type: 'uuid', nullable: true })
  mainTeacherId: string;

  @ApiPropertyOptional({ description: 'Numéro de salle' })
  @Column({ name: 'room_number', length: 50, nullable: true })
  roomNumber: string;

  @ApiProperty({ description: 'Capacité maximale de la classe', default: 30 })
  @Column({ default: 30 })
  capacity: number;

  @ApiProperty({ description: 'Statut actif de la classe', default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ enum: ['synced', 'pending', 'error'], default: 'synced' })
  @Column({ name: 'sync_status', type: 'varchar', length: 20, default: 'synced' })
  syncStatus: string;

  @ApiProperty({ enum: ['valid', 'pending', 'invalid'], default: 'valid' })
  @Column({ name: 'validation_state', type: 'varchar', length: 20, default: 'valid' })
  validationState: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ApiPropertyOptional({ type: () => Teacher, description: 'Enseignant principal' })
  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'main_teacher_id' })
  mainTeacher?: Teacher;

  @ApiPropertyOptional({ type: () => [Student], description: 'Élèves de la classe' })
  @OneToMany(() => Student, student => student.class)
  students?: Student[];
}
