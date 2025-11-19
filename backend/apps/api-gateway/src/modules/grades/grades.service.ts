import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradesDto } from './dto/query-grades.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
  ) {}

  async findAll(queryDto: QueryGradesDto) {
    const {
      studentId,
      subjectId,
      teacherId,
      evaluationType,
      trimester,
      academicYear,
      visibleToParents,
      page = 1,
      limit = 50,
    } = queryDto;

    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher');

    // Filters
    if (studentId) {
      query.andWhere('grade.student_id = :studentId', { studentId });
    }

    if (subjectId) {
      query.andWhere('grade.subject_id = :subjectId', { subjectId });
    }

    if (teacherId) {
      query.andWhere('grade.teacher_id = :teacherId', { teacherId });
    }

    if (evaluationType) {
      query.andWhere('grade.evaluation_type = :evaluationType', { evaluationType });
    }

    if (trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    if (visibleToParents !== undefined) {
      query.andWhere('grade.visible_to_parents = :visibleToParents', {
        visibleToParents: visibleToParents === 'true',
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Order by evaluation date desc
    query.orderBy('grade.evaluation_date', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradesRepository.findOne({
      where: { id },
      relations: ['student', 'subject', 'teacher'],
    });

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const grade = this.gradesRepository.create(createGradeDto);
    return this.gradesRepository.save(grade);
  }

  async createBulk(createGradeDtos: CreateGradeDto[]): Promise<Grade[]> {
    const grades = this.gradesRepository.create(createGradeDtos);
    return this.gradesRepository.save(grades);
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);
    Object.assign(grade, updateGradeDto);
    return this.gradesRepository.save(grade);
  }

  async updateVisibility(id: string, visibleToParents: boolean): Promise<Grade> {
    const grade = await this.findOne(id);
    grade.visibleToParents = visibleToParents;
    return this.gradesRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradesRepository.remove(grade);
  }

  async count(queryDto: QueryGradesDto): Promise<number> {
    const { studentId, subjectId, teacherId, evaluationType, trimester, academicYear, visibleToParents } =
      queryDto;

    const query = this.gradesRepository.createQueryBuilder('grade');

    if (studentId) {
      query.andWhere('grade.student_id = :studentId', { studentId });
    }

    if (subjectId) {
      query.andWhere('grade.subject_id = :subjectId', { subjectId });
    }

    if (teacherId) {
      query.andWhere('grade.teacher_id = :teacherId', { teacherId });
    }

    if (evaluationType) {
      query.andWhere('grade.evaluation_type = :evaluationType', { evaluationType });
    }

    if (trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    if (visibleToParents !== undefined) {
      query.andWhere('grade.visible_to_parents = :visibleToParents', {
        visibleToParents: visibleToParents === 'true',
      });
    }

    return query.getCount();
  }

  async getAverageByStudent(studentId: string, subjectId?: string, trimester?: string, academicYear?: string) {
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .select('AVG((grade.value / grade.max_value) * 20 * grade.coefficient)', 'average')
      .addSelect('SUM(grade.coefficient)', 'totalCoefficient')
      .where('grade.student_id = :studentId', { studentId });

    if (subjectId) {
      query.andWhere('grade.subject_id = :subjectId', { subjectId });
    }

    if (trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    const result = await query.getRawOne();
    
    return {
      average: result.average ? parseFloat(result.average) : 0,
      totalCoefficient: result.totalCoefficient ? parseFloat(result.totalCoefficient) : 0,
    };
  }

  async getAverageBySubject(subjectId: string, trimester?: string, academicYear?: string) {
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .select('AVG((grade.value / grade.max_value) * 20)', 'average')
      .where('grade.subject_id = :subjectId', { subjectId });

    if (trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    const result = await query.getRawOne();
    
    return {
      average: result.average ? parseFloat(result.average) : 0,
    };
  }

  async getTopStudents(limit: number = 10, subjectId?: string, trimester?: string, academicYear?: string) {
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .select('grade.student_id', 'studentId')
      .addSelect('student.first_name', 'firstName')
      .addSelect('student.last_name', 'lastName')
      .addSelect('AVG((grade.value / grade.max_value) * 20 * grade.coefficient) / AVG(grade.coefficient)', 'average')
      .groupBy('grade.student_id')
      .addGroupBy('student.first_name')
      .addGroupBy('student.last_name');

    if (subjectId) {
      query.andWhere('grade.subject_id = :subjectId', { subjectId });
    }

    if (trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    query.orderBy('average', 'DESC').limit(limit);

    return query.getRawMany();
  }

  async getGradeDistribution(subjectId?: string, trimester?: string, academicYear?: string) {
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .select(
        `CASE 
          WHEN (grade.value / grade.max_value) * 20 >= 16 THEN 'Excellent (16-20)'
          WHEN (grade.value / grade.max_value) * 20 >= 14 THEN 'Bien (14-16)'
          WHEN (grade.value / grade.max_value) * 20 >= 12 THEN 'Assez bien (12-14)'
          WHEN (grade.value / grade.max_value) * 20 >= 10 THEN 'Passable (10-12)'
          ELSE 'Insuffisant (<10)'
        END`,
        'range'
      )
      .addSelect('COUNT(*)', 'count');

    if (subjectId) {
      query.andWhere('grade.subject_id = :subjectId', { subjectId });
    }

    if (trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    query.groupBy('range').orderBy('range', 'ASC');

    return query.getRawMany();
  }

  async getStatsByEvaluationType(studentId?: string, subjectId?: string, academicYear?: string) {
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .select('grade.evaluation_type', 'evaluationType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG((grade.value / grade.max_value) * 20)', 'average');

    if (studentId) {
      query.andWhere('grade.student_id = :studentId', { studentId });
    }

    if (subjectId) {
      query.andWhere('grade.subject_id = :subjectId', { subjectId });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    query.groupBy('grade.evaluation_type');

    return query.getRawMany();
  }
}
