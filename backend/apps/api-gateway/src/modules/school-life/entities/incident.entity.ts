import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum IncidentSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SERIOUS = 'serious',
  VERY_SERIOUS = 'very_serious',
}

export enum IncidentStatus {
  REPORTED = 'reported',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum IncidentType {
  INCIDENT = 'incident',
  SANCTION = 'sanction',
  ENCOURAGEMENT = 'encouragement'
}

@Entity('school_incidents')
export class Incident {
  @ApiProperty({ description: 'Identifiant unique de l\'incident' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de l\'élève concerné' })
  @Column()
  student_id: string;

  @ApiProperty({ description: 'Date de l\'incident' })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({ description: 'Heure de l\'incident', required: false })
  @Column({ nullable: true })
  time: string;

  @ApiProperty({ description: 'Lieu de l\'incident', required: false })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ description: 'Description détaillée' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type d\'enregistrement', enum: IncidentType })
  @Column({ type: 'varchar', default: IncidentType.INCIDENT })
  type: IncidentType;

  @ApiProperty({ description: 'Gravité', enum: IncidentSeverity, required: false })
  @Column({ type: 'varchar', nullable: true })
  severity: IncidentSeverity;

  @ApiProperty({ description: 'ID de la personne ayant signalé' })
  @Column()
  reported_by: string;

  @ApiProperty({ description: 'Statut', enum: IncidentStatus })
  @Column({ type: 'varchar', default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @ApiProperty({ description: 'Suivi / Actions prises', required: false })
  @Column({ type: 'text', nullable: true })
  follow_up: string;

  @ApiProperty({ description: 'Parents notifiés ?' })
  @Column({ default: false })
  parent_notified: boolean;

  @ApiProperty({ description: 'Catégorie (ex: Retard, Bavardage, Violence)', required: false })
  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
