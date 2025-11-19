import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsEnum, Matches, MaxLength, IsOptional } from 'class-validator';
import { DayOfWeek } from '../entities/timetable-slot.entity';

export class CreateTimetableSlotDto {
  @ApiProperty({ description: 'Class ID', example: 'uuid-v4' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Teacher ID', example: 'uuid-v4' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ description: 'Subject ID', example: 'uuid-v4' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Day of week', enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Start time (HH:MM)', example: '08:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in format HH:MM' })
  startTime: string;

  @ApiProperty({ description: 'End time (HH:MM)', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in format HH:MM' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Room number', example: 'A101' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  room?: string;

  @ApiProperty({ description: 'Academic year', example: '2024-2025' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  academicYear: string;
}
