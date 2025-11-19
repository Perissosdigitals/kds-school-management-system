import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsDateString, IsEnum, IsOptional, IsUUID, IsPhoneNumber } from 'class-validator';

export class EnrollStudentDto {
  // Informations de l'élève
  @ApiProperty({ example: 'KOUASSI' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: '2010-05-15' })
  @IsDateString()
  dob: string;

  @ApiProperty({ example: 'Masculin', enum: ['Masculin', 'Féminin'] })
  @IsEnum(['Masculin', 'Féminin'])
  gender: 'Masculin' | 'Féminin';

  @ApiProperty({ example: 'Ivoirienne' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: 'Abidjan' })
  @IsString()
  birthPlace: string;

  @ApiProperty({ example: 'Plateau, Abidjan' })
  @IsString()
  address: string;

  @ApiProperty({ example: '+225 07 12 34 56 78' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'jean.kouassi@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'CM2' })
  @IsString()
  gradeLevel: string;

  @ApiPropertyOptional({ example: 'École Primaire du Plateau' })
  @IsString()
  @IsOptional()
  previousSchool?: string;

  // Informations contact d'urgence
  @ApiProperty({ example: 'Marie KOUASSI' })
  @IsString()
  emergencyContactName: string;

  @ApiProperty({ example: '+225 05 43 21 98 76' })
  @IsString()
  emergencyContactPhone: string;

  @ApiPropertyOptional({ example: 'Aucune allergie' })
  @IsString()
  @IsOptional()
  medicalInfo?: string;

  // Informations d'inscription
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  classId: string;

  @ApiPropertyOptional({ example: '2024-2025' })
  @IsString()
  @IsOptional()
  academicYear?: string;

  @ApiPropertyOptional({ example: true, description: 'Générer automatiquement les frais de scolarité' })
  @IsOptional()
  generateFinancialRecords?: boolean;
}
