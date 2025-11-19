import { IsUUID, IsEnum, IsNumber, IsString, IsDate, IsOptional, IsBoolean, Min, Max, MaxLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvaluationType, Trimester } from '../entities/grade.entity';

export class CreateGradeDto {
  @ApiProperty({ description: 'Student ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Subject ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Teacher ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174003' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ description: 'Evaluation type', enum: EvaluationType, example: EvaluationType.EXAMEN })
  @IsEnum(EvaluationType)
  @IsNotEmpty()
  evaluationType: EvaluationType;

  @ApiProperty({ description: 'Grade value (0-20)', example: 15.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(20)
  @IsNotEmpty()
  value: number;

  @ApiPropertyOptional({ description: 'Maximum grade possible', example: 20, default: 20 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxValue?: number;

  @ApiProperty({ description: 'Trimester', enum: Trimester, example: Trimester.FIRST })
  @IsEnum(Trimester)
  @IsNotEmpty()
  trimester: Trimester;

  @ApiProperty({ description: 'Academic year', example: '2024-2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  academicYear: string;

  @ApiProperty({ description: 'Evaluation date (YYYY-MM-DD)', example: '2024-11-18' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  evaluationDate: Date;

  @ApiPropertyOptional({ description: 'Evaluation title', example: 'Devoir de Mathématiques - Géométrie' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Coefficient for this evaluation', example: 2 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0.5)
  @Max(5)
  coefficient?: number;

  @ApiPropertyOptional({ description: 'Comments from teacher', example: 'Très bon travail, continuez ainsi!' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'Is visible to parents', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  visibleToParents?: boolean;
}
