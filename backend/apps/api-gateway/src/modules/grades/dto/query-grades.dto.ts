import { IsOptional, IsUUID, IsEnum, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EvaluationType, Trimester } from '../entities/grade.entity';

export class QueryGradesDto {
  @ApiPropertyOptional({ description: 'Filter by student ID (UUID)' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Filter by subject ID (UUID)' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Filter by teacher ID (UUID)' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Filter by evaluation type', enum: EvaluationType })
  @IsOptional()
  @IsEnum(EvaluationType)
  evaluationType?: EvaluationType;

  @ApiPropertyOptional({ description: 'Filter by trimester', enum: Trimester })
  @IsOptional()
  @IsEnum(Trimester)
  trimester?: Trimester;

  @ApiPropertyOptional({ description: 'Filter by academic year', example: '2024-2025' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Filter by visibility to parents', example: 'true' })
  @IsOptional()
  @IsIn(['true', 'false'])
  visibleToParents?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 50, default: 50 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
