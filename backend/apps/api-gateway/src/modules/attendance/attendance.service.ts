import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async findAll(queryDto: QueryAttendanceDto) {
    const {
      studentId,
      classId,
      timetableSlotId,
      date,
      startDate,
      endDate,
      status,
      isJustified,
      page = 1,
      limit = 100,
    } = queryDto;

    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.class', 'class')
      .leftJoinAndSelect('attendance.timetableSlot', 'timetableSlot');

    // Filters
    if (studentId) {
      query.andWhere('attendance.student_id = :studentId', { studentId });
    }

    if (classId) {
      query.andWhere('attendance.class_id = :classId', { classId });
    }

    if (timetableSlotId) {
      query.andWhere('attendance.timetable_slot_id = :timetableSlotId', { timetableSlotId });
    }

    if (date) {
      query.andWhere('attendance.date = :date', { date });
    }

    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    } else if (startDate) {
      query.andWhere('attendance.date >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('attendance.date <= :endDate', { endDate });
    }

    if (status) {
      query.andWhere('attendance.status = :status', { status });
    }

    if (isJustified !== undefined) {
      query.andWhere('attendance.is_justified = :isJustified', { isJustified: isJustified === 'true' });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Order by date desc
    query.orderBy('attendance.date', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['student', 'class', 'timetableSlot'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async createBulk(createAttendanceDtos: CreateAttendanceDto[]): Promise<Attendance[]> {
    const attendances = this.attendanceRepository.create(createAttendanceDtos);
    return this.attendanceRepository.save(attendances);
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async updateJustification(id: string, isJustified: boolean, justificationDocument?: string): Promise<Attendance> {
    const attendance = await this.findOne(id);
    attendance.isJustified = isJustified;
    if (justificationDocument) {
      attendance.justificationDocument = justificationDocument;
    }
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async count(queryDto: QueryAttendanceDto): Promise<number> {
    const { studentId, classId, timetableSlotId, date, startDate, endDate, status, isJustified } = queryDto;

    const query = this.attendanceRepository.createQueryBuilder('attendance');

    if (studentId) {
      query.andWhere('attendance.student_id = :studentId', { studentId });
    }

    if (classId) {
      query.andWhere('attendance.class_id = :classId', { classId });
    }

    if (timetableSlotId) {
      query.andWhere('attendance.timetable_slot_id = :timetableSlotId', { timetableSlotId });
    }

    if (date) {
      query.andWhere('attendance.date = :date', { date });
    }

    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (status) {
      query.andWhere('attendance.status = :status', { status });
    }

    if (isJustified !== undefined) {
      query.andWhere('attendance.is_justified = :isJustified', { isJustified: isJustified === 'true' });
    }

    return query.getCount();
  }

  async getAbsenceRate(studentId?: string, classId?: string, startDate?: string, endDate?: string) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('COUNT(*)', 'total')
      .addSelect(
        `COUNT(CASE WHEN attendance.status IN ('${AttendanceStatus.ABSENT}', '${AttendanceStatus.EXCUSED}') THEN 1 END)`,
        'absences',
      );

    if (studentId) {
      query.andWhere('attendance.student_id = :studentId', { studentId });
    }

    if (classId) {
      query.andWhere('attendance.class_id = :classId', { classId });
    }

    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const result = await query.getRawOne();
    const total = parseInt(result.total) || 0;
    const absences = parseInt(result.absences) || 0;
    const rate = total > 0 ? (absences / total) * 100 : 0;

    return {
      total,
      absences,
      rate: parseFloat(rate.toFixed(2)),
    };
  }

  async getStatsByStatus(classId?: string, startDate?: string, endDate?: string) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count');

    if (classId) {
      query.andWhere('attendance.class_id = :classId', { classId });
    }

    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    query.groupBy('attendance.status');

    return query.getRawMany();
  }

  async getMostAbsentStudents(limit: number = 10, classId?: string, startDate?: string, endDate?: string) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .select('attendance.student_id', 'studentId')
      .addSelect('student.first_name', 'firstName')
      .addSelect('student.last_name', 'lastName')
      .addSelect('COUNT(*)', 'absenceCount')
      .where(`attendance.status IN (:...statuses)`, {
        statuses: [AttendanceStatus.ABSENT, AttendanceStatus.EXCUSED],
      })
      .groupBy('attendance.student_id')
      .addGroupBy('student.first_name')
      .addGroupBy('student.last_name');

    if (classId) {
      query.andWhere('attendance.class_id = :classId', { classId });
    }

    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    query.orderBy('absenceCount', 'DESC').limit(limit);

    return query.getRawMany();
  }

  async getDailyAttendance(classId: string, date: string) {
    return this.attendanceRepository.find({
      where: { classId, date: new Date(date) },
      relations: ['student', 'timetableSlot'],
      order: { status: 'ASC' },
    });
  }

  async getAttendancePattern(studentId: string, startDate?: string, endDate?: string) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('attendance.date', 'date')
      .addSelect('attendance.status', 'status')
      .where('attendance.student_id = :studentId', { studentId });

    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    query.orderBy('attendance.date', 'ASC');

    return query.getRawMany();
  }

  async getUnjustifiedAbsences(studentId?: string, classId?: string, startDate?: string, endDate?: string) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .where('attendance.status IN (:...statuses)', {
        statuses: [AttendanceStatus.ABSENT],
      })
      .andWhere('attendance.is_justified = :isJustified', { isJustified: false });

    if (studentId) {
      query.andWhere('attendance.student_id = :studentId', { studentId });
    }

    if (classId) {
      query.andWhere('attendance.class_id = :classId', { classId });
    }

    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    query.orderBy('attendance.date', 'DESC');

    return query.getMany();
  }
}
