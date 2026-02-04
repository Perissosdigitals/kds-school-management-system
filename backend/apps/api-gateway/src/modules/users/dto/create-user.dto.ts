import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Email de l\'utilisateur', example: 'user@ksp.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Rôle de l\'utilisateur', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Prénom', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Nom', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Numéro de téléphone', required: false, example: '0601020304' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Statut actif', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
