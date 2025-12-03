import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import type { TeacherStatus } from '../entities/teacher.entity';

export class CreateTeacherDto {
  @ApiProperty({ example: 'TRAORÉ' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'Mamadou' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Mathématiques' })
  @IsString()
  @MaxLength(100)
  subject: string;

  @ApiProperty({ example: '+225 07 11 22 33 44' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'mamadou.traore@ksp.school' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiPropertyOptional({ example: 'Algèbre, Géométrie' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  specialization?: string;

  @ApiPropertyOptional({ example: '2023-09-01' })
  @IsOptional()
  @IsString()
  hireDate?: string;

  @ApiPropertyOptional({ example: 'Abidjan, Cocody' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Mme Traoré: 0707070707' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContact?: string;

  @ApiPropertyOptional({ example: 'Master en Mathématiques' })
  @IsOptional()
  @IsString()
  qualifications?: string;

  @ApiPropertyOptional({
    enum: ['Actif', 'Inactif'],
    example: 'Actif',
    default: 'Actif'
  })
  @IsOptional()
  @IsEnum(['Actif', 'Inactif'])
  status?: TeacherStatus;
}
