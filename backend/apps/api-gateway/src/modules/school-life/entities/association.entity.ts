import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AssociationType {
  STUDENT_CLUB = 'student_club',
  PARENT_ASSOCIATION = 'parent_association',
  NGO_PARTNERSHIP = 'ngo_partnership',
  OTHER = 'other',
}

export enum AssociationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CREATING = 'creating',
}

@Entity('school_associations')
export class Association {
  @ApiProperty({ description: 'Identifiant unique de l\'association' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nom de l\'association' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Type d\'association', enum: AssociationType })
  @Column({ type: 'varchar' })
  type: AssociationType;

  @ApiProperty({ description: 'Description', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'ID du président (Élève/Parent)', required: false })
  @Column({ nullable: true })
  president_id: string;

  @ApiProperty({ description: 'Membres (JSON array of IDs)', required: false })
  @Column({ type: 'text', nullable: true })
  members: string;

  @ApiProperty({ description: 'ID du conseiller (Professeur)', required: false })
  @Column({ nullable: true })
  advisor_id: string;

  @ApiProperty({ description: 'Statut', enum: AssociationStatus })
  @Column({ type: 'varchar', default: AssociationStatus.ACTIVE })
  status: AssociationStatus;

  @ApiProperty({ description: 'Budget annuel', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  budget: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
