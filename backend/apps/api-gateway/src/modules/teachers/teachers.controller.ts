import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { TeachersService } from './teachers.service';
import { Teacher, TeacherStatus } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeachersDto } from './dto/query-teachers.dto';

@ApiTags('teachers')
// @ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Récupérer tous les enseignants',
    description: 'Récupère la liste complète des enseignants avec filtres optionnels'
  })
  @ApiResponse({ status: 200, description: 'Liste des enseignants récupérée', type: [Teacher] })
  @ApiQuery({ name: 'subject', required: false, description: 'Filtrer par matière' })
  @ApiQuery({ name: 'status', required: false, enum: ['Actif', 'Inactif'] })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche dans nom, prénom, email' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async findAll(@Query() query: QueryTeachersDto): Promise<Teacher[]> {
    return this.teachersService.findAll(query);
  }

  @Get('stats/count')
  @ApiOperation({ 
    summary: 'Compter les enseignants',
    description: 'Retourne le nombre total d\'enseignants avec filtres optionnels'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Nombre d\'enseignants',
    schema: { type: 'object', properties: { count: { type: 'number' } } }
  })
  async count(@Query() query: QueryTeachersDto): Promise<{ count: number }> {
    const count = await this.teachersService.count(query);
    return { count };
  }

  @Get('stats/by-subject')
  @ApiOperation({ 
    summary: 'Statistiques par matière',
    description: 'Retourne le nombre d\'enseignants par matière'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques par matière',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subject: { type: 'string', example: 'Mathématiques' },
          count: { type: 'number', example: 5 }
        }
      }
    }
  })
  async getStatsBySubject(): Promise<Array<{ subject: string; count: number }>> {
    return this.teachersService.getStatsBySubject();
  }

  @Get('stats/by-status')
  @ApiOperation({ 
    summary: 'Statistiques par statut',
    description: 'Retourne le nombre d\'enseignants par statut'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques par statut',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'Actif' },
          count: { type: 'number', example: 12 }
        }
      }
    }
  })
  async getStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
    return this.teachersService.getStatsByStatus();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Récupérer un enseignant par ID',
    description: 'Récupère les détails complets d\'un enseignant spécifique'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'enseignant' })
  @ApiResponse({ status: 200, description: 'Enseignant trouvé', type: Teacher })
  @ApiResponse({ status: 404, description: 'Enseignant non trouvé' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Teacher> {
    return this.teachersService.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Créer un nouvel enseignant',
    description: 'Enregistre un nouvel enseignant dans le système'
  })
  @ApiResponse({ status: 201, description: 'Enseignant créé avec succès', type: Teacher })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    return this.teachersService.create(createTeacherDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Mettre à jour un enseignant',
    description: 'Met à jour les informations d\'un enseignant existant'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'enseignant' })
  @ApiResponse({ status: 200, description: 'Enseignant mis à jour', type: Teacher })
  @ApiResponse({ status: 404, description: 'Enseignant non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeacherDto: UpdateTeacherDto
  ): Promise<Teacher> {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Mettre à jour le statut d\'un enseignant',
    description: 'Change le statut d\'un enseignant (Actif, Inactif)'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'enseignant' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour', type: Teacher })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TeacherStatus
  ): Promise<Teacher> {
    return this.teachersService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Supprimer un enseignant',
    description: 'Supprime définitivement un enseignant du système'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'enseignant' })
  @ApiResponse({ status: 204, description: 'Enseignant supprimé' })
  @ApiResponse({ status: 404, description: 'Enseignant non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.teachersService.remove(id);
  }
}
