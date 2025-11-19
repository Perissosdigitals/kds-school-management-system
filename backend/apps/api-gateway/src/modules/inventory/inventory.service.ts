import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem, InventoryStatus } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  async findAll(query: any): Promise<InventoryItem[]> {
    const { category, status } = query;
    const queryBuilder = this.inventoryRepository.createQueryBuilder('inventory');

    if (category) {
      queryBuilder.andWhere('inventory.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('inventory.status = :status', { status });
    }

    queryBuilder.orderBy('inventory.name', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Article d'inventaire avec l'ID ${id} non trouvé`);
    }

    return item;
  }

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = this.inventoryRepository.create({
      name: createInventoryItemDto.name,
      category: createInventoryItemDto.category,
      quantity: createInventoryItemDto.quantity || 0,
      unit: createInventoryItemDto.unit,
      location: createInventoryItemDto.location,
      status: createInventoryItemDto.status || InventoryStatus.AVAILABLE,
      purchase_date: createInventoryItemDto.purchaseDate ? new Date(createInventoryItemDto.purchaseDate) : null,
      purchase_price: createInventoryItemDto.purchasePrice,
      condition: createInventoryItemDto.condition,
      notes: createInventoryItemDto.notes,
      created_by: createInventoryItemDto.createdBy,
    });

    return this.inventoryRepository.save(item);
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id);

    Object.assign(item, {
      name: updateInventoryItemDto.name || item.name,
      category: updateInventoryItemDto.category || item.category,
      quantity: updateInventoryItemDto.quantity !== undefined ? updateInventoryItemDto.quantity : item.quantity,
      unit: updateInventoryItemDto.unit !== undefined ? updateInventoryItemDto.unit : item.unit,
      location: updateInventoryItemDto.location !== undefined ? updateInventoryItemDto.location : item.location,
      status: updateInventoryItemDto.status || item.status,
      purchase_date: updateInventoryItemDto.purchaseDate ? new Date(updateInventoryItemDto.purchaseDate) : item.purchase_date,
      purchase_price: updateInventoryItemDto.purchasePrice !== undefined ? updateInventoryItemDto.purchasePrice : item.purchase_price,
      condition: updateInventoryItemDto.condition !== undefined ? updateInventoryItemDto.condition : item.condition,
      notes: updateInventoryItemDto.notes !== undefined ? updateInventoryItemDto.notes : item.notes,
    });

    return this.inventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.inventoryRepository.remove(item);
  }
}
