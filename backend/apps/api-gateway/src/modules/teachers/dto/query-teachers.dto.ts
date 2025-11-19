import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import type { TeacherStatus } from '../entities/teacher.entity';

export class QueryTeachersDto {
  @ApiPropertyOptional({ example: 'Mathématiques' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ enum: ['Actif', 'Inactif'] })
  @IsOptional()
  @IsEnum(['Actif', 'Inactif'])
  status?: TeacherStatus;

  @ApiPropertyOptional({ example: 'Traoré' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 50, default: 50 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
