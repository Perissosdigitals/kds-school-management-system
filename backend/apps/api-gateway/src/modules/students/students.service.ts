import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Student, StudentStatus } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { IdGenerator, EntityCode } from '../../common/utils/id-generator.util';
import { StorageService } from '../../common/services/storage.service';
import { extname } from 'path';
import { ActivityLogService } from '../activity-log/activity-log.service';

interface QueryStudentsDto {
  gradeLevel?: string;
  status?: StudentStatus;
  search?: string;
  classId?: string;
  gender?: string;
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private storageService: StorageService,
    private activityLogService: ActivityLogService,
  ) { }

  /**
   * Génère un numéro d'inscription unique au format KSP-S-[CLASS]-[YEAR]-[NUM]
   */
  private async generateRegistrationNumber(gradeLevel?: string): Promise<string> {
    const yearCode = IdGenerator.getAcademicYearCode();

    // Extract context from gradeLevel (e.g., 'CM2' -> 'CM', '6ème' -> '6')
    let context = 'STU';
    if (gradeLevel) {
      // Remove numbers to get the base (e.g., 'CM2' -> 'CM')
      // or just take the first few characters.
      // Based on user example 'CM', let's take letters only if possible or just first 2-3 chars.
      const match = gradeLevel.match(/^[a-zA-Z]+/);
      context = match ? match[0] : gradeLevel.substring(0, 3).toUpperCase();
    }

    return IdGenerator.generateNextId(
      this.studentsRepository,
      EntityCode.STUDENT,
      yearCode,
      context
    );
  }

  async findAll(query?: QueryStudentsDto): Promise<Student[]> {
    const { gradeLevel, status, search, classId, gender, startDate, endDate, teacherId, limit = 100, offset = 0 } = query || {};

    const queryBuilder = this.studentsRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('student.user', 'user');

    if (gradeLevel) {
      queryBuilder.andWhere('student.gradeLevel = :gradeLevel', { gradeLevel });
    }

    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }

    if (gender) {
      queryBuilder.andWhere('student.gender = :gender', { gender });
    }

    if (startDate) {
      queryBuilder.andWhere('student.registrationDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('student.registrationDate <= :endDate', { endDate });
    }

    if (teacherId) {
      queryBuilder.andWhere('class.mainTeacherId = :teacherId', { teacherId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(student.firstName) LIKE LOWER(:search) OR LOWER(student.lastName) LIKE LOWER(:search) OR LOWER(student.registrationNumber) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('student.registrationDate', 'DESC')
      .take(limit)
      .skip(offset);

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['class', 'user'],
    });

    if (!student) {
      throw new NotFoundException(`L'élève avec l'ID ${id} n'a pas été trouvé`);
    }

    return student;
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { registrationNumber },
      relations: ['class', 'user'],
    });

    if (!student) {
      throw new NotFoundException(
        `L'élève avec le numéro d'inscription ${registrationNumber} n'a pas été trouvé`
      );
    }

    return student;
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const registrationNumber = await this.generateRegistrationNumber(createStudentDto.gradeLevel);

    const student = this.studentsRepository.create({
      ...createStudentDto,
      registrationNumber,
      registrationDate: new Date(),
      dob: new Date(createStudentDto.dob),
      status: createStudentDto.status || 'En attente',
      documents: createStudentDto.documents || [],
    });

    try {
      const savedStudent = await this.studentsRepository.save(student);

      // Log activity
      try {
        await this.activityLogService.create({
          action: 'Inscription élève',
          category: 'pedagogical',
          details: `Nouvel élève inscrit: ${savedStudent.firstName} ${savedStudent.lastName} (${savedStudent.registrationNumber})`,
          student_id: savedStudent.id,
          class_id: savedStudent.classId,
        });
      } catch (e) {
        console.warn('Failed to log student creation:', e);
      }

      return savedStudent;
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la création de l'élève: ${error.message}`
      );
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    // Mapper les champs camelCase (DTO) vers les noms de propriétés TypeScript
    // TypeORM gérera automatiquement le mapping vers les colonnes snake_case
    const updateData: any = {};

    if (updateStudentDto.firstName !== undefined) updateData.firstName = updateStudentDto.firstName;
    if (updateStudentDto.lastName !== undefined) updateData.lastName = updateStudentDto.lastName;
    if (updateStudentDto.dob !== undefined) updateData.dob = new Date(updateStudentDto.dob);
    if (updateStudentDto.gender !== undefined) updateData.gender = updateStudentDto.gender;
    if (updateStudentDto.nationality !== undefined) updateData.nationality = updateStudentDto.nationality;
    if (updateStudentDto.birthPlace !== undefined) updateData.birthPlace = updateStudentDto.birthPlace;
    if (updateStudentDto.address !== undefined) updateData.address = updateStudentDto.address;
    if (updateStudentDto.phone !== undefined) updateData.phone = updateStudentDto.phone;
    if (updateStudentDto.email !== undefined) updateData.email = updateStudentDto.email;
    if (updateStudentDto.gradeLevel !== undefined) updateData.gradeLevel = updateStudentDto.gradeLevel;
    if (updateStudentDto.previousSchool !== undefined) updateData.previousSchool = updateStudentDto.previousSchool;
    if (updateStudentDto.emergencyContactName !== undefined) updateData.emergencyContactName = updateStudentDto.emergencyContactName;
    if (updateStudentDto.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = updateStudentDto.emergencyContactPhone;
    if (updateStudentDto.medicalInfo !== undefined) updateData.medicalInfo = updateStudentDto.medicalInfo;
    if (updateStudentDto.status !== undefined) updateData.status = updateStudentDto.status;
    if (updateStudentDto.classId !== undefined) updateData.classId = updateStudentDto.classId;

    try {
      // Utiliser save() qui gère correctement le mapping des propriétés
      const student = await this.findOne(id);
      if (!student) {
        throw new NotFoundException(`Élève avec l'ID ${id} introuvable`);
      }

      console.log('Updating student with data:', updateData);
      Object.assign(student, updateData);
      const updated = await this.studentsRepository.save(student);
      console.log('Student updated successfully:', updated.id);

      // Log activity
      try {
        await this.activityLogService.create({
          action: 'Mise à jour élève',
          category: 'pedagogical',
          details: `Profil de l'élève ${updated.firstName} ${updated.lastName} mis à jour`,
          student_id: updated.id,
          class_id: updated.classId,
        });
      } catch (e) {
        console.warn('Failed to log student update:', e);
      }

      // Retourner avec les relations
      return this.findOne(updated.id);
    } catch (error) {
      console.error('Error updating student:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Erreur lors de la mise à jour de l'élève: ${error.message}`
      );
    }
  }

  async updateStatus(id: string, status: StudentStatus): Promise<Student> {
    const student = await this.findOne(id);
    student.status = status;
    return await this.studentsRepository.save(student);
  }

  async updateDocuments(id: string, documents: any[]): Promise<Student> {
    const student = await this.findOne(id);
    student.documents = documents;
    return await this.studentsRepository.save(student);
  }

  async updatePhoto(id: string, photoUrl: string): Promise<Student> {
    const student = await this.findOne(id);

    // If the old photo was a storage key, we might want to delete it
    if (student.photoUrl && student.photoUrl.startsWith('/api/v1/storage/')) {
      const oldKey = student.photoUrl.split('/storage/')[1];
      if (oldKey) {
        await this.storageService.deleteFile(oldKey).catch(() => { });
      }
    }

    student.photoUrl = photoUrl;
    return await this.studentsRepository.save(student);
  }

  async handlePhotoUpload(id: string, file: Express.Multer.File): Promise<Student> {
    const ext = file.originalname ? extname(file.originalname) : '.jpg';
    const storageKey = `photos/students/${id}${ext}`;

    const fileBuffer = file.buffer || (file.path ? require('fs').readFileSync(file.path) : null);
    if (!fileBuffer) {
      throw new BadRequestException('Le contenu du fichier est vide');
    }

    await this.storageService.uploadFile(fileBuffer, storageKey, {
      contentType: file.mimetype,
    });

    const photoUrl = `/api/v1/storage/${storageKey}`;
    return this.updatePhoto(id, photoUrl);
  }

  async getPhotoFile(storageKey: string) {
    return this.storageService.getFile(storageKey);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
  }

  async bulkCreate(students: CreateStudentDto[]): Promise<Student[]> {
    const createdStudents: Student[] = [];

    for (const studentDto of students) {
      const student = await this.create(studentDto);
      createdStudents.push(student);
    }

    return createdStudents;
  }

  async count(query?: QueryStudentsDto): Promise<number> {
    const { gradeLevel, status, search, classId } = query || {};

    const queryBuilder = this.studentsRepository.createQueryBuilder('student');

    if (gradeLevel) {
      queryBuilder.andWhere('student.gradeLevel = :gradeLevel', { gradeLevel });
    }

    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(student.firstName) LIKE LOWER(:search) OR LOWER(student.lastName) LIKE LOWER(:search) OR LOWER(student.registrationNumber) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    return queryBuilder.getCount();
  }

  async getStatsByGrade(): Promise<Array<{ gradeLevel: string; count: number }>> {
    return this.studentsRepository
      .createQueryBuilder('student')
      .select('student.gradeLevel', 'gradeLevel')
      .addSelect('COUNT(*)', 'count')
      .where('student.status = :status', { status: 'Actif' })
      .groupBy('student.gradeLevel')
      .orderBy('student.gradeLevel', 'ASC')
      .getRawMany();
  }

  async getStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
    return this.studentsRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status')
      .getRawMany();
  }

  async countPendingDocuments(): Promise<number> {
    const students = await this.studentsRepository.find({ select: ['documents'] });
    return students.reduce((count, student) => {
      const hasPending = (student.documents || []).some(doc => doc.status === 'En attente');
      return hasPending ? count + 1 : count;
    }, 0);
  }

  async countRejectedDocuments(): Promise<number> {
    const students = await this.studentsRepository.find({ select: ['documents'] });
    return students.reduce((count, student) => {
      const rejectedCount = (student.documents || []).filter(doc => doc.status === 'Rejeté').length;
      return count + rejectedCount;
    }, 0);
  }

  async countMissingDocuments(): Promise<number> {
    const mandatoryTypes = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];
    const students = await this.studentsRepository.find({ select: ['documents'] });

    return students.reduce((totalMissing, student) => {
      const studentDocTypes = (student.documents || []).map(d => d.type);
      const missingForStudent = mandatoryTypes.filter(type => !studentDocTypes.includes(type as any)).length;
      const specificallyMissing = (student.documents || []).filter(doc => doc.status === 'Manquant').length;
      return totalMissing + missingForStudent + specificallyMissing;
    }, 0);
  }
}
