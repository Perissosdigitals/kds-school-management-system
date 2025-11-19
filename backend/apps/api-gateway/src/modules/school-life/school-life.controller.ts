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
import { SchoolLifeService } from './school-life.service';
import { SchoolEvent } from './entities/school-event.entity';
import { CreateSchoolEventDto } from './dto/create-school-event.dto';
import { UpdateSchoolEventDto } from './dto/update-school-event.dto';

@ApiTags('school-life')
@ApiBearerAuth()
@Controller('school-life/events')
export class SchoolLifeController {
  constructor(private readonly schoolLifeService: SchoolLifeService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les événements scolaires' })
  @ApiResponse({ status: 200, description: 'Liste des événements', type: [SchoolEvent] })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filtrer par type d\'événement' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (YYYY-MM-DD)' })
  async findAll(@Query() query: any): Promise<SchoolEvent[]> {
    return this.schoolLifeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un événement par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'événement' })
  @ApiResponse({ status: 200, description: 'Événement trouvé', type: SchoolEvent })
  @ApiResponse({ status: 404, description: 'Événement non trouvé' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SchoolEvent> {
    return this.schoolLifeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel événement' })
  @ApiResponse({ status: 201, description: 'Événement créé avec succès', type: SchoolEvent })
  async create(@Body() createSchoolEventDto: CreateSchoolEventDto): Promise<SchoolEvent> {
    return this.schoolLifeService.create(createSchoolEventDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un événement' })
  @ApiParam({ name: 'id', description: 'ID de l\'événement' })
  @ApiResponse({ status: 200, description: 'Événement mis à jour', type: SchoolEvent })
  @ApiResponse({ status: 404, description: 'Événement non trouvé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSchoolEventDto: UpdateSchoolEventDto,
  ): Promise<SchoolEvent> {
    return this.schoolLifeService.update(id, updateSchoolEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un événement' })
  @ApiParam({ name: 'id', description: 'ID de l\'événement' })
  @ApiResponse({ status: 200, description: 'Événement supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.schoolLifeService.remove(id);
    return { message: 'Événement supprimé avec succès' };
  }
}
