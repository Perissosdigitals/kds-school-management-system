import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private dataSource: DataSource,
    private activityLogService: ActivityLogService,
  ) { }

  async findAll(queryDto: QueryAttendanceDto) {
    const {
      studentId,
      classId,
      timetableSlotId,
      date,
      period,
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

    if (period) {
      query.andWhere('attendance.period = :period', { period });
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
    console.log('🔵 [ATTENDANCE] createBulk called with', createAttendanceDtos.length, 'records');

    // Use a transaction to ensure all-or-nothing persistence
    return this.dataSource.manager.transaction(async (transactionalEntityManager) => {
      const results: Attendance[] = [];

      if (createAttendanceDtos.length > 0) {
        console.log('📝 [ATTENDANCE] First record sample payload:', {
          studentId: createAttendanceDtos[0].studentId,
          date: createAttendanceDtos[0].date,
          period: createAttendanceDtos[0].period,
          status: createAttendanceDtos[0].status
        });
      }

      for (const dto of createAttendanceDtos) {
        // Resolve effective period (period takes precedence, fallback to session, default to null)
        const effectivePeriod = dto.period || (dto as any).session || null;

        // Standardize status (normalize localized strings from root frontend services)
        const statusMap: { [key: string]: AttendanceStatus } = {
          'Présent': AttendanceStatus.PRESENT,
          'Absent': AttendanceStatus.ABSENT,
          'Retard': AttendanceStatus.LATE,
          'Absent excusé': AttendanceStatus.EXCUSED,
          'Excusé': AttendanceStatus.EXCUSED,
          'PRESENT': AttendanceStatus.PRESENT,
          'ABSENT': AttendanceStatus.ABSENT,
          'LATE': AttendanceStatus.LATE,
          'EXCUSED': AttendanceStatus.EXCUSED,
          'present': AttendanceStatus.PRESENT,
          'absent': AttendanceStatus.ABSENT,
          'late': AttendanceStatus.LATE,
          'excused': AttendanceStatus.EXCUSED,
        };

        const effectiveStatus = (statusMap[dto.status as string] || dto.status) as AttendanceStatus;

        const logMsg = `[${new Date().toISOString()}] Student: ${dto.studentId}, Period: ${effectivePeriod}, Status: ${effectiveStatus} (Raw: ${dto.status})\n`;
        try {
          fs.appendFileSync(path.join(process.cwd(), 'attendance-debug.log'), logMsg);
        } catch (e) { console.error('Failed to write log', e); }

        console.log(`🔍 [ATTENDANCE] Processing student ${dto.studentId}, period: ${effectivePeriod}, status: ${effectiveStatus} (Raw: ${dto.status}), date: ${dto.date}`);

        // Check availability using the transaction manager
        // We look for a record for this student/class/date.
        // We match if:
        // 1. The record has the SAME period as the incoming one.
        // 2. OR the record has NULL period (legacy data), which we will migrate.
        const query = transactionalEntityManager.createQueryBuilder(Attendance, 'attendance')
          .where('attendance.student_id = :studentId', { studentId: dto.studentId })
          .andWhere('attendance.class_id = :classId', { classId: dto.classId })
          .andWhere('attendance.date = :date', { date: dto.date });

        // Fetch all matching records for this day/student/class to behave intelligently
        const existingRecords = await query.getMany();

        try {
          fs.appendFileSync(path.join(process.cwd(), 'attendance-debug.log'), `   Existing records for this student/date: ${existingRecords.length}\n`);
          existingRecords.forEach(r => {
            fs.appendFileSync(path.join(process.cwd(), 'attendance-debug.log'), `   - ID: ${r.id}, Period: ${r.period}, Status: ${r.status}\n`);
          });
        } catch (e) { }

        // Find the best match to update
        let targetRecord = existingRecords.find(r => r.period === effectivePeriod);

        // If no exact match, look for a legacy record (period is null)
        if (!targetRecord) {
          targetRecord = existingRecords.find(r => r.period === null || r.period === undefined);
          if (targetRecord && effectivePeriod) {
            const msg = `⚠️ [ATTENDANCE] Migrating legacy record ${targetRecord.id} to period '${effectivePeriod}'\n`;
            console.log(msg);
            try { fs.appendFileSync(path.join(process.cwd(), 'attendance-debug.log'), msg); } catch { }
          }
        }

        if (targetRecord) {
          // Update existing record
          Object.assign(targetRecord, {
            ...dto,
            status: effectiveStatus,
            period: effectivePeriod // Ensure period is updated (migrates legacy records)
          });
          const updated = await transactionalEntityManager.save(targetRecord);
          results.push(updated);
          try { fs.appendFileSync(path.join(process.cwd(), 'attendance-debug.log'), `   -> UPDATED record ${targetRecord.id} with period ${effectivePeriod}\n`); } catch { }

        } else {
          // Create new record
          const newAttendance = transactionalEntityManager.create(Attendance, {
            ...dto,
            status: effectiveStatus,
            period: effectivePeriod
          } as any);
          const created = await transactionalEntityManager.save(newAttendance);
          results.push(created);
          try { fs.appendFileSync(path.join(process.cwd(), 'attendance-debug.log'), `   -> CREATED new record ${created.id} with period ${effectivePeriod}\n`); } catch { }
        }
      }
      const finalResults = await results;

      // Log activity
      try {
        await this.activityLogService.create({
          action: 'Prise d\'appel en masse',
          category: 'attendance',
          details: `${createAttendanceDtos.length} élèves marqués`,
          class_id: createAttendanceDtos.length > 0 ? createAttendanceDtos[0].classId : undefined,
        });
      } catch (e) {
        console.warn('Failed to log attendance activity:', e);
      }

      return finalResults;
    });
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async updateJustification(id: string, isJustified: boolean, reason?: string, justificationDocument?: string): Promise<Attendance> {
    const attendance = await this.findOne(id);
    attendance.isJustified = isJustified;
    if (reason) {
      attendance.reason = reason;
    }
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

  async getDailyAttendance(classId: string, date: string, period?: string) {
    console.log(`📥 [ATTENDANCE] getDailyAttendance for class ${classId} on ${date}, period: ${period}`);
    // Use QueryBuilder for precise date string comparison
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.timetableSlot', 'timetableSlot')
      .where('attendance.class_id = :classId', { classId })
      .andWhere('attendance.date = :date', { date }); // Direct string match

    if (period) {
      query.andWhere('attendance.period = :period', { period });
    }

    return query.orderBy('attendance.status', 'ASC').getMany();
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
