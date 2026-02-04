import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectsDto } from './dto/query-subjects.dto';
import { IdGenerator, EntityCode } from '../../common/utils/id-generator.util';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
  ) { }

  async findAll(queryDto: QuerySubjectsDto) {
    const { gradeLevel, isActive, search, page = 1, limit = 100 } = queryDto;

    const query = this.subjectsRepository.createQueryBuilder('subject');

    // Filters
    if (gradeLevel) {
      query.andWhere('subject.grade_level = :gradeLevel', { gradeLevel });
    }

    if (isActive !== undefined) {
      query.andWhere('subject.is_active = :isActive', { isActive: isActive === 'true' });
    }

    if (search) {
      query.andWhere(
        '(LOWER(subject.name) LIKE LOWER(:search) OR LOWER(subject.code) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Order by name
    query.orderBy('subject.name', 'ASC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async findByCode(code: string): Promise<Subject | null> {
    return this.subjectsRepository.findOne({ where: { code } });
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    // Check if code already exists
    const existingSubject = await this.findByCode(createSubjectDto.code);
    if (existingSubject) {
      throw new ConflictException(`Subject with code ${createSubjectDto.code} already exists`);
    }

    const subject = this.subjectsRepository.create(createSubjectDto);

    // Generate Registration Number (SUB-XXX)
    subject.registrationNumber = await this.generateRegistrationNumber();

    return this.subjectsRepository.save(subject);
  }

  private async generateRegistrationNumber(): Promise<string> {
    const yearCode = IdGenerator.getAcademicYearCode();

    return IdGenerator.generateNextId(
      this.subjectsRepository,
      EntityCode.SUBJECT,
      yearCode
    );
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.findOne(id);

    // Check if code is being updated and already exists
    if (updateSubjectDto.code && updateSubjectDto.code !== subject.code) {
      const existingSubject = await this.findByCode(updateSubjectDto.code);
      if (existingSubject) {
        throw new ConflictException(`Subject with code ${updateSubjectDto.code} already exists`);
      }
    }

    Object.assign(subject, updateSubjectDto);
    return this.subjectsRepository.save(subject);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Subject> {
    const subject = await this.findOne(id);
    subject.isActive = isActive;
    return this.subjectsRepository.save(subject);
  }

  async remove(id: string): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectsRepository.remove(subject);
  }

  async count(queryDto: QuerySubjectsDto): Promise<number> {
    const { gradeLevel, isActive, search } = queryDto;

    const query = this.subjectsRepository.createQueryBuilder('subject');

    if (gradeLevel) {
      query.andWhere('subject.grade_level = :gradeLevel', { gradeLevel });
    }

    if (isActive !== undefined) {
      query.andWhere('subject.is_active = :isActive', { isActive: isActive === 'true' });
    }

    if (search) {
      query.andWhere(
        '(LOWER(subject.name) LIKE LOWER(:search) OR LOWER(subject.code) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    return query.getCount();
  }

  async getStatsByGradeLevel() {
    return this.subjectsRepository
      .createQueryBuilder('subject')
      .select('subject.grade_level', 'gradeLevel')
      .addSelect('COUNT(*)', 'count')
      .where('subject.is_active = :isActive', { isActive: true })
      .groupBy('subject.grade_level')
      .orderBy('subject.grade_level', 'ASC')
      .getRawMany();
  }

  async getTotalWeeklyHours() {
    const result = await this.subjectsRepository
      .createQueryBuilder('subject')
      .select('SUM(subject.weekly_hours)', 'totalHours')
      .where('subject.is_active = :isActive', { isActive: true })
      .getRawOne();

    return { totalHours: parseInt(result?.totalHours || '0') };
  }
}
