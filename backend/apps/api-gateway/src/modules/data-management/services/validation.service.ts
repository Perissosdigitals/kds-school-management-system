import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../../grades/entities/grade.entity';
import { Student } from '../../students/entities/student.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';

export interface ValidationError {
  entity: string;
  id: string;
  field: string;
  issue: string;
  severity: 'error' | 'warning';
}

export interface ValidationReport {
  totalChecked: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  status: 'healthy' | 'issues_found';
  checkedAt: Date;
}

export interface IntegrityReport {
  foreignKeys: { status: string; issues: number };
  duplicates: { status: string; issues: number };
  orphanedRecords: { status: string; issues: number };
  dataConsistency: { status: string; issues: number };
  totalIssues: number;
  details: ValidationError[];
}

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async validateGradesData(): Promise<ValidationReport> {
    this.logger.log('Validating grades data...');
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const grades = await this.gradesRepository.find({
      relations: ['student', 'subject', 'teacher'],
    });

    for (const grade of grades) {
      // Vérifier que la note ne dépasse pas la note maximale
      if (grade.value > grade.maxValue) {
        errors.push({
          entity: 'Grade',
          id: grade.id,
          field: 'value',
          issue: `Note ${grade.value} supérieure à la note maximale ${grade.maxValue}`,
          severity: 'error',
        });
      }

      // Vérifier que la note est positive
      if (grade.value < 0) {
        errors.push({
          entity: 'Grade',
          id: grade.id,
          field: 'value',
          issue: `Note négative: ${grade.value}`,
          severity: 'error',
        });
      }

      // Vérifier les références manquantes
      if (!grade.student) {
        errors.push({
          entity: 'Grade',
          id: grade.id,
          field: 'studentId',
          issue: 'Élève introuvable ou supprimé',
          severity: 'error',
        });
      }

      if (!grade.subject) {
        warnings.push({
          entity: 'Grade',
          id: grade.id,
          field: 'subjectId',
          issue: 'Matière introuvable',
          severity: 'warning',
        });
      }

      if (!grade.teacher) {
        warnings.push({
          entity: 'Grade',
          id: grade.id,
          field: 'teacherId',
          issue: 'Enseignant introuvable',
          severity: 'warning',
        });
      }

      // Vérifier la date d'évaluation
      if (grade.evaluationDate > new Date()) {
        warnings.push({
          entity: 'Grade',
          id: grade.id,
          field: 'evaluationDate',
          issue: 'Date d\'évaluation dans le futur',
          severity: 'warning',
        });
      }
    }

    return {
      totalChecked: grades.length,
      errors,
      warnings,
      status: errors.length > 0 ? 'issues_found' : 'healthy',
      checkedAt: new Date(),
    };
  }

  async validateStudentsData(): Promise<ValidationReport> {
    this.logger.log('Validating students data...');
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const students = await this.studentRepository.find({
      relations: ['class'],
    });

    // Vérifier les doublons de matricule
    const registrationNumbers = new Map<string, string[]>();
    students.forEach(student => {
      if (!registrationNumbers.has(student.registrationNumber)) {
        registrationNumbers.set(student.registrationNumber, []);
      }
      registrationNumbers.get(student.registrationNumber).push(student.id);
    });

    registrationNumbers.forEach((ids, regNumber) => {
      if (ids.length > 1) {
        ids.forEach(id => {
          errors.push({
            entity: 'Student',
            id,
            field: 'registrationNumber',
            issue: `Matricule en double: ${regNumber} (${ids.length} élèves)`,
            severity: 'error',
          });
        });
      }
    });

    for (const student of students) {
      // Vérifier les champs requis
      if (!student.firstName || student.firstName.trim() === '') {
        errors.push({
          entity: 'Student',
          id: student.id,
          field: 'firstName',
          issue: 'Prénom manquant',
          severity: 'error',
        });
      }

      if (!student.lastName || student.lastName.trim() === '') {
        errors.push({
          entity: 'Student',
          id: student.id,
          field: 'lastName',
          issue: 'Nom manquant',
          severity: 'error',
        });
      }

      if (!student.registrationNumber) {
        errors.push({
          entity: 'Student',
          id: student.id,
          field: 'registrationNumber',
          issue: 'Matricule manquant',
          severity: 'error',
        });
      }

      // Vérifier la classe
      if (!student.class) {
        warnings.push({
          entity: 'Student',
          id: student.id,
          field: 'classId',
          issue: 'Élève non affecté à une classe',
          severity: 'warning',
        });
      }

      // Vérifier l'email si présent
      if (student.email && !this.isValidEmail(student.email)) {
        warnings.push({
          entity: 'Student',
          id: student.id,
          field: 'email',
          issue: `Email invalide: ${student.email}`,
          severity: 'warning',
        });
      }
    }

    return {
      totalChecked: students.length,
      errors,
      warnings,
      status: errors.length > 0 ? 'issues_found' : 'healthy',
      checkedAt: new Date(),
    };
  }

  async validateAttendanceData(): Promise<ValidationReport> {
    this.logger.log('Validating attendance data...');
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const attendances = await this.attendanceRepository.find({
      relations: ['student', 'class'],
    });

    // Vérifier les doublons (même élève, même date)
    const attendanceMap = new Map<string, string[]>();
    attendances.forEach(attendance => {
      const key = `${attendance.studentId}_${attendance.date.toISOString().split('T')[0]}`;
      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, []);
      }
      attendanceMap.get(key).push(attendance.id);
    });

    attendanceMap.forEach((ids, key) => {
      if (ids.length > 1) {
        ids.forEach(id => {
          warnings.push({
            entity: 'Attendance',
            id,
            field: 'date',
            issue: `Présence en double pour cette date (${ids.length} enregistrements)`,
            severity: 'warning',
          });
        });
      }
    });

    for (const attendance of attendances) {
      // Vérifier les références
      if (!attendance.student) {
        errors.push({
          entity: 'Attendance',
          id: attendance.id,
          field: 'studentId',
          issue: 'Élève introuvable',
          severity: 'error',
        });
      }

      // Vérifier la date
      if (attendance.date > new Date()) {
        warnings.push({
          entity: 'Attendance',
          id: attendance.id,
          field: 'date',
          issue: 'Date de présence dans le futur',
          severity: 'warning',
        });
      }
    }

    return {
      totalChecked: attendances.length,
      errors,
      warnings,
      status: errors.length > 0 ? 'issues_found' : 'healthy',
      checkedAt: new Date(),
    };
  }

  async checkDataIntegrity(): Promise<IntegrityReport> {
    this.logger.log('Performing comprehensive data integrity check...');

    const [gradesReport, studentsReport, attendanceReport] = await Promise.all([
      this.validateGradesData(),
      this.validateStudentsData(),
      this.validateAttendanceData(),
    ]);

    const allErrors = [
      ...gradesReport.errors,
      ...studentsReport.errors,
      ...attendanceReport.errors,
    ];

    const allWarnings = [
      ...gradesReport.warnings,
      ...studentsReport.warnings,
      ...attendanceReport.warnings,
    ];

    const totalIssues = allErrors.length + allWarnings.length;

    return {
      foreignKeys: {
        status: allErrors.filter(e => e.field.endsWith('Id')).length === 0 ? 'passed' : 'failed',
        issues: allErrors.filter(e => e.field.endsWith('Id')).length,
      },
      duplicates: {
        status: allErrors.filter(e => e.issue.includes('double')).length === 0 ? 'passed' : 'failed',
        issues: allErrors.filter(e => e.issue.includes('double')).length,
      },
      orphanedRecords: {
        status: allErrors.filter(e => e.issue.includes('introuvable')).length === 0 ? 'passed' : 'failed',
        issues: allErrors.filter(e => e.issue.includes('introuvable')).length,
      },
      dataConsistency: {
        status: allErrors.length === 0 ? 'passed' : 'failed',
        issues: allErrors.length,
      },
      totalIssues,
      details: [...allErrors, ...allWarnings],
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
