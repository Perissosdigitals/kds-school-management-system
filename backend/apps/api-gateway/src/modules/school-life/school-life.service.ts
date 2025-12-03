import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEvent, EventType, EventStatus } from './entities/school-event.entity';
import { Incident, IncidentStatus } from './entities/incident.entity';
import { Association, AssociationStatus } from './entities/association.entity';
import { CreateSchoolEventDto } from './dto/create-school-event.dto';
import { UpdateSchoolEventDto } from './dto/update-school-event.dto';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/create-incident.dto';
import { CreateAssociationDto, UpdateAssociationDto } from './dto/create-association.dto';

@Injectable()
export class SchoolLifeService {
  constructor(
    @InjectRepository(SchoolEvent)
    private readonly schoolEventsRepository: Repository<SchoolEvent>,
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @InjectRepository(Association)
    private readonly associationRepository: Repository<Association>,
  ) {}

  // --- EVENTS ---

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

  // --- INCIDENTS ---

  async findAllIncidents(query: any): Promise<Incident[]> {
    const { type, severity, status, studentId } = query;
    const qb = this.incidentRepository.createQueryBuilder('incident');

    if (type) qb.andWhere('incident.type = :type', { type });
    if (severity) qb.andWhere('incident.severity = :severity', { severity });
    if (status) qb.andWhere('incident.status = :status', { status });
    if (studentId) qb.andWhere('incident.student_id = :studentId', { studentId });

    qb.orderBy('incident.date', 'DESC');
    return qb.getMany();
  }

  async findOneIncident(id: string): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async createIncident(dto: CreateIncidentDto): Promise<Incident> {
    const { actions_taken, ...rest } = dto;
    const incident = this.incidentRepository.create({
      ...rest,
      date: new Date(dto.date),
      follow_up: actions_taken,
    });
    return this.incidentRepository.save(incident);
  }

  async updateIncident(id: string, dto: UpdateIncidentDto): Promise<Incident> {
    const incident = await this.findOneIncident(id);
    
    if (dto.date) incident.date = new Date(dto.date);
    if (dto.type) incident.type = dto.type;
    if (dto.severity) incident.severity = dto.severity;
    if (dto.description) incident.description = dto.description;
    if (dto.location) incident.location = dto.location;
    if (dto.status) incident.status = dto.status;
    if (dto.actions_taken) incident.follow_up = dto.actions_taken;

    return this.incidentRepository.save(incident);
  }

  async removeIncident(id: string): Promise<void> {
    const incident = await this.findOneIncident(id);
    await this.incidentRepository.remove(incident);
  }

  // --- ASSOCIATIONS ---

  async findAllAssociations(query: any): Promise<Association[]> {
    const { type, status } = query;
    const qb = this.associationRepository.createQueryBuilder('assoc');

    if (type) qb.andWhere('assoc.type = :type', { type });
    if (status) qb.andWhere('assoc.status = :status', { status });

    qb.orderBy('assoc.name', 'ASC');
    return qb.getMany();
  }

  async findOneAssociation(id: string): Promise<Association> {
    const assoc = await this.associationRepository.findOne({ where: { id } });
    if (!assoc) throw new NotFoundException(`Association ${id} not found`);
    return assoc;
  }

  async createAssociation(dto: CreateAssociationDto): Promise<Association> {
    const assoc = this.associationRepository.create(dto);
    return this.associationRepository.save(assoc);
  }

  async updateAssociation(id: string, dto: UpdateAssociationDto): Promise<Association> {
    const assoc = await this.findOneAssociation(id);
    Object.assign(assoc, dto);
    return this.associationRepository.save(assoc);
  }

  async removeAssociation(id: string): Promise<void> {
    const assoc = await this.findOneAssociation(id);
    await this.associationRepository.remove(assoc);
  }
}
