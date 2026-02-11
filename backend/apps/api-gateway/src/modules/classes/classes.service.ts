import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolClass } from './entities/class.entity';
import { TeacherClassAssignment } from './entities/teacher-class-assignment.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { IdGenerator, EntityCode } from '../../common/utils/id-generator.util';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(SchoolClass)
    private classesRepository: Repository<SchoolClass>,
    @InjectRepository(TeacherClassAssignment)
    private assignmentsRepository: Repository<TeacherClassAssignment>,
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
  ) { }

  async findAll(queryDto: QueryClassesDto): Promise<{ data: SchoolClass[]; total: number; page: number; limit: number }> {
    const { level, academicYear, mainTeacherId, isActive, search, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.classesRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.mainTeacher', 'teacher')
      .leftJoinAndSelect('class.students', 'student');

    // Filtres
    if (level) {
      queryBuilder.andWhere('class.level = :level', { level });
    }

    if (academicYear) {
      queryBuilder.andWhere('class.academicYear = :academicYear', { academicYear });
    }

    if (mainTeacherId) {
      queryBuilder.andWhere('class.mainTeacherId = :mainTeacherId', { mainTeacherId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('class.isActive = :isActive', { isActive: isActive === 'true' });
    }

    if (search) {
      queryBuilder.andWhere('(class.name ILIKE :search OR class.level ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Pagination
    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('class.level', 'ASC')
      .addOrderBy('class.name', 'ASC')
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<SchoolClass> {
    const schoolClass = await this.classesRepository.findOne({
      where: { id },
      relations: ['mainTeacher', 'students', 'teacherAssignments', 'teacherAssignments.teacher'],
    });

    if (!schoolClass) {
      throw new NotFoundException(`Classe avec l'ID ${id} non trouvée`);
    }

    return schoolClass;
  }

  async create(createClassDto: CreateClassDto): Promise<SchoolClass> {
    const registrationNumber = await this.generateRegistrationNumber();
    const schoolClass = this.classesRepository.create({
      ...createClassDto,
      registrationNumber,
    });
    return this.classesRepository.save(schoolClass);
  }

  private async generateRegistrationNumber(): Promise<string> {
    const yearCode = IdGenerator.getAcademicYearCode();

    return IdGenerator.generateNextId(
      this.classesRepository,
      EntityCode.CLASS,
      yearCode
    );
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<SchoolClass> {
    const schoolClass = await this.findOne(id);
    Object.assign(schoolClass, updateClassDto);
    return this.classesRepository.save(schoolClass);
  }

  async updateStatus(id: string, isActive: boolean): Promise<SchoolClass> {
    const schoolClass = await this.findOne(id);
    schoolClass.isActive = isActive;
    return this.classesRepository.save(schoolClass);
  }

  async remove(id: string): Promise<void> {
    const schoolClass = await this.findOne(id);
    await this.classesRepository.remove(schoolClass);
  }

  async count(queryDto: QueryClassesDto): Promise<number> {
    const { level, academicYear, mainTeacherId, isActive } = queryDto;
    const queryBuilder = this.classesRepository.createQueryBuilder('class');

    if (level) {
      queryBuilder.andWhere('class.level = :level', { level });
    }

    if (academicYear) {
      queryBuilder.andWhere('class.academicYear = :academicYear', { academicYear });
    }

    if (mainTeacherId) {
      queryBuilder.andWhere('class.mainTeacherId = :mainTeacherId', { mainTeacherId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('class.isActive = :isActive', { isActive: isActive === 'true' });
    }

    return queryBuilder.getCount();
  }

  async getStatsByLevel(): Promise<{ level: string; count: number }[]> {
    return this.classesRepository
      .createQueryBuilder('class')
      .select('class.level', 'level')
      .addSelect('COUNT(class.id)', 'count')
      .where('class.isActive = :isActive', { isActive: true })
      .groupBy('class.level')
      .orderBy('class.level', 'ASC')
      .getRawMany();
  }

  async getStatsByAcademicYear(): Promise<{ academicYear: string; count: number }[]> {
    return this.classesRepository
      .createQueryBuilder('class')
      .select('class.academicYear', 'academicYear')
      .addSelect('COUNT(class.id)', 'count')
      .groupBy('class.academicYear')
      .orderBy('class.academicYear', 'DESC')
      .getRawMany();
  }

  async getClassWithStudentCount(id: string): Promise<{ class: SchoolClass; studentCount: number }> {
    const schoolClass = await this.findOne(id);
    const studentCount = await this.classesRepository
      .createQueryBuilder('class')
      .leftJoin('class.students', 'student')
      .where('class.id = :id', { id })
      .andWhere('student.status = :status', { status: 'Actif' })
      .getCount();

    return { class: schoolClass, studentCount };
  }

  async getStudents(id: string): Promise<any[]> {
    const schoolClass = await this.classesRepository.findOne({
      where: { id },
      relations: ['students'],
    });

    if (!schoolClass) {
      throw new NotFoundException(`Classe avec l'ID ${id} non trouvée`);
    }

    return schoolClass.students || [];
  }

  // ========================================
  // TEACHER ASSIGNMENT METHODS
  // ========================================

  /**
   * Assign a teacher to a class with a specific role
   */
  async assignTeacher(classId: string, assignDto: AssignTeacherDto): Promise<TeacherClassAssignment> {
    // Verify class exists
    const schoolClass = await this.classesRepository.findOne({ where: { id: classId } });
    if (!schoolClass) {
      throw new NotFoundException(`Classe avec l'id ${classId} non trouvée`);
    }

    // Verify teacher exists
    const teacher = await this.teachersRepository.findOne({ where: { id: assignDto.teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Enseignant avec l'id ${assignDto.teacherId} non trouvé`);
    }

    // Check if this exact assignment already exists
    const existingAssignment = await this.assignmentsRepository.findOne({
      where: {
        classId,
        teacherId: assignDto.teacherId,
        role: assignDto.role,
      },
    });

    if (existingAssignment) {
      return existingAssignment; // Already assigned with this role
    }

    // Create new assignment
    const assignment = this.assignmentsRepository.create({
      classId,
      teacherId: assignDto.teacherId,
      role: assignDto.role,
    });

    return this.assignmentsRepository.save(assignment);
  }

  /**
   * Remove a teacher assignment from a class
   */
  async removeTeacherAssignment(classId: string, teacherId: string): Promise<void> {
    const result = await this.assignmentsRepository.delete({
      classId,
      teacherId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Affectation non trouvée pour l'enseignant ${teacherId} dans la classe ${classId}`);
    }
  }

  /**
   * Get all teacher assignments for a class
   */
  async getClassTeachers(classId: string): Promise<TeacherClassAssignment[]> {
    return this.assignmentsRepository.find({
      where: { classId },
      relations: ['teacher'],
      order: { role: 'ASC' },
    });
  }

  /**
   * Get all class assignments for a teacher
   */
  async getTeacherClasses(teacherId: string): Promise<TeacherClassAssignment[]> {
    return this.assignmentsRepository.find({
      where: { teacherId },
      relations: ['class'],
      order: { assignedAt: 'DESC' },
    });
  }
}
