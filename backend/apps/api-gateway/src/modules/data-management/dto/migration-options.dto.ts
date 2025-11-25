import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MigrationOptionsDto {
  @ApiProperty({
    description: 'Current academic year',
    example: '2024-2025',
  })
  @IsNotEmpty()
  @IsString()
  currentYear: string;

  @ApiProperty({
    description: 'New academic year',
    example: '2025-2026',
  })
  @IsNotEmpty()
  @IsString()
  newYear: string;

  @ApiProperty({
    description: 'Whether to copy student enrollments to new year',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  copyEnrollments?: boolean;

  @ApiProperty({
    description: 'Whether to archive old data',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  archiveOldData?: boolean;

  @ApiProperty({
    description: 'Whether to reset grades for the new year',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  resetGrades?: boolean;
}
