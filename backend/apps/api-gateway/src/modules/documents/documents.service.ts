import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType, AccessLevel, EntityType } from './entities/document.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';

import { StorageService } from '../../common/services/storage.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    private storageService: StorageService,
  ) { }

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
    const registrationNumber = await this.generateRegistrationNumber();
    const document = this.documentRepository.create({
      ...createDocumentDto,
      registrationNumber,
    });
    return this.documentRepository.save(document);
  }

  async createBulk(createDocumentDtos: CreateDocumentDto[]) {
    const documents = [];
    for (const dto of createDocumentDtos) {
      const registrationNumber = await this.generateRegistrationNumber();
      documents.push(this.documentRepository.create({
        ...dto,
        registrationNumber,
      }));
    }
    return this.documentRepository.save(documents);
  }

  private async generateRegistrationNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString();
    const prefix = `DOC-${currentYear}-`;

    const lastDoc = await this.documentRepository
      .createQueryBuilder('document')
      .where('document.registration_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('document.registration_number', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastDoc?.registrationNumber) {
      const parts = lastDoc.registrationNumber.split('-');
      const lastNumber = parseInt(parts[parts.length - 1] || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
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
    if (document.filePath) {
      // The filePath in the DB is used as the storage key
      await this.storageService.deleteFile(document.filePath).catch(err => {
        console.warn(`Failed to delete file ${document.filePath} from storage:`, err.message);
      });
    }
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

    // Get documents from the documents table (source of truth)
    const documentsFromTable = await this.documentRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    // Get document IDs from student JSONB
    const documentsFromJsonb = student.documents || [];
    const jsonbDocIds = new Set(documentsFromJsonb.map(d => (d as any).id).filter(Boolean));
    const tableDocIds = new Set(documentsFromTable.map(d => d.id));

    // Detect orphaned IDs (exist in JSONB but not in table)
    const orphanedIds = Array.from(jsonbDocIds).filter(id => !tableDocIds.has(id));

    if (orphanedIds.length > 0) {
      console.warn(`[DocumentSync] Found ${orphanedIds.length} orphaned document IDs for student ${studentId}:`, orphanedIds);
      console.warn(`[DocumentSync] These documents exist in student.documents JSONB but not in the documents table.`);
      console.warn(`[DocumentSync] Consider running the sync repair script or calling syncStudentDocuments(${studentId})`);
    }

    // Return only documents that exist in the table (source of truth)
    return documentsFromTable;
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

  async handleFileUpload(file: Express.Multer.File, studentId: string, type: string, title: string) {
    // 1. Generate correlation ID for atomic tracking
    const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const ext = file.originalname ? extname(file.originalname) : '';
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    const storageKey = `documents/${studentId}/${randomName}${ext}`;

    const queryRunner = this.documentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Initial DB Record (Status: Pending Sync)
      let document = await queryRunner.manager.findOne(Document, {
        where: { studentId, type: type as DocumentType }
      });

      const registrationNumber = document?.registrationNumber || await this.generateRegistrationNumber();

      if (document) {
        document.syncStatus = 'pending';
        document.correlationId = correlationId;
        document.filePath = storageKey;
        document.fileName = file.originalname;
        document.fileSize = file.size;
        document.mimeType = file.mimetype;
        document.isActive = true;
        document.title = title || document.title;
      } else {
        document = this.documentRepository.create({
          studentId,
          type: type as DocumentType,
          title: title || type,
          filePath: storageKey,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          registrationNumber,
          accessLevel: AccessLevel.INTERNAL,
          entityType: EntityType.STUDENT,
          uploadedBy: studentId,
          isActive: true,
          syncStatus: 'pending',
          correlationId: correlationId,
        });
      }

      const savedDoc = await queryRunner.manager.save(document);

      // 3. Upload to R2 (with correlation ID in metadata)
      const fileBuffer = file.buffer || (file.path ? require('fs').readFileSync(file.path) : null);
      if (!fileBuffer) {
        throw new BadRequestException('File content is empty');
      }

      await this.storageService.uploadFile(fileBuffer, storageKey, {
        contentType: file.mimetype,
        // Passing correlationId for future R2-side verification if needed
      });

      // 4. Finalize DB Record (Status: Synced)
      savedDoc.syncStatus = 'synced';
      await queryRunner.manager.save(savedDoc);

      // 5. Synchronize with Student JSONB column
      const student = await queryRunner.manager.findOne(Student, { where: { id: studentId } });
      if (student) {
        const studentDocs = student.documents || [];
        const docIndex = studentDocs.findIndex(d => d.type === type);

        const studentDocUpdate = {
          id: savedDoc.id,
          type: savedDoc.type as any,
          title: savedDoc.title,
          status: 'En attente' as any,
          fileName: savedDoc.fileName,
          fileData: `/api/v1/documents/${savedDoc.id}/view`,
          updatedAt: new Date().toISOString(),
          correlationId: correlationId
        };

        if (docIndex >= 0) {
          studentDocs[docIndex] = studentDocUpdate;
        } else {
          studentDocs.push(studentDocUpdate);
        }

        student.documents = studentDocs;
        await queryRunner.manager.save(student);
      }

      await queryRunner.commitTransaction();
      return savedDoc;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to handle file upload for student ${studentId}: ${err.message}`, err.stack);

      // Attempt to mark as error in a separate non-transactional way if possible 
      // or just throw let the caller handle UI error state
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Synchronize student's JSONB documents column with the documents table
   * Removes orphaned references and returns a report of changes
   */
  async syncStudentDocuments(studentId: string): Promise<{
    studentId: string;
    orphanedIds: string[];
    cleanedCount: number;
    remainingCount: number;
  }> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Get valid documents from the table
    const validDocuments = await this.documentRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    const validDocIds = new Set(validDocuments.map(d => d.id));

    // Get current JSONB documents
    const jsonbDocs = student.documents || [];
    const orphanedIds: string[] = [];

    // Filter out orphaned references
    const cleanedDocs = jsonbDocs.filter(doc => {
      const docId = (doc as any).id;
      if (!docId || !validDocIds.has(docId)) {
        if (docId) orphanedIds.push(docId);
        return false; // Remove this document from JSONB
      }
      return true; // Keep this document
    });

    // Update student JSONB if changes were made
    if (orphanedIds.length > 0) {
      student.documents = cleanedDocs;
      await this.studentRepository.save(student);

      console.log(`[DocumentSync] Cleaned ${orphanedIds.length} orphaned document references for student ${studentId}`);
      console.log(`[DocumentSync] Orphaned IDs removed:`, orphanedIds);
    }

    return {
      studentId,
      orphanedIds,
      cleanedCount: orphanedIds.length,
      remainingCount: cleanedDocs.length,
    };
  }

  async getFile(id: string): Promise<{ data: Buffer; contentType: string; fileName: string }> {
    const document = await this.findOne(id);
    if (!document || !document.filePath) {
      throw new NotFoundException('File not found');
    }
    const { data } = await this.storageService.getFile(document.filePath);
    return {
      data,
      contentType: document.mimeType || 'application/octet-stream',
      fileName: document.fileName || id
    };
  }
}
