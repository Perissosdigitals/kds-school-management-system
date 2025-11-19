import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  OPEN_HOUSE = 'open_house',
  SPORTS = 'sports',
  CULTURAL = 'cultural',
  ACADEMIC = 'academic',
  MEETING = 'meeting',
  CEREMONY = 'ceremony',
  OTHER = 'other',
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('school_events')
export class SchoolEvent {
  @ApiProperty({ description: 'Identifiant unique de l\'événement' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Titre de l\'événement', example: 'Journée Portes Ouvertes' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Description détaillée', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Type d\'événement', enum: EventType })
  @Column({ type: 'varchar' })
  event_type: EventType;

  @ApiProperty({ description: 'Date de début', example: '2025-12-15' })
  @Column({ type: 'date' })
  start_date: Date;

  @ApiProperty({ description: 'Date de fin', required: false })
  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @ApiProperty({ description: 'Lieu de l\'événement', required: false })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Participants (JSON)', required: false })
  @Column({ type: 'text', nullable: true })
  participants?: string;

  @ApiProperty({ description: 'Statut de l\'événement', enum: EventStatus })
  @Column({ type: 'varchar', default: EventStatus.SCHEDULED })
  status: EventStatus;

  @ApiProperty({ description: 'ID du créateur', required: false })
  @Column({ nullable: true })
  created_by?: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  @UpdateDateColumn()
  updated_at: Date;
}
