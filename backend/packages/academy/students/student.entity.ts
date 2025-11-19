import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

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
  history?: DocumentHistoryLog[];
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  registrationNumber: string; // ex: KDS24001

  @Column({ type: 'date' })
  registrationDate: Date;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'enum', enum: ['Masculin', 'Féminin'] })
  gender: Gender;

  @Column({ type: 'varchar', length: 100 })
  nationality: string;

  @Column({ type: 'varchar', length: 200 })
  birthPlace: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50 })
  gradeLevel: string; // ex: CM2, CM1, 6ème, etc.

  @Column({ type: 'varchar', length: 200, nullable: true })
  previousSchool?: string;

  @Column({ type: 'varchar', length: 150 })
  emergencyContactName: string;

  @Column({ type: 'varchar', length: 20 })
  emergencyContactPhone: string;

  @Column({ type: 'text', nullable: true })
  medicalInfo?: string;

  @Column({ type: 'enum', enum: ['Actif', 'Inactif', 'En attente'], default: 'En attente' })
  status: StudentStatus;

  @Column({ type: 'jsonb', default: [] })
  documents: StudentDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
