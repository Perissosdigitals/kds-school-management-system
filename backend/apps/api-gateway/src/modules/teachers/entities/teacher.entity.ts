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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { SchoolClass } from '../../classes/entities/class.entity';

export type TeacherStatus = 'Actif' | 'Inactif';

@Entity('teachers')
export class Teacher {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'ENS24001' })
  @Column({ name: 'registration_number', type: 'varchar', length: 20, unique: true, nullable: true })
  registrationNumber: string;

  @ApiProperty({ example: 'TRAORÉ' })
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ example: 'Mamadou' })
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ example: 'Mathématiques' })
  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @ApiProperty({ example: '+225 07 11 22 33 44' })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({ example: 'mamadou.traore@ksp.school' })
  @Column({ type: 'varchar', length: 150 })
  email: string;

  @ApiProperty({ example: 'Algèbre, Géométrie', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  specialization: string;

  @ApiProperty({ example: '2023-09-01', required: false })
  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate: Date;

  @ApiProperty({ example: 'Abidjan, Cocody', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @ApiProperty({ example: 'Mme Traoré: 0707070707', required: false })
  @Column({ name: 'emergency_contact', type: 'varchar', length: 255, nullable: true })
  emergencyContact: string;

  @ApiProperty({ example: 'Master en Mathématiques', required: false })
  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @ApiProperty({ enum: ['Actif', 'Inactif'], default: 'Actif' })
  @Column({ type: 'enum', enum: ['Actif', 'Inactif'], default: 'Actif' })
  status: TeacherStatus;

  @ApiProperty({ enum: ['synced', 'pending', 'error'], default: 'synced' })
  @Column({ name: 'sync_status', type: 'varchar', length: 20, default: 'synced' })
  syncStatus: string;

  @ApiProperty({ enum: ['valid', 'pending', 'invalid'], default: 'valid' })
  @Column({ name: 'validation_state', type: 'varchar', length: 20, default: 'valid' })
  validationState: string;

  // Relation optionnelle vers User pour authentification
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ApiPropertyOptional({ type: () => [SchoolClass] })
  @OneToMany(() => SchoolClass, schoolClass => schoolClass.mainTeacher)
  classes?: SchoolClass[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
