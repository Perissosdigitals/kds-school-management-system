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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { SchoolClass } from './entities/class.entity';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les classes avec filtres et pagination' })
  @ApiResponse({ status: 200, description: 'Liste des classes récupérée avec succès' })
  async findAll(@Query() queryDto: QueryClassesDto) {
    return this.classesService.findAll(queryDto);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Compter le nombre de classes avec filtres' })
  @ApiResponse({ status: 200, description: 'Nombre de classes' })
  async count(@Query() queryDto: QueryClassesDto) {
    const count = await this.classesService.count(queryDto);
    return { count };
  }

  @Get('stats/by-level')
  @ApiOperation({ summary: 'Statistiques des classes par niveau' })
  @ApiResponse({ status: 200, description: 'Statistiques par niveau récupérées' })
  async getStatsByLevel() {
    return this.classesService.getStatsByLevel();
  }

  @Get('stats/by-academic-year')
  @ApiOperation({ summary: 'Statistiques des classes par année scolaire' })
  @ApiResponse({ status: 200, description: 'Statistiques par année scolaire récupérées' })
  async getStatsByAcademicYear() {
    return this.classesService.getStatsByAcademicYear();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une classe par ID avec relations' })
  @ApiResponse({ status: 200, description: 'Classe récupérée avec succès', type: SchoolClass })
  @ApiResponse({ status: 404, description: 'Classe non trouvée' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.findOne(id);
  }

  @Get(':id/student-count')
  @ApiOperation({ summary: 'Récupérer une classe avec le nombre d\'élèves actifs' })
  @ApiResponse({ status: 200, description: 'Classe et nombre d\'élèves récupérés' })
  async getClassWithStudentCount(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.getClassWithStudentCount(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle classe' })
  @ApiResponse({ status: 201, description: 'Classe créée avec succès', type: SchoolClass })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une classe complète' })
  @ApiResponse({ status: 200, description: 'Classe mise à jour avec succès', type: SchoolClass })
  @ApiResponse({ status: 404, description: 'Classe non trouvée' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut actif d\'une classe' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.classesService.updateStatus(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une classe' })
  @ApiResponse({ status: 200, description: 'Classe supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Classe non trouvée' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.classesService.remove(id);
    return { message: 'Classe supprimée avec succès' };
  }
}
