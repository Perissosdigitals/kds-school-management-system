import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '../entities/timetable-slot.entity';

export class QueryTimetableSlotsDto {
  @ApiPropertyOptional({ description: 'Filter by class ID', example: 'uuid-v4' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Filter by teacher ID', example: 'uuid-v4' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Filter by subject ID', example: 'uuid-v4' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Filter by day of week', enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({ description: 'Filter by academic year', example: '2024-2025' })
  @IsOptional()
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Filter by active status', enum: ['true', 'false'], example: 'true' })
  @IsOptional()
  @IsIn(['true', 'false'])
  isActive?: 'true' | 'false';

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 100, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 100;
}
