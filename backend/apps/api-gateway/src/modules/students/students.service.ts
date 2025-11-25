import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Student, StudentStatus } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

interface QueryStudentsDto {
  gradeLevel?: string;
  status?: StudentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) { }

  /**
   * Génère un numéro d'inscription unique au format KDS + année + numéro séquentiel
   */
  private async generateRegistrationNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const prefix = `KSP${currentYear}`;

    const lastStudent = await this.studentsRepository
      .createQueryBuilder('student')
      .where('student.registration_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('student.registration_number', 'DESC')
      .getOne();

    if (!lastStudent) {
      return `${prefix}001`;
    }

    const lastNumber = parseInt(lastStudent.registrationNumber.slice(-3), 10);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    return `${prefix}${nextNumber}`;
  }

  async findAll(query?: QueryStudentsDto): Promise<Student[]> {
    const { gradeLevel, status, search, limit = 100, offset = 0 } = query || {};

    const queryBuilder = this.studentsRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('student.user', 'user');

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

  async findOne(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['class', 'user'],
    });

    if (!student) {
      throw new NotFoundException(`L'élève avec l'ID ${id} n'a pas été trouvé`);
    }

    return student;
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { registrationNumber },
      relations: ['class', 'user'],
    });

    if (!student) {
      throw new NotFoundException(
        `L'élève avec le numéro d'inscription ${registrationNumber} n'a pas été trouvé`
      );
    }

    return student;
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const registrationNumber = await this.generateRegistrationNumber();

    const student = this.studentsRepository.create({
      ...createStudentDto,
      registrationNumber,
      registrationDate: new Date(),
      dob: new Date(createStudentDto.dob),
      status: createStudentDto.status || 'En attente',
      documents: createStudentDto.documents || [],
    });

    try {
      return await this.studentsRepository.save(student);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la création de l'élève: ${error.message}`
      );
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    // Utilisation de update() au lieu de save() pour éviter les problèmes de relations
    // et garantir que le classId est bien mis à jour
    const updateData: any = {
      ...updateStudentDto,
    };

    if (updateStudentDto.dob) {
      updateData.dob = new Date(updateStudentDto.dob);
    }

    try {
      // Utilisation de createQueryBuilder pour forcer la mise à jour brute
      // C'est la méthode la plus fiable pour contourner les problèmes de mapping TypeORM
      const queryBuilder = this.studentsRepository.createQueryBuilder()
        .update(Student)
        .set(updateData)
        .where("id = :id", { id });

      await queryBuilder.execute();

      // On retourne l'élève mis à jour avec ses relations
      return this.findOne(id);
    } catch (error) {
      console.error('Error updating student:', error);
      throw new BadRequestException(
        `Erreur lors de la mise à jour de l'élève: ${error.message}`
      );
    }
  }

  async updateStatus(id: string, status: StudentStatus): Promise<Student> {
    const student = await this.findOne(id);
    student.status = status;
    return await this.studentsRepository.save(student);
  }

  async updateDocuments(id: string, documents: any[]): Promise<Student> {
    const student = await this.findOne(id);
    student.documents = documents;
    return await this.studentsRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
  }

  async bulkCreate(students: CreateStudentDto[]): Promise<Student[]> {
    const createdStudents: Student[] = [];

    for (const studentDto of students) {
      const student = await this.create(studentDto);
      createdStudents.push(student);
    }

    return createdStudents;
  }

  async count(query?: QueryStudentsDto): Promise<number> {
    const { gradeLevel, status, search } = query || {};

    const queryBuilder = this.studentsRepository.createQueryBuilder('student');

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

  async getStatsByGrade(): Promise<Array<{ gradeLevel: string; count: number }>> {
    return this.studentsRepository
      .createQueryBuilder('student')
      .select('student.gradeLevel', 'gradeLevel')
      .addSelect('COUNT(*)', 'count')
      .where('student.status = :status', { status: 'Actif' })
      .groupBy('student.gradeLevel')
      .orderBy('student.gradeLevel', 'ASC')
      .getRawMany();
  }

  async getStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
    return this.studentsRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status')
      .getRawMany();
  }
}
