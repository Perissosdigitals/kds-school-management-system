import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les articles d\'inventaire' })
  @ApiResponse({ status: 200, description: 'Liste des articles', type: [InventoryItem] })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrer par catégorie' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  async findAll(@Query() query: any): Promise<InventoryItem[]> {
    return this.inventoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un article par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'article' })
  @ApiResponse({ status: 200, description: 'Article trouvé', type: InventoryItem })
  @ApiResponse({ status: 404, description: 'Article non trouvé' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InventoryItem> {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel article' })
  @ApiResponse({ status: 201, description: 'Article créé avec succès', type: InventoryItem })
  async create(@Body() createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un article' })
  @ApiParam({ name: 'id', description: 'ID de l\'article' })
  @ApiResponse({ status: 200, description: 'Article mis à jour', type: InventoryItem })
  @ApiResponse({ status: 404, description: 'Article non trouvé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
  ): Promise<InventoryItem> {
    return this.inventoryService.update(id, updateInventoryItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un article' })
  @ApiParam({ name: 'id', description: 'ID de l\'article' })
  @ApiResponse({ status: 200, description: 'Article supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Article non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.inventoryService.remove(id);
    return { message: 'Article supprimé avec succès' };
  }
}
