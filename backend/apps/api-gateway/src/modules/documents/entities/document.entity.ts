import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum DocumentType {
  BIRTH_CERTIFICATE = 'Extrait de naissance',
  ID_CARD = "Carte d'identité",
  PROOF_OF_RESIDENCE = 'Justificatif de domicile',
  MEDICAL_CERTIFICATE = 'Certificat médical',
  VACCINATION_CARD = 'Carnet de vaccination',
  PARENTAL_AUTHORIZATION = 'Autorisation parentale',
  INSURANCE = 'Assurance',
  REPORT_CARD = 'Bulletin',
  SCHOOL_RECORD = 'Fiche scolaire',
  DIPLOMA = 'Diplôme',
  TRANSCRIPT = 'Relevé de notes',
  PHOTO = 'Photo',
  CONTRACT = 'Contrat',
  INVOICE = 'Facture',
  RECEIPT = 'Reçu',
  OTHER = 'Autre',
}

export enum AccessLevel {
  PUBLIC = 'Public',
  INTERNAL = 'Interne',
  RESTRICTED = 'Restreint',
  CONFIDENTIAL = 'Confidentiel',
}

export enum EntityType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  CLASS = 'class',
  SCHOOL = 'school',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'registration_number', length: 20, unique: true, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  type: DocumentType;

  @Column({ type: 'varchar', length: 20 })
  entityType: EntityType;

  @Column({ type: 'uuid', nullable: true })
  studentId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'uuid', nullable: true })
  teacherId: string;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', length: 100 })
  fileName: string;

  @Column({ type: 'varchar', length: 50 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'varchar', length: 20 })
  accessLevel: AccessLevel;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  uploadedBy: string;

  @Column({ type: 'integer', default: 0 })
  downloadCount: number;

  @ApiProperty({ enum: ['synced', 'pending', 'error'], default: 'synced' })
  @Column({ name: 'sync_status', type: 'varchar', length: 20, default: 'synced' })
  syncStatus: string;

  @ApiProperty({ enum: ['valid', 'pending', 'invalid'], default: 'pending' })
  @Column({ name: 'validation_state', type: 'varchar', length: 20, default: 'pending' })
  validationState: string;

  @ApiProperty({ description: 'ID de corrélation pour le lien atomique avec R2' })
  @Column({ name: 'correlation_id', type: 'varchar', length: 100, nullable: true })
  correlationId: string;

  @ApiProperty({ description: 'Date de dernière synchronisation' })
  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
