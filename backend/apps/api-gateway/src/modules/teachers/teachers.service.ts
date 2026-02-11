import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Teacher, TeacherStatus } from './entities/teacher.entity';
import { SchoolClass } from '../classes/entities/class.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeachersDto } from './dto/query-teachers.dto';
import { IdGenerator, EntityCode } from '../../common/utils/id-generator.util';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(SchoolClass)
    private readonly classRepository: Repository<SchoolClass>,
  ) { }

  /**
   * Génère un numéro d'inscription unique au format KSP-T-[YEAR]-[NUM]
   */
  private async generateRegistrationNumber(): Promise<string> {
    const yearCode = IdGenerator.getAcademicYearCode();

    return IdGenerator.generateNextId(
      this.teacherRepository,
      EntityCode.TEACHER,
      yearCode
    );
  }

  async findAll(query?: QueryTeachersDto): Promise<Teacher[]> {
    console.log(' TeachersService.findAll called with query:', query);
    const { subject, status, search, limit = 50, offset = 0 } = query || {};

    // Utilisation de find() standard si pas de recherche complexe, sinon QueryBuilder
    if (!search) {
      const where: any = {};
      if (subject) where.subject = subject;
      if (status) where.status = status;

      return this.teacherRepository.find({
        where,
        relations: ['classes', 'user', 'classAssignments', 'classAssignments.class'],
        order: { lastName: 'ASC' },
        take: limit,
        skip: offset,
      });
    }

    const queryBuilder = this.teacherRepository.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('teacher.classes', 'classes')
      .leftJoinAndSelect('teacher.classAssignments', 'classAssignments')
      .leftJoinAndSelect('classAssignments.class', 'class');

    if (subject) {
      queryBuilder.andWhere('teacher.subject = :subject', { subject });
    }

    if (status) {
      queryBuilder.andWhere('teacher.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(teacher.firstName) LIKE LOWER(:search) OR LOWER(teacher.lastName) LIKE LOWER(:search) OR LOWER(teacher.email) LIKE LOWER(:search) OR LOWER(teacher.registration_number) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('teacher.lastName', 'ASC')
      .take(limit)
      .skip(offset);

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['user', 'classes', 'classAssignments', 'classAssignments.class'],
    });

    if (!teacher) {
      throw new NotFoundException(`L'enseignant avec l'ID ${id} n'a pas été trouvé`);
    }

    return teacher;
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const { classIds, ...teacherData } = createTeacherDto;
    const registrationNumber = await this.generateRegistrationNumber();

    const teacher = this.teacherRepository.create({
      ...teacherData,
      registrationNumber,
      status: teacherData.status || 'Actif',
    });

    try {
      const savedTeacher = await this.teacherRepository.save(teacher);

      if (classIds && classIds.length > 0) {
        await this.assignClasses(savedTeacher.id, classIds);
      }

      return await this.findOne(savedTeacher.id);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la création de l'enseignant: ${error.message}`
      );
    }
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const { classIds, ...teacherData } = updateTeacherDto;
    const teacher = await this.findOne(id);
    Object.assign(teacher, teacherData);

    try {
      await this.teacherRepository.save(teacher);

      if (classIds) {
        await this.assignClasses(id, classIds);
      }

      return await this.findOne(id);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la mise à jour de l'enseignant: ${error.message}`
      );
    }
  }

  private async assignClasses(teacherId: string, classIds: string[]): Promise<void> {
    console.log(`Assigning classes ${classIds.join(', ')} to teacher ${teacherId}`);

    // 1. Transaction pour assurer l'intégrité des données
    await this.teacherRepository.manager.transaction(async transactionalEntityManager => {
      // 2. Supprimer les anciennes affectations de rôle pour cet enseignant
      await transactionalEntityManager.delete(TeacherClassAssignment, { teacherId });

      // 3. Détacher de la relation "main teacher" héritée
      await transactionalEntityManager.createQueryBuilder()
        .update(SchoolClass)
        .set({ mainTeacherId: null })
        .where("mainTeacherId = :teacherId", { teacherId })
        .execute();

      // 4. Créer les nouvelles affectations
      if (classIds.length > 0) {
        // Ajouter dans la table teacher_class_assignments
        const assignments = classIds.map(classId => {
          return transactionalEntityManager.create(TeacherClassAssignment, {
            teacherId,
            classId,
            role: 'other', // Par défaut
          });
        });
        await transactionalEntityManager.save(TeacherClassAssignment, assignments);

        // Mettre à jour mainTeacherId sur la première classe (pour compatibilité)
        // Note: C'est une simplification, idéalement on laisserait l'utilisateur choisir le rôle "main"
        await transactionalEntityManager.update(SchoolClass, classIds[0], {
          mainTeacherId: teacherId
        });
      }
    });
  }

  async updateStatus(id: string, status: TeacherStatus): Promise<Teacher> {
    const teacher = await this.findOne(id);
    teacher.status = status;
    return await this.teacherRepository.save(teacher);
  }

  async remove(id: string): Promise<void> {
    const teacher = await this.findOne(id);
    await this.teacherRepository.remove(teacher);
  }

  async count(query?: QueryTeachersDto): Promise<number> {
    const { subject, status, search } = query || {};

    const queryBuilder = this.teacherRepository.createQueryBuilder('teacher');

    if (subject) {
      queryBuilder.andWhere('teacher.subject = :subject', { subject });
    }

    if (status) {
      queryBuilder.andWhere('teacher.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(teacher.firstName) LIKE LOWER(:search) OR LOWER(teacher.lastName) LIKE LOWER(:search) OR LOWER(teacher.email) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    return queryBuilder.getCount();
  }

  async getStatsBySubject(): Promise<Array<{ subject: string; count: number }>> {
    return this.teacherRepository
      .createQueryBuilder('teacher')
      .select('teacher.subject', 'subject')
      .addSelect('COUNT(*)', 'count')
      .where('teacher.status = :status', { status: 'Actif' })
      .groupBy('teacher.subject')
      .orderBy('teacher.subject', 'ASC')
      .getRawMany();
  }

  async getStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
    return this.teacherRepository
      .createQueryBuilder('teacher')
      .select('teacher.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('teacher.status')
      .getRawMany();
  }
}
