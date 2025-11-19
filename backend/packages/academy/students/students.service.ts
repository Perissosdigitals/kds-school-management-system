import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto, UpdateStudentDto, QueryStudentsDto } from './students.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  /**
   * Génère un numéro d'inscription unique au format KDS + année + numéro séquentiel
   * Ex: KDS24001, KDS24002, etc.
   */
  private async generateRegistrationNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const prefix = `KDS${currentYear}`;

    // Trouver le dernier numéro d'inscription de l'année en cours
    const lastStudent = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.registrationNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('student.registrationNumber', 'DESC')
      .getOne();

    if (!lastStudent) {
      return `${prefix}001`;
    }

    // Extraire le numéro séquentiel et l'incrémenter
    const lastNumber = parseInt(lastStudent.registrationNumber.slice(-3), 10);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');

    return `${prefix}${nextNumber}`;
  }

  /**
   * Récupère tous les élèves avec filtres optionnels
   */
  async findAll(query: QueryStudentsDto): Promise<Student[]> {
    const { gradeLevel, status, search, limit = 100, offset = 0 } = query;

    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    if (gradeLevel) {
      queryBuilder.andWhere('student.gradeLevel = :gradeLevel', { gradeLevel });
    }

    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(student.firstName) LIKE LOWER(:search) OR LOWER(student.lastName) LIKE LOWER(:search) OR LOWER(student.registrationNumber) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('student.registrationDate', 'DESC')
      .take(limit)
      .skip(offset);

    return queryBuilder.getMany();
  }

  /**
   * Récupère un élève par son ID
   */
  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException(`L'élève avec l'ID ${id} n'a pas été trouvé`);
    }

    return student;
  }

  /**
   * Récupère un élève par son numéro d'inscription
   */
  async findByRegistrationNumber(registrationNumber: string): Promise<Student> {
    const student = await this.studentRepository.findOne({ 
      where: { registrationNumber } 
    });

    if (!student) {
      throw new NotFoundException(
        `L'élève avec le numéro d'inscription ${registrationNumber} n'a pas été trouvé`
      );
    }

    return student;
  }

  /**
   * Crée un nouvel élève
   */
  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Générer un numéro d'inscription unique
    const registrationNumber = await this.generateRegistrationNumber();

    // Créer l'entité élève
    const student = this.studentRepository.create({
      ...createStudentDto,
      registrationNumber,
      registrationDate: new Date(),
      dob: new Date(createStudentDto.dob),
      status: createStudentDto.status || 'En attente',
      documents: createStudentDto.documents || [],
    });

    try {
      return await this.studentRepository.save(student);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la création de l'élève: ${error.message}`
      );
    }
  }

  /**
   * Met à jour un élève existant
   */
  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    // Mettre à jour les champs fournis
    Object.assign(student, {
      ...updateStudentDto,
      dob: updateStudentDto.dob ? new Date(updateStudentDto.dob) : student.dob,
    });

    try {
      return await this.studentRepository.save(student);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la mise à jour de l'élève: ${error.message}`
      );
    }
  }

  /**
   * Supprime un élève (soft delete recommandé en production)
   */
  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  /**
   * Met à jour le statut d'un élève
   */
  async updateStatus(id: string, status: 'Actif' | 'Inactif' | 'En attente'): Promise<Student> {
    const student = await this.findOne(id);
    student.status = status;
    return await this.studentRepository.save(student);
  }

  /**
   * Met à jour les documents d'un élève
   */
  async updateDocuments(id: string, documents: any[]): Promise<Student> {
    const student = await this.findOne(id);
    student.documents = documents;
    return await this.studentRepository.save(student);
  }

  /**
   * Compte le nombre total d'élèves avec filtres optionnels
   */
  async count(query: QueryStudentsDto): Promise<number> {
    const { gradeLevel, status, search } = query;

    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    if (gradeLevel) {
      queryBuilder.andWhere('student.gradeLevel = :gradeLevel', { gradeLevel });
    }

    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(student.firstName) LIKE LOWER(:search) OR LOWER(student.lastName) LIKE LOWER(:search) OR LOWER(student.registrationNumber) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    return queryBuilder.getCount();
  }

  /**
   * Récupère les statistiques des élèves par niveau
   */
  async getStatsByGrade(): Promise<Array<{ gradeLevel: string; count: number }>> {
    return this.studentRepository
      .createQueryBuilder('student')
      .select('student.gradeLevel', 'gradeLevel')
      .addSelect('COUNT(*)', 'count')
      .where('student.status = :status', { status: 'Actif' })
      .groupBy('student.gradeLevel')
      .orderBy('student.gradeLevel', 'ASC')
      .getRawMany();
  }

  /**
   * Récupère les statistiques des élèves par statut
   */
  async getStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
    return this.studentRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status')
      .getRawMany();
  }
}
