import { IsOptional, IsUUID, IsEnum, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../entities/attendance.entity';

export class QueryAttendanceDto {
  @ApiPropertyOptional({ description: 'Filter by student ID (UUID)' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Filter by class ID (UUID)' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Filter by timetable slot ID (UUID)' })
  @IsOptional()
  @IsUUID()
  timetableSlotId?: string;

  @ApiPropertyOptional({ description: 'Filter by date (YYYY-MM-DD)', example: '2024-11-18' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: 'Filter from date (YYYY-MM-DD)', example: '2024-11-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter to date (YYYY-MM-DD)', example: '2024-11-30' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by attendance status', enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Filter by justification status', example: 'true' })
  @IsOptional()
  @IsIn(['true', 'false'])
  isJustified?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 100, default: 100 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 100;
}
