import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsUUID } from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
}

export class ExportFiltersDto {
  @ApiPropertyOptional({ description: 'Start date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by class ID' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Filter by student ID' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Filter by subject ID' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Filter by trimester' })
  @IsOptional()
  @IsString()
  trimester?: string;

  @ApiPropertyOptional({ description: 'Filter by academic year', example: '2024-2025' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Export format',
    enum: ExportFormat,
    default: ExportFormat.EXCEL,
  })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat;
}
