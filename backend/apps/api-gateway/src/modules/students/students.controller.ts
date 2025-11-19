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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { Student, StudentStatus } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Récupérer tous les élèves',
    description: 'Récupère la liste complète des élèves avec possibilité de filtrer par niveau, statut ou recherche textuelle'
  })
  @ApiResponse({ status: 200, description: 'Liste des élèves récupérée avec succès', type: [Student] })
  @ApiQuery({ name: 'gradeLevel', required: false, description: 'Filtrer par niveau (CM2, CM1, etc.)' })
  @ApiQuery({ name: 'status', required: false, enum: ['Actif', 'Inactif', 'En attente'] })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche dans nom, prénom, numéro inscription' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async findAll(@Query() query: any) {
    return this.studentsService.findAll(query);
  }

  @Get('stats/count')
  @ApiOperation({ 
    summary: 'Compter les élèves',
    description: 'Retourne le nombre total d\'élèves avec filtres optionnels'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Nombre d\'élèves',
    schema: { type: 'object', properties: { count: { type: 'number' } } }
  })
  async count(@Query() query: any): Promise<{ count: number }> {
    const count = await this.studentsService.count(query);
    return { count };
  }

  @Get('stats/by-grade')
  @ApiOperation({ 
    summary: 'Statistiques par niveau',
    description: 'Retourne le nombre d\'élèves par niveau scolaire'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques par niveau',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gradeLevel: { type: 'string', example: 'CM2' },
          count: { type: 'number', example: 25 }
        }
      }
    }
  })
  async getStatsByGrade(): Promise<Array<{ gradeLevel: string; count: number }>> {
    return this.studentsService.getStatsByGrade();
  }

  @Get('stats/by-status')
  @ApiOperation({ 
    summary: 'Statistiques par statut',
    description: 'Retourne le nombre d\'élèves par statut (Actif, Inactif, En attente)'
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
          count: { type: 'number', example: 120 }
        }
      }
    }
  })
  async getStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
    return this.studentsService.getStatsByStatus();
  }

  @Get('registration/:registrationNumber')
  @ApiOperation({ 
    summary: 'Récupérer un élève par numéro d\'inscription',
    description: 'Récupère un élève en utilisant son numéro d\'inscription (ex: KDS24001)'
  })
  @ApiParam({ name: 'registrationNumber', example: 'KDS24001' })
  @ApiResponse({ status: 200, description: 'Élève trouvé', type: Student })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async findByRegistrationNumber(
    @Param('registrationNumber') registrationNumber: string
  ): Promise<Student> {
    return this.studentsService.findByRegistrationNumber(registrationNumber);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Récupérer un élève par ID',
    description: 'Récupère les détails complets d\'un élève spécifique'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'élève' })
  @ApiResponse({ status: 200, description: 'Élève trouvé', type: Student })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fondatrice', 'admin', 'directrice')
  @ApiOperation({ 
    summary: 'Créer un nouvel élève',
    description: 'Enregistre un nouvel élève dans le système. Le numéro d\'inscription est généré automatiquement.'
  })
  @ApiResponse({ status: 201, description: 'Élève créé avec succès', type: Student })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fondatrice', 'admin', 'directrice')
  @ApiOperation({ summary: 'Créer plusieurs élèves en masse' })
  @ApiResponse({ status: 201, description: 'Élèves créés avec succès' })
  async bulkCreate(@Body() students: CreateStudentDto[]) {
    return this.studentsService.bulkCreate(students);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fondatrice', 'admin', 'directrice')
  @ApiOperation({ 
    summary: 'Mettre à jour un élève',
    description: 'Met à jour les informations d\'un élève existant'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'élève' })
  @ApiResponse({ status: 200, description: 'Élève mis à jour avec succès', type: Student })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Mettre à jour le statut d\'un élève',
    description: 'Change le statut d\'un élève (Actif, Inactif, En attente)'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'élève' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès', type: Student })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: StudentStatus
  ) {
    return this.studentsService.updateStatus(id, status);
  }

  @Patch(':id/documents')
  @ApiOperation({ 
    summary: 'Mettre à jour les documents d\'un élève',
    description: 'Met à jour la liste des documents administratifs d\'un élève'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'élève' })
  @ApiResponse({ status: 200, description: 'Documents mis à jour avec succès', type: Student })
  async updateDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('documents') documents: any[]
  ) {
    return this.studentsService.updateDocuments(id, documents);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fondatrice', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Supprimer un élève',
    description: 'Supprime définitivement un élève du système'
  })
  @ApiParam({ name: 'id', description: 'UUID de l\'élève' })
  @ApiResponse({ status: 204, description: 'Élève supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.studentsService.remove(id);
  }
}
