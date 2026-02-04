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
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Response } from 'express';

// Ensure upload directories exist
const photoDir = './uploads/students/photos';
if (!existsSync(photoDir)) {
  mkdirSync(photoDir, { recursive: true });
}
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
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les élèves',
    description: 'Récupère la liste complète des élèves avec possibilité de filtrer par niveau, statut ou recherche textuelle'
  })
  @ApiResponse({ status: 200, description: 'Liste des élèves récupérée avec succès', type: [Student] })
  @ApiQuery({ name: 'gradeLevel', required: false, description: 'Filtrer par niveau (CM2, CM1, etc.)' })
  @ApiQuery({ name: 'status', required: false, enum: ['Actif', 'Inactif', 'En attente'] })
  @ApiQuery({ name: 'classId', required: false, description: 'Filtrer par ID de classe (UUID)' })
  @ApiQuery({ name: 'gender', required: false, enum: ['Masculin', 'Féminin'] })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'teacherId', required: false, description: 'Filtrer par ID d\'enseignant' })
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

  @Get('stats/pending-docs')
  @ApiOperation({
    summary: 'Compter les documents en attente',
    description: 'Retourne le nombre d\'élèves ayant au moins un document en attente de validation'
  })
  @ApiResponse({
    status: 200,
    description: 'Nombre de documents en attente',
    schema: { type: 'object', properties: { count: { type: 'number' } } }
  })
  async getPendingDocsCount(): Promise<{ count: number }> {
    const count = await this.studentsService.countPendingDocuments();
    return { count };
  }

  @Get('stats/missing-docs')
  @ApiOperation({ summary: 'Compter les documents manquants' })
  async getMissingDocsCount(): Promise<{ count: number }> {
    const count = await this.studentsService.countMissingDocuments();
    return { count };
  }

  @Get('stats/rejected-docs')
  @ApiOperation({ summary: 'Compter les documents rejetés' })
  async getRejectedDocsCount(): Promise<{ count: number }> {
    const count = await this.studentsService.countRejectedDocuments();
    return { count };
  }

  @Get('registration/:registrationNumber')
  @ApiOperation({
    summary: 'Récupérer un élève par numéro d\'inscription',
    description: 'Récupère un élève en utilisant son numéro d\'inscription (ex: KSP24001)'
  })
  @ApiParam({ name: 'registrationNumber', example: 'KSP24001' })
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
  @Public()  // 🔓 Temporaire: Endpoint public pour développement
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
  @Public()  // 🔓 Temporaire: Endpoint public pour développement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fondatrice', 'admin', 'directrice')
  @ApiOperation({ summary: 'Créer plusieurs élèves en masse' })
  @ApiResponse({ status: 201, description: 'Élèves créés avec succès' })
  async bulkCreate(@Body() students: CreateStudentDto[]) {
    return this.studentsService.bulkCreate(students);
  }

  @Put(':id')
  @Public()  // 🔓 Temporaire: Endpoint public pour développement
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
  @Public()  // 🔓 Temporaire: Endpoint public pour développement
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

  @Post(':id/photo')
  @ApiOperation({ summary: 'Uploader la photo d\'un élève' })
  @UseInterceptors(FileInterceptor('photo', {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
        return cb(new BadRequestException('Seules les images (JPG, PNG, WEBP) sont autorisées !'), false);
      }
      cb(null, true);
    },
  }))
  async uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('La photo est requise');
    }
    return this.studentsService.handlePhotoUpload(id, file);
  }

  @Public()
  @Get('photo/:id')
  @ApiOperation({ summary: 'Servir la photo d\'un élève' })
  async getPhoto(@Param('id') id: string, @Res() res: Response) {
    try {
      const student = await this.studentsService.findOne(id);
      if (!student.photoUrl) {
        return res.status(404).json({ message: 'Photo non configurée pour cet élève' });
      }

      // If photoUrl is an external link, we might redirect or stream
      // But based on our new logic, photoUrl will be a proxy URL like /api/v1/storage/photos/...
      // Actually, let's make the photo endpoint serve it directly from storage if it's a key

      const storageKey = student.photoUrl.startsWith('/')
        ? student.photoUrl.split('/storage/')[1]
        : student.photoUrl;

      if (!storageKey) {
        return res.status(404).json({ message: 'Format de photo invalide' });
      }

      const { data, contentType } = await (this.studentsService as any).getPhotoFile(storageKey);

      res.setHeader('Content-Type', contentType);
      return res.send(data);
    } catch (error) {
      return res.status(404).json({ message: 'Photo non trouvée' });
    }
  }
}
