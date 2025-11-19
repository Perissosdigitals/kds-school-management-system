import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsOptional, IsArray } from 'class-validator';
import { EventType, EventStatus } from '../entities/school-event.entity';

export class CreateSchoolEventDto {
  @ApiProperty({ description: 'Titre de l\'événement', example: 'Journée Portes Ouvertes' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description détaillée', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type d\'événement', enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ description: 'Date de début', example: '2025-12-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Date de fin', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Lieu de l\'événement', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Liste des participants', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  participants?: string[];

  @ApiProperty({ description: 'Statut de l\'événement', enum: EventStatus, required: false })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiProperty({ description: 'ID du créateur', required: false })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
