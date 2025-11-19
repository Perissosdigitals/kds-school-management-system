import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEvent, EventType, EventStatus } from './entities/school-event.entity';
import { CreateSchoolEventDto } from './dto/create-school-event.dto';
import { UpdateSchoolEventDto } from './dto/update-school-event.dto';

@Injectable()
export class SchoolLifeService {
  constructor(
    @InjectRepository(SchoolEvent)
    private readonly schoolEventsRepository: Repository<SchoolEvent>,
  ) {}

  async findAll(query: any): Promise<SchoolEvent[]> {
    const { eventType, status, startDate, endDate } = query;
    const queryBuilder = this.schoolEventsRepository.createQueryBuilder('event');

    if (eventType) {
      queryBuilder.andWhere('event.event_type = :eventType', { eventType });
    }

    if (status) {
      queryBuilder.andWhere('event.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('event.start_date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('event.start_date <= :endDate', { endDate });
    }

    queryBuilder.orderBy('event.start_date', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<SchoolEvent> {
    const event = await this.schoolEventsRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé`);
    }

    return event;
  }

  async create(createSchoolEventDto: CreateSchoolEventDto): Promise<SchoolEvent> {
    const event = this.schoolEventsRepository.create({
      title: createSchoolEventDto.title,
      description: createSchoolEventDto.description,
      event_type: createSchoolEventDto.eventType,
      start_date: new Date(createSchoolEventDto.startDate),
      end_date: createSchoolEventDto.endDate ? new Date(createSchoolEventDto.endDate) : null,
      location: createSchoolEventDto.location,
      participants: createSchoolEventDto.participants ? JSON.stringify(createSchoolEventDto.participants) : null,
      status: createSchoolEventDto.status || EventStatus.SCHEDULED,
      created_by: createSchoolEventDto.createdBy,
    });

    return this.schoolEventsRepository.save(event);
  }

  async update(id: string, updateSchoolEventDto: UpdateSchoolEventDto): Promise<SchoolEvent> {
    const event = await this.findOne(id);

    Object.assign(event, {
      title: updateSchoolEventDto.title || event.title,
      description: updateSchoolEventDto.description !== undefined ? updateSchoolEventDto.description : event.description,
      event_type: updateSchoolEventDto.eventType || event.event_type,
      start_date: updateSchoolEventDto.startDate ? new Date(updateSchoolEventDto.startDate) : event.start_date,
      end_date: updateSchoolEventDto.endDate ? new Date(updateSchoolEventDto.endDate) : event.end_date,
      location: updateSchoolEventDto.location !== undefined ? updateSchoolEventDto.location : event.location,
      status: updateSchoolEventDto.status || event.status,
    });

    if (updateSchoolEventDto.participants) {
      event.participants = JSON.stringify(updateSchoolEventDto.participants);
    }

    return this.schoolEventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.schoolEventsRepository.remove(event);
  }
}
