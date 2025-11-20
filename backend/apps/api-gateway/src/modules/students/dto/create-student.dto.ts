import {
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Gender, StudentStatus, DocumentStatus, DocumentType, StudentDocument } from '../entities/student.entity';

export class DocumentHistoryLogDto {
  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  @IsString()
  timestamp: string;

  @ApiProperty({ example: 'admin@kds.school' })
  @IsString()
  user: string;

  @ApiProperty({ example: 'Document validé' })
  @IsString()
  action: string;
}

export class StudentDocumentDto {
  @ApiProperty({ 
    enum: ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'],
    example: 'Extrait de naissance'
  })
  @IsEnum(['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'])
  type: DocumentType;

  @ApiProperty({ 
    enum: ['Manquant', 'En attente', 'Validé', 'Rejeté'],
    example: 'Validé'
  })
  @IsEnum(['Manquant', 'En attente', 'Validé', 'Rejeté'])
  status: DocumentStatus;

  @ApiPropertyOptional({ example: 'data:application/pdf;base64,...' })
  @IsOptional()
  @IsString()
  fileData?: string;

  @ApiPropertyOptional({ example: 'extrait_naissance.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: '2025-01-15T10:30:00Z' })
  @IsOptional()
  @IsString()
  updatedAt?: string;

  @ApiPropertyOptional({ type: [DocumentHistoryLogDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentHistoryLogDto)
  history?: DocumentHistoryLogDto[];
}

export class CreateStudentDto {
  @ApiProperty({ example: 'KOUASSI' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: '2010-05-15' })
  @IsDateString()
  dob: string;

  @ApiProperty({ enum: ['Masculin', 'Féminin'], example: 'Masculin' })
  @IsEnum(['Masculin', 'Féminin'])
  gender: Gender;

  @ApiProperty({ example: 'Ivoirienne' })
  @IsString()
  @MaxLength(100)
  nationality: string;

  @ApiProperty({ example: 'Abidjan' })
  @IsString()
  @MaxLength(200)
  birthPlace: string;

  @ApiProperty({ example: 'Plateau, Abidjan' })
  @IsString()
  address: string;

  @ApiProperty({ example: '+225 07 12 34 56 78' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 'jean.kouassi@email.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({ example: 'CM2' })
  @IsString()
  @MaxLength(50)
  gradeLevel: string;

  @ApiPropertyOptional({ example: 'École Primaire du Plateau' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  previousSchool?: string;

  @ApiProperty({ example: 'Marie KOUASSI' })
  @IsString()
  @MaxLength(150)
  emergencyContactName: string;

  @ApiProperty({ example: '+225 05 43 21 98 76' })
  @IsString()
  @MaxLength(20)
  emergencyContactPhone: string;

  @ApiPropertyOptional({ example: 'Aucune allergie' })
  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @ApiPropertyOptional({ 
    enum: ['Actif', 'Inactif', 'En attente'], 
    example: 'En attente',
    default: 'En attente'
  })
  @IsOptional()
  @IsEnum(['Actif', 'Inactif', 'En attente'])
  status?: StudentStatus;

  @ApiPropertyOptional({ example: 'uuid-of-class' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ type: [StudentDocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentDocumentDto)
  documents?: StudentDocument[];
}
