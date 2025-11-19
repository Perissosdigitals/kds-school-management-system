import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum InventoryStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  DAMAGED = 'damaged',
  UNDER_REPAIR = 'under_repair',
  RETIRED = 'retired',
}

@Entity('inventory')
export class InventoryItem {
  @ApiProperty({ description: 'Identifiant unique de l\'article' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nom de l\'article', example: 'Ordinateur Portable Dell' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Catégorie', example: 'Informatique' })
  @Column()
  category: string;

  @ApiProperty({ description: 'Quantité disponible', example: 25 })
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({ description: 'Unité de mesure', required: false, example: 'unité' })
  @Column({ nullable: true })
  unit?: string;

  @ApiProperty({ description: 'Emplacement', required: false })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Statut', enum: InventoryStatus })
  @Column({ type: 'varchar', default: InventoryStatus.AVAILABLE })
  status: InventoryStatus;

  @ApiProperty({ description: 'Date d\'achat', required: false })
  @Column({ type: 'date', nullable: true })
  purchase_date?: Date;

  @ApiProperty({ description: 'Prix d\'achat', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchase_price?: number;

  @ApiProperty({ description: 'État/Condition', required: false })
  @Column({ nullable: true })
  condition?: string;

  @ApiProperty({ description: 'Notes additionnelles', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'ID du créateur', required: false })
  @Column({ nullable: true })
  created_by?: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  @UpdateDateColumn()
  updated_at: Date;
}
