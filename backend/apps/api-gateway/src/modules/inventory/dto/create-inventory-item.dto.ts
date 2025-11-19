import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { InventoryStatus } from '../entities/inventory-item.entity';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Nom de l\'article', example: 'Ordinateur Portable Dell' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Catégorie', example: 'Informatique' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Quantité', example: 25, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Unité', example: 'unité', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Emplacement', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Statut', enum: InventoryStatus, required: false })
  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;

  @ApiProperty({ description: 'Date d\'achat', required: false, example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiProperty({ description: 'Prix d\'achat', required: false, example: 450000 })
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({ description: 'Condition', required: false })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'ID du créateur', required: false })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
