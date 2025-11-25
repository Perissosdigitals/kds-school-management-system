import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BackupOptionsDto {
  @ApiProperty({
    description: 'Name for the backup file',
    example: 'daily-backup',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Whether to compress the backup with gzip',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  compress?: boolean;
}
