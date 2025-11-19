import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({
    description: 'Nom de la classe',
    example: '6ème A',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Niveau scolaire',
    example: '6ème',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  level: string;

  @ApiProperty({
    description: 'Année scolaire',
    example: '2024-2025',
  })
  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @ApiPropertyOptional({
    description: 'ID de l\'enseignant principal',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  mainTeacherId?: string;

  @ApiPropertyOptional({
    description: 'Numéro de salle',
    example: 'Salle 101',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  roomNumber?: string;

  @ApiPropertyOptional({
    description: 'Capacité maximale de la classe',
    example: 30,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  capacity?: number;
}
