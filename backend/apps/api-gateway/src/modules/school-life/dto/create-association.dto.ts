import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { AssociationStatus, AssociationType } from '../entities/association.entity';

export class CreateAssociationDto {
  @ApiProperty({ description: 'Nom de l\'association' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Type d\'association', enum: AssociationType })
  @IsEnum(AssociationType)
  @IsNotEmpty()
  type: AssociationType;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID du président', required: false })
  @IsUUID()
  @IsOptional()
  president_id?: string;

  @ApiProperty({ description: 'ID du conseiller', required: false })
  @IsUUID()
  @IsOptional()
  advisor_id?: string;

  @ApiProperty({ description: 'Statut', enum: AssociationStatus, default: AssociationStatus.ACTIVE })
  @IsEnum(AssociationStatus)
  @IsOptional()
  status?: AssociationStatus;

  @ApiProperty({ description: 'Budget initial', required: false })
  @IsNumber()
  @IsOptional()
  budget?: number;
}

export class UpdateAssociationDto {
  @ApiProperty({ description: 'Nom de l\'association', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Type d\'association', enum: AssociationType, required: false })
  @IsEnum(AssociationType)
  @IsOptional()
  type?: AssociationType;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID du président', required: false })
  @IsUUID()
  @IsOptional()
  president_id?: string;

  @ApiProperty({ description: 'ID du conseiller', required: false })
  @IsUUID()
  @IsOptional()
  advisor_id?: string;

  @ApiProperty({ description: 'Statut', enum: AssociationStatus, required: false })
  @IsEnum(AssociationStatus)
  @IsOptional()
  status?: AssociationStatus;

  @ApiProperty({ description: 'Budget', required: false })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiProperty({ description: 'Membres (JSON string)', required: false })
  @IsString()
  @IsOptional()
  members?: string;
}
