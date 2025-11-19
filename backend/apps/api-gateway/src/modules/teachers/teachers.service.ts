import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Teacher, TeacherStatus } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeachersDto } from './dto/query-teachers.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async findAll(query?: QueryTeachersDto): Promise<Teacher[]> {
    const { subject, status, search, limit = 50, offset = 0 } = query || {};

    const queryBuilder = this.teacherRepository.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user');

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

    queryBuilder
      .orderBy('teacher.lastName', 'ASC')
      .take(limit)
      .skip(offset);

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException(`L'enseignant avec l'ID ${id} n'a pas été trouvé`);
    }

    return teacher;
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      status: createTeacherDto.status || 'Actif',
    });

    try {
      return await this.teacherRepository.save(teacher);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la création de l'enseignant: ${error.message}`
      );
    }
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);
    Object.assign(teacher, updateTeacherDto);

    try {
      return await this.teacherRepository.save(teacher);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la mise à jour de l'enseignant: ${error.message}`
      );
    }
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
