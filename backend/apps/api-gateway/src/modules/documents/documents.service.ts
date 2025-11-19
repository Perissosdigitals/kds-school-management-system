import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType, AccessLevel, EntityType } from './entities/document.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async findAll(query: QueryDocumentDto) {
    const { type, entityType, accessLevel, studentId, teacherId, entityId, isActive, page = 1, limit = 50 } = query;
    const where: any = {};

    if (type) where.type = type;
    if (entityType) where.entityType = entityType;
    if (accessLevel) where.accessLevel = accessLevel;
    if (studentId) where.studentId = studentId;
    if (teacherId) where.teacherId = teacherId;
    if (entityId) where.entityId = entityId;
    if (isActive !== undefined) where.isActive = isActive;

    const [documents, total] = await this.documentRepository.findAndCount({
      where,
      relations: ['student', 'teacher'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['student', 'teacher'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async create(createDocumentDto: CreateDocumentDto) {
    const document = this.documentRepository.create(createDocumentDto);
    return this.documentRepository.save(document);
  }

  async createBulk(createDocumentDtos: CreateDocumentDto[]) {
    const documents = this.documentRepository.create(createDocumentDtos);
    return this.documentRepository.save(documents);
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async updateStatus(id: string, isActive: boolean) {
    const document = await this.findOne(id);
    document.isActive = isActive;
    return this.documentRepository.save(document);
  }

  async incrementDownloadCount(id: string) {
    const document = await this.findOne(id);
    document.downloadCount += 1;
    return this.documentRepository.save(document);
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
    return { deleted: true, id };
  }

  async count(query: QueryDocumentDto) {
    const { type, entityType, accessLevel, studentId, teacherId, entityId, isActive } = query;
    const where: any = {};

    if (type) where.type = type;
    if (entityType) where.entityType = entityType;
    if (accessLevel) where.accessLevel = accessLevel;
    if (studentId) where.studentId = studentId;
    if (teacherId) where.teacherId = teacherId;
    if (entityId) where.entityId = entityId;
    if (isActive !== undefined) where.isActive = isActive;

    return this.documentRepository.count({ where });
  }

  async getStatsByType(entityType?: EntityType) {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .select('document.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(document.fileSize)', 'totalSize')
      .groupBy('document.type');

    if (entityType) {
      query.where('document.entityType = :entityType', { entityType });
    }

    const results = await query.getRawMany();

    return results.map((r) => ({
      type: r.type,
      count: parseInt(r.count),
      totalSize: parseInt(r.totalSize) || 0,
    }));
  }

  async getStatsByEntityType() {
    const results = await this.documentRepository
      .createQueryBuilder('document')
      .select('document.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(document.fileSize)', 'totalSize')
      .groupBy('document.entityType')
      .getRawMany();

    return results.map((r) => ({
      entityType: r.entityType,
      count: parseInt(r.count),
      totalSize: parseInt(r.totalSize) || 0,
    }));
  }

  async getExpiredDocuments() {
    const today = new Date();
    return this.documentRepository.find({
      where: {
        isActive: true,
      },
      relations: ['student', 'teacher'],
      order: { expiryDate: 'ASC' },
    }).then(docs => docs.filter(doc => doc.expiryDate && new Date(doc.expiryDate) < today));
  }

  async getExpiringDocuments(days: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.documentRepository.find({
      where: {
        isActive: true,
      },
      relations: ['student', 'teacher'],
      order: { expiryDate: 'ASC' },
    }).then(docs => docs.filter(doc => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(doc.expiryDate);
      return expiry > today && expiry <= futureDate;
    }));
  }

  async getStudentDocuments(studentId: string) {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.documentRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTeacherDocuments(teacherId: string) {
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    return this.documentRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTotalStorageUsed(entityType?: EntityType) {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .select('SUM(document.fileSize)', 'totalSize');

    if (entityType) {
      query.where('document.entityType = :entityType', { entityType });
    }

    const result = await query.getRawOne();
    return { totalSize: parseInt(result.totalSize) || 0 };
  }
}
