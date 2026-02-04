import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableSlot } from './entities/timetable-slot.entity';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { UpdateTimetableSlotDto } from './dto/update-timetable-slot.dto';
import { QueryTimetableSlotsDto } from './dto/query-timetable-slots.dto';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableSlot)
    private timetableSlotsRepository: Repository<TimetableSlot>,
  ) { }

  async findAll(queryDto: QueryTimetableSlotsDto) {
    const { classId, teacherId, subjectId, dayOfWeek, academicYear, isActive, page = 1, limit = 100 } = queryDto;

    const query = this.timetableSlotsRepository
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.class', 'class')
      .leftJoinAndSelect('slot.teacher', 'teacher')
      .leftJoinAndSelect('slot.subject', 'subject');

    // Filters
    if (classId) {
      query.andWhere('slot.class_id = :classId', { classId });
    }

    if (teacherId) {
      query.andWhere('slot.teacher_id = :teacherId', { teacherId });
    }

    if (subjectId) {
      query.andWhere('slot.subject_id = :subjectId', { subjectId });
    }

    if (dayOfWeek) {
      query.andWhere('slot.day_of_week = :dayOfWeek', { dayOfWeek });
    }

    if (academicYear) {
      query.andWhere('slot.academic_year = :academicYear', { academicYear });
    }

    if (isActive !== undefined) {
      query.andWhere('slot.is_active = :isActive', { isActive: isActive === 'true' });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Order by day and time
    // REMOVED CAUSE OF CRASH: query.orderBy('slot.day_of_week', 'ASC').addOrderBy('slot.start_time', 'ASC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<TimetableSlot> {
    const slot = await this.timetableSlotsRepository.findOne({
      where: { id },
      relations: ['class', 'teacher', 'subject'],
    });

    if (!slot) {
      throw new NotFoundException(`Timetable slot with ID ${id} not found`);
    }

    return slot;
  }

  async create(createSlotDto: CreateTimetableSlotDto): Promise<TimetableSlot> {
    // Validate time range
    if (createSlotDto.startTime >= createSlotDto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for conflicts
    await this.checkConflicts(createSlotDto);

    const slot = this.timetableSlotsRepository.create(createSlotDto);

    // Generate Registration Number (TMS-YYYY-XXX)
    slot.registrationNumber = await this.generateRegistrationNumber(createSlotDto.academicYear);

    return this.timetableSlotsRepository.save(slot);
  }

  private async generateRegistrationNumber(academicYear: string): Promise<string> {
    // Extract year from academic year (e.g. "2024-2025" -> "2024")
    // If format is invalid, fallback to current year
    let year = new Date().getFullYear().toString();
    if (academicYear && academicYear.includes('-')) {
      year = academicYear.split('-')[0];
    }

    const prefix = `TMS-${year}`;

    const lastSlot = await this.timetableSlotsRepository
      .createQueryBuilder('slot')
      .where('slot.registration_number LIKE :prefix', { prefix: `${prefix}-%` })
      .orderBy('slot.registration_number', 'DESC')
      .getOne();

    let nextNum = 1;
    if (lastSlot?.registrationNumber) {
      const parts = lastSlot.registrationNumber.split('-');
      if (parts.length === 3) {
        nextNum = parseInt(parts[2]) + 1;
      }
    }

    return `${prefix}-${nextNum.toString().padStart(3, '0')}`;
  }

  async update(id: string, updateSlotDto: UpdateTimetableSlotDto): Promise<TimetableSlot> {
    const slot = await this.findOne(id);

    // Validate time range if times are being updated
    if (updateSlotDto.startTime || updateSlotDto.endTime) {
      const startTime = updateSlotDto.startTime || slot.startTime;
      const endTime = updateSlotDto.endTime || slot.endTime;
      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    // Check for conflicts with updated data
    const updateData = { ...slot, ...updateSlotDto };
    await this.checkConflicts(updateData, id);

    Object.assign(slot, updateSlotDto);
    return this.timetableSlotsRepository.save(slot);
  }

  async updateStatus(id: string, isActive: boolean): Promise<TimetableSlot> {
    const slot = await this.findOne(id);
    slot.isActive = isActive;
    return this.timetableSlotsRepository.save(slot);
  }

  async remove(id: string): Promise<void> {
    const slot = await this.findOne(id);
    await this.timetableSlotsRepository.remove(slot);
  }

  async count(queryDto: QueryTimetableSlotsDto): Promise<number> {
    const { classId, teacherId, subjectId, dayOfWeek, academicYear, isActive } = queryDto;

    const query = this.timetableSlotsRepository.createQueryBuilder('slot');

    if (classId) {
      query.andWhere('slot.class_id = :classId', { classId });
    }

    if (teacherId) {
      query.andWhere('slot.teacher_id = :teacherId', { teacherId });
    }

    if (subjectId) {
      query.andWhere('slot.subject_id = :subjectId', { subjectId });
    }

    if (dayOfWeek) {
      query.andWhere('slot.day_of_week = :dayOfWeek', { dayOfWeek });
    }

    if (academicYear) {
      query.andWhere('slot.academic_year = :academicYear', { academicYear });
    }

    if (isActive !== undefined) {
      query.andWhere('slot.is_active = :isActive', { isActive: isActive === 'true' });
    }

    return query.getCount();
  }

  async getWeeklyScheduleByClass(classId: string, academicYear: string) {
    return this.timetableSlotsRepository.find({
      where: { classId, academicYear, isActive: true },
      relations: ['teacher', 'subject'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async getWeeklyScheduleByTeacher(teacherId: string, academicYear: string) {
    return this.timetableSlotsRepository.find({
      where: { teacherId, academicYear, isActive: true },
      relations: ['class', 'subject'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  private async checkConflicts(slotData: any, excludeId?: string): Promise<void> {
    const { classId, teacherId, dayOfWeek, startTime, endTime, academicYear } = slotData;

    // Check teacher conflicts
    const teacherConflictQuery = this.timetableSlotsRepository
      .createQueryBuilder('slot')
      .where('slot.teacher_id = :teacherId', { teacherId })
      .andWhere('slot.day_of_week = :dayOfWeek', { dayOfWeek })
      .andWhere('slot.academic_year = :academicYear', { academicYear })
      .andWhere('slot.is_active = :isActive', { isActive: true })
      .andWhere(
        '(slot.start_time < :endTime AND slot.end_time > :startTime)',
        { startTime, endTime }
      );

    if (excludeId) {
      teacherConflictQuery.andWhere('slot.id != :excludeId', { excludeId });
    }

    const teacherConflict = await teacherConflictQuery.getOne();
    if (teacherConflict) {
      throw new ConflictException(
        `Teacher has another class at this time on ${dayOfWeek} (${startTime}-${endTime})`
      );
    }

    // Check class conflicts
    const classConflictQuery = this.timetableSlotsRepository
      .createQueryBuilder('slot')
      .where('slot.class_id = :classId', { classId })
      .andWhere('slot.day_of_week = :dayOfWeek', { dayOfWeek })
      .andWhere('slot.academic_year = :academicYear', { academicYear })
      .andWhere('slot.is_active = :isActive', { isActive: true })
      .andWhere(
        '(slot.start_time < :endTime AND slot.end_time > :startTime)',
        { startTime, endTime }
      );

    if (excludeId) {
      classConflictQuery.andWhere('slot.id != :excludeId', { excludeId });
    }

    const classConflict = await classConflictQuery.getOne();
    if (classConflict) {
      throw new ConflictException(
        `Class already has another subject at this time on ${dayOfWeek} (${startTime}-${endTime})`
      );
    }
  }
}
