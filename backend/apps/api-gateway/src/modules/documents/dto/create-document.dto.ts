import { IsEnum, IsNotEmpty, IsOptional, IsUUID, IsString, MaxLength, IsDate, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, AccessLevel, EntityType } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  title: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @IsEnum(EntityType)
  @IsNotEmpty()
  entityType: EntityType;

  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @IsUUID()
  @IsOptional()
  entityId?: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  mimeType: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  fileSize: number;

  @IsEnum(AccessLevel)
  @IsNotEmpty()
  accessLevel: AccessLevel;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsNotEmpty()
  uploadedBy: string;
}
