import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade, Trimester } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradesDto } from './dto/query-grades.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    private activityLogService: ActivityLogService,
  ) { }

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
    const savedGrade = await this.gradesRepository.save(grade);

    // Log activity
    try {
      await this.activityLogService.create({
        action: 'Création de note',
        category: 'grades',
        details: `Note créé pour student ID: ${createGradeDto.studentId}, Matière ID: ${createGradeDto.subjectId}`,
        student_id: createGradeDto.studentId,
      });
    } catch (e) {
      console.warn('Failed to log grade creation:', e);
    }

    return savedGrade;
  }

  async createBulk(createGradeDtos: CreateGradeDto[]): Promise<Grade[]> {
    const grades = this.gradesRepository.create(createGradeDtos);
    const savedGrades = await this.gradesRepository.save(grades);

    // Log activity
    try {
      await this.activityLogService.create({
        action: 'Saisie de notes en masse',
        category: 'grades',
        details: `${createGradeDtos.length} notes enregistrées`,
      });
    } catch (e) {
      console.warn('Failed to log bulk grade creation:', e);
    }

    return savedGrades;
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

  async getGradesByClass(classId: string, trimester?: string, subjectId?: string, academicYear?: string) {
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher')
      .where('student.class_id = :classId', { classId });

    if (trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester });
    }

    if (subjectId) {
      query.andWhere('grade.subject_id = :subjectId', { subjectId });
    }

    if (academicYear) {
      query.andWhere('grade.academic_year = :academicYear', { academicYear });
    }

    query.orderBy('student.last_name', 'ASC')
      .addOrderBy('grade.evaluation_date', 'DESC');

    return query.getMany();
  }

  async getAverageByStudent(studentId: string, subjectId?: string, trimester?: string, academicYear?: string) {
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      // Calculate weighted sum: SUM( (value/max_value)*20 * coefficient )
      .select('SUM((grade.value / grade.max_value) * 20 * grade.coefficient)', 'weightedSum')
      // Calculate total coefficient: SUM(coefficient)
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

    const weightedSum = result.weightedSum ? parseFloat(result.weightedSum) : 0;
    const totalCoefficient = result.totalCoefficient ? parseFloat(result.totalCoefficient) : 0;

    return {
      average: totalCoefficient > 0 ? Number((weightedSum / totalCoefficient).toFixed(2)) : 0,
      totalCoefficient: totalCoefficient,
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
      average: result.average ? Number(parseFloat(result.average).toFixed(2)) : 0,
    };
  }

  async getReportCard(studentId: string, trimester: string, academicYear: string) {
    // 1. Get all grades for the student in this period, joined with subjects
    const grades = await this.gradesRepository.find({
      where: {
        studentId,
        trimester: trimester as Trimester,
        academicYear,
      },
      relations: ['subject'],
    });

    // 2. Group by subject
    const subjectStats = new Map<string, {
      subjectName: string;
      subjectCode: string;
      subjectCoefficient: number;
      grades: any[];
      totalWeightedScore: number;
      totalCoefficients: number;
    }>();

    for (const grade of grades) {
      if (!grade.subject) continue;

      const subjectId = grade.subject.id;
      if (!subjectStats.has(subjectId)) {
        subjectStats.set(subjectId, {
          subjectName: grade.subject.name,
          subjectCode: grade.subject.code,
          subjectCoefficient: Number(grade.subject.coefficient || 1),
          grades: [],
          totalWeightedScore: 0,
          totalCoefficients: 0,
        });
      }

      const stats = subjectStats.get(subjectId);
      const normalizedValue = (grade.value / grade.maxValue) * 20;
      const gradeCoefficient = Number(grade.coefficient || 1);

      stats.grades.push({
        id: grade.id,
        value: grade.value,
        maxValue: grade.maxValue,
        normalizedValue: Number(normalizedValue.toFixed(2)),
        coefficient: gradeCoefficient,
        type: grade.evaluationType,
        date: grade.evaluationDate,
      });

      stats.totalWeightedScore += normalizedValue * gradeCoefficient;
      stats.totalCoefficients += gradeCoefficient;
    }

    // 3. Calculate subject averages and general average
    const subjects = [];
    let totalGeneralWeightedScore = 0;
    let totalGeneralCoefficients = 0;

    for (const [subjectId, stats] of subjectStats.entries()) {
      const subjectAverage = stats.totalCoefficients > 0
        ? stats.totalWeightedScore / stats.totalCoefficients
        : 0;

      subjects.push({
        subjectId,
        name: stats.subjectName,
        code: stats.subjectCode,
        coefficient: stats.subjectCoefficient,
        average: Number(subjectAverage.toFixed(2)),
        grades: stats.grades,
      });

      totalGeneralWeightedScore += subjectAverage * stats.subjectCoefficient;
      totalGeneralCoefficients += stats.subjectCoefficient;
    }

    const generalAverage = totalGeneralCoefficients > 0
      ? totalGeneralWeightedScore / totalGeneralCoefficients
      : 0;

    return {
      studentId,
      trimester,
      academicYear,
      generalAverage: Number(generalAverage.toFixed(2)),
      subjects,
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
