import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsInt, Min, Max, IsOptional, IsNumber, Matches } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathématiques' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Subject code', example: 'MATH101' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @ApiPropertyOptional({ description: 'Subject description', example: 'Algèbre et géométrie' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Grade level', example: 'Sixième' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  gradeLevel: string;

  @ApiProperty({ description: 'Weekly hours', example: 4, minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  weeklyHours: number;

  @ApiProperty({ description: 'Coefficient for grade calculation', example: 2, minimum: 0.5, maximum: 5 })
  @IsNumber()
  @Min(0.5)
  @Max(5)
  coefficient: number;

  @ApiPropertyOptional({ description: 'Subject color for UI (hex format)', example: '#3b82f6' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be in hex format (e.g., #3b82f6)' })
  color?: string;
}
