import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { SchoolClass } from '../classes/entities/class.entity';
import { Transaction, TransactionType, PaymentStatus, TransactionCategory } from '../finance/entities/transaction.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentResultDto } from './dto/enrollment-result.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(SchoolClass)
    private classRepository: Repository<SchoolClass>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    private dataSource: DataSource,
  ) { }

  /**
   * Workflow complet d'inscription d'un élève
   * 1. Validation de la classe (capacité, existence)
   * 2. Génération du numéro de matricule
   * 3. Création de l'élève
   * 4. Affectation à la classe
   * 5. Génération des documents requis
   * 6. Création des transactions financières
   * 7. Retour du résultat complet
   */
  async enrollStudent(enrollDto: EnrollStudentDto): Promise<EnrollmentResultDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Valider la classe
      const schoolClass = await this.validateClass(enrollDto.classId);

      // 2. Vérifier la capacité de la classe
      const currentStudents = await this.studentRepository.count({
        where: { classId: enrollDto.classId, status: 'Actif' },
      });

      if (currentStudents >= schoolClass.capacity) {
        throw new BadRequestException(
          `La classe ${schoolClass.name} a atteint sa capacité maximale (${schoolClass.capacity} élèves)`
        );
      }

      // 3. Générer le numéro de matricule
      const registrationNumber = await this.generateRegistrationNumber(enrollDto.gradeLevel);

      // 4. Créer l'élève
      const student = this.studentRepository.create({
        registrationNumber,
        registrationDate: new Date(),
        lastName: enrollDto.lastName,
        firstName: enrollDto.firstName,
        dob: new Date(enrollDto.dob),
        gender: enrollDto.gender,
        nationality: enrollDto.nationality,
        birthPlace: enrollDto.birthPlace,
        address: enrollDto.address,
        phone: enrollDto.phone,
        email: enrollDto.email,
        gradeLevel: enrollDto.gradeLevel,
        previousSchool: enrollDto.previousSchool,
        emergencyContactName: enrollDto.emergencyContactName,
        emergencyContactPhone: enrollDto.emergencyContactPhone,
        medicalInfo: enrollDto.medicalInfo,
        classId: enrollDto.classId,
        status: 'En attente', // En attente jusqu'à validation des documents
        documents: this.initializeRequiredDocuments(),
      });

      const savedStudent = await queryRunner.manager.save(Student, student);

      // 5. Générer les transactions financières si demandé
      let financialRecords: Transaction[] = [];
      if (enrollDto.generateFinancialRecords !== false) {
        financialRecords = await this.generateFinancialRecords(
          savedStudent.id,
          enrollDto.academicYear || schoolClass.academicYear,
          queryRunner
        );
      }

      // 6. Récupérer les informations du professeur principal
      let mainTeacher = null;
      if (schoolClass.mainTeacherId) {
        mainTeacher = await this.teacherRepository.findOne({
          where: { id: schoolClass.mainTeacherId },
        });
      }

      await queryRunner.commitTransaction();

      // 7. Construire le résultat
      return {
        success: true,
        message: `Élève ${savedStudent.firstName} ${savedStudent.lastName} inscrit avec succès dans la classe ${schoolClass.name}`,
        student: savedStudent,
        financialRecords,
        classInfo: {
          id: schoolClass.id,
          name: schoolClass.name,
          level: schoolClass.level,
          capacity: schoolClass.capacity,
          currentStudents: currentStudents + 1,
          mainTeacher: mainTeacher ? {
            id: mainTeacher.id,
            firstName: mainTeacher.firstName,
            lastName: mainTeacher.lastName,
            subject: mainTeacher.subject,
          } : undefined,
        },
        requiredDocuments: savedStudent.documents.map(doc => ({
          type: doc.type,
          status: doc.status,
          required: true,
        })),
        nextSteps: [
          'Soumettre les documents requis (extrait de naissance, carnet de vaccination, etc.)',
          'Effectuer le paiement des frais d\'inscription',
          'Récupérer la carte d\'élève et l\'emploi du temps',
          'Participer à la réunion d\'accueil des nouveaux parents',
        ],
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Valider l'existence et l'état de la classe
   */
  private async validateClass(classId: string): Promise<SchoolClass> {
    const schoolClass = await this.classRepository.findOne({
      where: { id: classId },
    });

    if (!schoolClass) {
      throw new NotFoundException(`Classe avec l'ID ${classId} introuvable`);
    }

    if (!schoolClass.isActive) {
      throw new BadRequestException(`La classe ${schoolClass.name} n'est pas active`);
    }

    return schoolClass;
  }

  /**
   * Générer un numéro de matricule unique
   * Format: KDS + Année + Niveau + Numéro séquentiel
   * Exemple: KDS2024CM2001
   */
  private async generateRegistrationNumber(gradeLevel: string): Promise<string> {
    const year = new Date().getFullYear();
    const levelCode = gradeLevel.replace(/\s+/g, '').toUpperCase().substring(0, 4);

    // Compter les élèves existants pour cette année et ce niveau
    const count = await this.studentRepository.count({
      where: { gradeLevel },
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `KSP${year}${levelCode}${sequence}`;
  }

  /**
   * Initialiser les documents requis pour l'inscription
   */
  private initializeRequiredDocuments() {
    const requiredDocTypes = [
      'Extrait de naissance',
      'Carnet de vaccination',
      'Autorisation parentale',
      'Fiche scolaire',
    ];

    return requiredDocTypes.map(type => ({
      type: type as any,
      status: 'Manquant' as any,
      updatedAt: new Date().toISOString(),
      history: [{
        timestamp: new Date().toISOString(),
        user: 'System',
        action: 'Document requis créé',
      }],
    }));
  }

  /**
   * Générer les transactions financières pour l'inscription
   */
  private async generateFinancialRecords(
    studentId: string,
    academicYear: string,
    queryRunner: any
  ): Promise<Transaction[]> {
    // UUID système pour les inscriptions automatiques
    // TODO: Remplacer par l'UUID de l'utilisateur authentifié dans une vraie application
    const systemUserId = '00000000-0000-0000-0000-000000000000';

    const transactions: Partial<Transaction>[] = [
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.REGISTRATION,
        amount: 50000, // 50,000 FCFA
        transactionDate: new Date(),
        dueDate: new Date(),
        status: PaymentStatus.PENDING,
        studentId,
        description: `Frais d'inscription - ${academicYear}`,
        amountPaid: 0,
        recordedBy: systemUserId,
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.TUITION,
        amount: 150000, // 150,000 FCFA (1er trimestre)
        transactionDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        status: PaymentStatus.PENDING,
        studentId,
        description: `Frais de scolarité - 1er trimestre ${academicYear}`,
        amountPaid: 0,
        recordedBy: systemUserId,
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.BOOKS,
        amount: 25000, // 25,000 FCFA
        transactionDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 jours
        status: PaymentStatus.PENDING,
        studentId,
        description: `Manuels scolaires - ${academicYear}`,
        amountPaid: 0,
        recordedBy: systemUserId,
      },
    ];

    const savedTransactions = await queryRunner.manager.save(Transaction, transactions);
    return savedTransactions;
  }

  /**
   * Obtenir le dossier complet d'un élève
   */
  async getStudentFullProfile(studentId: string) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class', 'class.mainTeacher'],
    });

    if (!student) {
      throw new NotFoundException(`Élève avec l'ID ${studentId} introuvable`);
    }

    // Récupérer les transactions financières
    const financialRecords = await this.transactionRepository.find({
      where: { studentId },
      order: { transactionDate: 'DESC' },
    });

    // Calculer le solde
    const totalDue = financialRecords
      .filter(t => t.type === TransactionType.REVENUE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPaid = financialRecords
      .filter(t => t.type === TransactionType.REVENUE)
      .reduce((sum, t) => sum + Number(t.amountPaid), 0);

    const balance = totalDue - totalPaid;

    return {
      student,
      financial: {
        totalDue,
        totalPaid,
        balance,
        status: balance === 0 ? 'À jour' : balance > 0 ? 'Impayé' : 'Crédit',
        transactions: financialRecords,
      },
      documents: student.documents,
    };
  }

  /**
   * Mettre à jour une inscription
   * Permet de modifier le statut, transférer vers une autre classe, ou enregistrer un retrait
   */
  async updateEnrollment(studentId: string, updateDto: UpdateEnrollmentDto) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Si transfert vers une nouvelle classe
    if (updateDto.class_id && updateDto.class_id !== student.classId) {
      const newClass = await this.validateClass(updateDto.class_id);

      // Vérifier la capacité de la nouvelle classe
      const currentStudents = await this.studentRepository.count({
        where: { classId: updateDto.class_id, status: 'Actif' },
      });

      if (currentStudents >= newClass.capacity) {
        throw new BadRequestException(`Class ${newClass.name} is full (capacity: ${newClass.capacity})`);
      }

      student.classId = updateDto.class_id;
      student.status = 'Actif';
    }

    // Mise à jour du statut si fourni
    if (updateDto.enrollment_status) {
      const statusMap = {
        'active': 'Actif',
        'transferred': 'Inactif', // Mark as inactive when transferred
        'withdrawn': 'Inactif',
        'completed': 'Actif', // Graduate but keep active
      };
      student.status = statusMap[updateDto.enrollment_status] || student.status;
    }

    // Enregistrer les informations de retrait
    if (updateDto.withdrawal_date || updateDto.withdrawal_reason) {
      student.status = 'Inactif';
    }

    await this.studentRepository.save(student);

    return {
      id: student.id,
      registrationNumber: student.registrationNumber,
      status: student.status,
      classId: student.classId,
      message: 'Enrollment updated successfully',
    };
  }

  /**
   * Retirer un élève (annuler l'inscription)
   */
  async withdrawStudent(studentId: string): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    student.status = 'Inactif'; // Use valid StudentStatus enum value
    await this.studentRepository.save(student);
  }
}
