import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { EnrollmentResultDto } from './dto/enrollment-result.dto';

@ApiTags('Enrollment')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscrire un nouvel élève',
    description: `
      Workflow complet d'inscription d'un élève:
      1. Validation de la classe et de sa capacité
      2. Génération du numéro de matricule unique
      3. Création du dossier élève
      4. Affectation à la classe
      5. Initialisation des documents requis
      6. Génération des frais de scolarité
      7. Retour du dossier complet
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Élève inscrit avec succès',
    type: EnrollmentResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou classe pleine',
  })
  @ApiResponse({
    status: 404,
    description: 'Classe introuvable',
  })
  async enrollStudent(@Body() enrollDto: EnrollStudentDto): Promise<EnrollmentResultDto> {
    return this.enrollmentService.enrollStudent(enrollDto);
  }

  @Get('student/:id/profile')
  @ApiOperation({
    summary: 'Obtenir le dossier complet d\'un élève',
    description: 'Retourne toutes les informations de l\'élève: données personnelles, classe, enseignant, finances, documents',
  })
  @ApiParam({ name: 'id', description: 'ID de l\'élève (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Dossier complet de l\'élève',
  })
  @ApiResponse({
    status: 404,
    description: 'Élève introuvable',
  })
  async getStudentProfile(@Param('id') id: string) {
    return this.enrollmentService.getStudentFullProfile(id);
  }
}
