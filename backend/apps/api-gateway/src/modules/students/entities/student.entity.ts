import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { SchoolClass } from '../../classes/entities/class.entity';

export type Gender = 'Masculin' | 'Féminin';
export type StudentStatus = 'Actif' | 'Inactif' | 'En attente';
export type DocumentType = 'Extrait de naissance' | 'Carnet de vaccination' | 'Autorisation parentale' | 'Fiche scolaire';
export type DocumentStatus = 'Manquant' | 'En attente' | 'Validé' | 'Rejeté';

export interface DocumentHistoryLog {
  timestamp: string;
  user: string;
  action: string;
}

export interface StudentDocument {
  type: DocumentType;
  status: DocumentStatus;
  fileData?: string;
  fileName?: string;
  updatedAt?: string;
  rejectionReason?: string;
  history?: DocumentHistoryLog[];
}

@Entity('students')
export class Student {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'KSP24001' })
  @Column({ name: 'registration_number', type: 'varchar', length: 20, unique: true })
  registrationNumber: string;

  @ApiProperty()
  @Column({ name: 'registration_date', type: 'date' })
  registrationDate: Date;

  @ApiProperty({ example: 'KOUASSI' })
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ example: 'Jean' })
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty()
  @Column({ name: 'dob', type: 'date' })
  dob: Date;

  @ApiProperty({ enum: ['Masculin', 'Féminin'] })
  @Column({ type: 'enum', enum: ['Masculin', 'Féminin'] })
  gender: Gender;

  @ApiProperty({ example: 'Ivoirienne' })
  @Column({ type: 'varchar', length: 100 })
  nationality: string;

  @ApiProperty({ example: 'Abidjan' })
  @Column({ name: 'birth_place', type: 'varchar', length: 200 })
  birthPlace: string;

  @ApiProperty({ example: 'Plateau, Abidjan' })
  @Column({ type: 'text' })
  address: string;

  @ApiProperty({ example: '+225 07 12 34 56 78' })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({ example: 'jean.kouassi@email.com', required: false })
  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  @ApiProperty({ example: 'CM2' })
  @Column({ name: 'grade_level', type: 'varchar', length: 50 })
  gradeLevel: string;

  @ApiProperty({ example: 'École Primaire du Plateau', required: false })
  @Column({ name: 'previous_school', type: 'varchar', length: 200, nullable: true })
  previousSchool?: string;

  @ApiProperty({ example: 'Marie KOUASSI' })
  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 150 })
  emergencyContactName: string;

  @ApiProperty({ example: '+225 05 43 21 98 76' })
  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20 })
  emergencyContactPhone: string;

  @ApiProperty({ example: 'Aucune allergie', required: false })
  @Column({ name: 'medical_info', type: 'text', nullable: true })
  medicalInfo?: string;

  @ApiProperty({ enum: ['Actif', 'Inactif', 'En attente'], default: 'En attente' })
  @Column({ type: 'enum', enum: ['Actif', 'Inactif', 'En attente'], default: 'En attente' })
  status: StudentStatus;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @Column({ type: 'jsonb', default: [] })
  documents: StudentDocument[];

  @ApiProperty({ example: '/api/v1/students/photo/KSP24001.jpg', required: false })
  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl?: string;

  @ApiProperty({ enum: ['synced', 'pending', 'error'], default: 'synced' })
  @Column({ name: 'sync_status', type: 'varchar', length: 20, default: 'synced' })
  syncStatus: string;

  @ApiProperty({ enum: ['valid', 'pending', 'invalid'], default: 'valid' })
  @Column({ name: 'validation_state', type: 'varchar', length: 20, default: 'valid' })
  validationState: string;

  @ApiProperty({ description: 'Nombre total de documents' })
  @Column({ name: 'document_count', type: 'integer', default: 0 })
  documentCount: number;

  @ApiProperty({ description: 'Nombre de documents en attente' })
  @Column({ name: 'pending_docs', type: 'integer', default: 0 })
  pendingDocs: number;

  @ApiProperty({ description: 'Date de dernière synchronisation' })
  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  // Relations optionnelles (maintenues pour compatibilité)
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId?: string;

  @ManyToOne(() => SchoolClass, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  class?: SchoolClass;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
