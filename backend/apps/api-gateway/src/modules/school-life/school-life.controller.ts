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
import { Incident } from './entities/incident.entity';
import { Association } from './entities/association.entity';
import { CreateSchoolEventDto } from './dto/create-school-event.dto';
import { UpdateSchoolEventDto } from './dto/update-school-event.dto';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/create-incident.dto';
import { CreateAssociationDto, UpdateAssociationDto } from './dto/create-association.dto';

@ApiTags('school-life')
@ApiBearerAuth()
@Controller('school-life')
export class SchoolLifeController {
  constructor(private readonly schoolLifeService: SchoolLifeService) {}

  // --- EVENTS ---

  @Get('events')
  @ApiOperation({ summary: 'Récupérer tous les événements scolaires' })
  @ApiResponse({ status: 200, description: 'Liste des événements', type: [SchoolEvent] })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filtrer par type d\'événement' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (YYYY-MM-DD)' })
  async findAllEvents(@Query() query: any): Promise<SchoolEvent[]> {
    return this.schoolLifeService.findAll(query);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Récupérer un événement par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'événement' })
  @ApiResponse({ status: 200, description: 'Événement trouvé', type: SchoolEvent })
  @ApiResponse({ status: 404, description: 'Événement non trouvé' })
  async findOneEvent(@Param('id', ParseUUIDPipe) id: string): Promise<SchoolEvent> {
    return this.schoolLifeService.findOne(id);
  }

  @Post('events')
  @ApiOperation({ summary: 'Créer un nouvel événement' })
  @ApiResponse({ status: 201, description: 'Événement créé', type: SchoolEvent })
  async createEvent(@Body() createSchoolEventDto: CreateSchoolEventDto): Promise<SchoolEvent> {
    return this.schoolLifeService.create(createSchoolEventDto);
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Mettre à jour un événement' })
  @ApiParam({ name: 'id', description: 'ID de l\'événement' })
  @ApiResponse({ status: 200, description: 'Événement mis à jour', type: SchoolEvent })
  async updateEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSchoolEventDto: UpdateSchoolEventDto,
  ): Promise<SchoolEvent> {
    return this.schoolLifeService.update(id, updateSchoolEventDto);
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un événement' })
  @ApiParam({ name: 'id', description: 'ID de l\'événement' })
  @ApiResponse({ status: 204, description: 'Événement supprimé' })
  async removeEvent(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.schoolLifeService.remove(id);
  }

  // --- INCIDENTS ---

  @Get('incidents')
  @ApiOperation({ summary: 'Récupérer tous les incidents' })
  @ApiResponse({ status: 200, description: 'Liste des incidents', type: [Incident] })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrer par type' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filtrer par sévérité' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filtrer par élève' })
  async findAllIncidents(@Query() query: any): Promise<Incident[]> {
    return this.schoolLifeService.findAllIncidents(query);
  }

  @Get('incidents/:id')
  @ApiOperation({ summary: 'Récupérer un incident par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'incident' })
  @ApiResponse({ status: 200, description: 'Incident trouvé', type: Incident })
  @ApiResponse({ status: 404, description: 'Incident non trouvé' })
  async findOneIncident(@Param('id', ParseUUIDPipe) id: string): Promise<Incident> {
    return this.schoolLifeService.findOneIncident(id);
  }

  @Post('incidents')
  @ApiOperation({ summary: 'Créer un nouvel incident' })
  @ApiResponse({ status: 201, description: 'Incident créé', type: Incident })
  async createIncident(@Body() dto: CreateIncidentDto): Promise<Incident> {
    return this.schoolLifeService.createIncident(dto);
  }

  @Put('incidents/:id')
  @ApiOperation({ summary: 'Mettre à jour un incident' })
  @ApiParam({ name: 'id', description: 'ID de l\'incident' })
  @ApiResponse({ status: 200, description: 'Incident mis à jour', type: Incident })
  async updateIncident(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ): Promise<Incident> {
    return this.schoolLifeService.updateIncident(id, dto);
  }

  @Delete('incidents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un incident' })
  @ApiParam({ name: 'id', description: 'ID de l\'incident' })
  @ApiResponse({ status: 204, description: 'Incident supprimé' })
  async removeIncident(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.schoolLifeService.removeIncident(id);
  }

  // --- ASSOCIATIONS ---

  @Get('associations')
  @ApiOperation({ summary: 'Récupérer toutes les associations' })
  @ApiResponse({ status: 200, description: 'Liste des associations', type: [Association] })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrer par type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  async findAllAssociations(@Query() query: any): Promise<Association[]> {
    return this.schoolLifeService.findAllAssociations(query);
  }

  @Get('associations/:id')
  @ApiOperation({ summary: 'Récupérer une association par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'association' })
  @ApiResponse({ status: 200, description: 'Association trouvée', type: Association })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  async findOneAssociation(@Param('id', ParseUUIDPipe) id: string): Promise<Association> {
    return this.schoolLifeService.findOneAssociation(id);
  }

  @Post('associations')
  @ApiOperation({ summary: 'Créer une nouvelle association' })
  @ApiResponse({ status: 201, description: 'Association créée', type: Association })
  async createAssociation(@Body() dto: CreateAssociationDto): Promise<Association> {
    return this.schoolLifeService.createAssociation(dto);
  }

  @Put('associations/:id')
  @ApiOperation({ summary: 'Mettre à jour une association' })
  @ApiParam({ name: 'id', description: 'ID de l\'association' })
  @ApiResponse({ status: 200, description: 'Association mise à jour', type: Association })
  async updateAssociation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssociationDto,
  ): Promise<Association> {
    return this.schoolLifeService.updateAssociation(id, dto);
  }

  @Delete('associations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une association' })
  @ApiParam({ name: 'id', description: 'ID de l\'association' })
  @ApiResponse({ status: 204, description: 'Association supprimée' })
  async removeAssociation(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.schoolLifeService.removeAssociation(id);
  }
}
