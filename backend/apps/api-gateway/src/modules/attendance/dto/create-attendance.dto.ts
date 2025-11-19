import { IsUUID, IsEnum, IsDate, IsString, IsBoolean, IsOptional, Matches, MaxLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'Student ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Class ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiPropertyOptional({ description: 'Timetable Slot ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174003' })
  @IsOptional()
  @IsUUID()
  timetableSlotId?: string;

  @ApiProperty({ description: 'Attendance date (YYYY-MM-DD)', example: '2024-11-18' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Time student arrived (HH:MM format)', example: '08:35' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Arrival time must be in format HH:MM' })
  arrivalTime?: string;

  @ApiPropertyOptional({ description: 'Reason for absence or lateness', example: 'Rendez-vous médical' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Is absence justified with document', example: false })
  @IsOptional()
  @IsBoolean()
  isJustified?: boolean;

  @ApiPropertyOptional({ description: 'Document URL for justification' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  justificationDocument?: string;

  @ApiPropertyOptional({ description: 'Comments from teacher or administration' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ description: 'Recorded by user ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174004' })
  @IsUUID()
  @IsNotEmpty()
  recordedBy: string;
}
