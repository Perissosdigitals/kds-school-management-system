import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { IncidentSeverity, IncidentStatus, IncidentType } from '../entities/incident.entity';

export class CreateIncidentDto {
  @ApiProperty({ description: 'ID de l\'élève concerné' })
  @IsUUID()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({ description: 'Type d\'incident', enum: IncidentType })
  @IsEnum(IncidentType)
  @IsNotEmpty()
  type: IncidentType;

  @ApiProperty({ description: 'Sévérité', enum: IncidentSeverity })
  @IsEnum(IncidentSeverity)
  @IsNotEmpty()
  severity: IncidentSeverity;

  @ApiProperty({ description: 'Description détaillée' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Date de l\'incident (ISO string)' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Lieu de l\'incident', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'ID de la personne ayant signalé', required: false })
  @IsUUID()
  @IsOptional()
  reported_by?: string;

  @ApiProperty({ description: 'Statut', enum: IncidentStatus, default: IncidentStatus.REPORTED })
  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @ApiProperty({ description: 'Actions prises', required: false })
  @IsString()
  @IsOptional()
  actions_taken?: string;
}

export class UpdateIncidentDto {
  @ApiProperty({ description: 'Type d\'incident', enum: IncidentType, required: false })
  @IsEnum(IncidentType)
  @IsOptional()
  type?: IncidentType;

  @ApiProperty({ description: 'Sévérité', enum: IncidentSeverity, required: false })
  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @ApiProperty({ description: 'Description détaillée', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Date de l\'incident', required: false })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'Lieu', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Statut', enum: IncidentStatus, required: false })
  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @ApiProperty({ description: 'Actions prises', required: false })
  @IsString()
  @IsOptional()
  actions_taken?: string;
}
