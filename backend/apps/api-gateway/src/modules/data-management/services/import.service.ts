import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Grade, EvaluationType, Trimester } from '../../grades/entities/grade.entity';
import { Attendance, AttendanceStatus } from '../../attendance/entities/attendance.entity';
import { Student } from '../../students/entities/student.entity';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: string[];
  preview: any[];
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /**
   * Import grades from Excel/CSV file
   */
  async importGradesFromFile(
    fileBuffer: Buffer,
    validate: boolean = true,
  ): Promise<ImportResult> {
    this.logger.log('Importing grades from file');

    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Parse Excel/CSV file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      result.totalRows = data.length;

      if (data.length === 0) {
        throw new BadRequestException('Le fichier est vide');
      }

      // Validate if requested
      if (validate) {
        const validation = await this.validateGradesData(data);
        if (!validation.isValid) {
          result.errors = validation.errors;
          result.warnings = validation.warnings;
          return result;
        }
        result.warnings = validation.warnings;
      }

      // Import each row
      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have header

        try {
          // Map Excel columns to Grade entity
          const grade = new Grade();
          grade.studentId = row['ID Élève'] || row['studentId'];
          grade.subjectId = row['ID Matière'] || row['subjectId'];
          grade.teacherId = row['ID Professeur'] || row['teacherId'];
          grade.value = parseFloat(row['Note'] || row['value']);
          grade.maxValue = parseFloat(row['Note Max'] || row['maxValue'] || '20');
          grade.coefficient = parseFloat(row['Coefficient'] || row['coefficient'] || '1');
          grade.evaluationType = (row['Type'] || row['evaluationType']) as EvaluationType;
          grade.evaluationDate = row['Date'] || row['evaluationDate'];
          grade.trimester = (row['Trimestre'] || row['trimester']) as Trimester;
          grade.academicYear = row['Année'] || row['academicYear'];
          grade.title = row['Titre'] || row['title'];
          grade.comments = row['Commentaire'] || row['comments'];
          grade.visibleToParents = row['Visible Parents'] !== 'Non';

          // Validate required fields
          if (!grade.studentId || !grade.subjectId || !grade.teacherId) {
            result.errors.push({
              row: rowNumber,
              message: 'IDs élève, matière et professeur requis',
            });
            result.failedImports++;
            continue;
          }

          if (isNaN(grade.value) || grade.value < 0) {
            result.errors.push({
              row: rowNumber,
              field: 'Note',
              value: row['Note'],
              message: 'Note invalide',
            });
            result.failedImports++;
            continue;
          }

          if (grade.value > grade.maxValue) {
            result.errors.push({
              row: rowNumber,
              message: `Note ${grade.value} > Note Max ${grade.maxValue}`,
            });
            result.failedImports++;
            continue;
          }

          // Save to database
          await this.gradesRepository.save(grade);
          result.successfulImports++;
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            message: error.message || 'Erreur inconnue',
          });
          result.failedImports++;
        }
      }

      result.success = result.failedImports === 0;
      this.logger.log(
        `Import completed: ${result.successfulImports} success, ${result.failedImports} failed`,
      );

      return result;
    } catch (error) {
      this.logger.error('Import failed', error.stack);
      throw new BadRequestException(`Échec import: ${error.message}`);
    }
  }

  /**
   * Import attendance from file
   */
  async importAttendanceFromFile(fileBuffer: Buffer): Promise<ImportResult> {
    this.logger.log('Importing attendance from file');

    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Parse file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      result.totalRows = data.length;

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        const rowNumber = i + 2;

        try {
          const attendance = new Attendance();
          attendance.studentId = row['ID Élève'] || row['studentId'];
          attendance.classId = row['ID Classe'] || row['classId'];
          attendance.date = row['Date'] || row['date'];
          attendance.status = (row['Statut'] || row['status']) as AttendanceStatus;
          attendance.isJustified = row['Justifié'] === 'Oui' || row['isJustified'] === true;
          attendance.reason = row['Raison'] || row['reason'];
          attendance.justificationDocument = row['Document'] || row['justificationDocument'];

          // Validation
          if (!attendance.studentId || !attendance.date) {
            result.errors.push({
              row: rowNumber,
              message: 'ID élève et date requis',
            });
            result.failedImports++;
            continue;
          }

          // Check for duplicates
          const existing = await this.attendanceRepository.findOne({
            where: {
              studentId: attendance.studentId,
              date: attendance.date,
            },
          });

          if (existing) {
            result.warnings.push(
              `Ligne ${rowNumber}: Présence déjà enregistrée pour cet élève ce jour`,
            );
            result.failedImports++;
            continue;
          }

          await this.attendanceRepository.save(attendance);
          result.successfulImports++;
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            message: error.message,
          });
          result.failedImports++;
        }
      }

      result.success = result.failedImports === 0;
      this.logger.log(
        `Attendance import: ${result.successfulImports} success, ${result.failedImports} failed`,
      );

      return result;
    } catch (error) {
      this.logger.error('Attendance import failed', error.stack);
      throw new BadRequestException(`Échec import présences: ${error.message}`);
    }
  }

  /**
   * Import students from file
   */
  async importStudentsFromFile(fileBuffer: Buffer): Promise<ImportResult> {
    this.logger.log('Importing students from file');

    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      warnings: [],
    };

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      result.totalRows = data.length;

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        const rowNumber = i + 2;

        try {
          const student = new Student();
          student.registrationNumber = row['Matricule'] || row['registrationNumber'];
          student.firstName = row['Prénom'] || row['firstName'];
          student.lastName = row['Nom'] || row['lastName'];
          student.registrationDate = row['Date Naissance'] ? new Date(row['Date Naissance']) : new Date(); // Using registrationDate
          student.gender = row['Genre'] || row['gender'];
          student.classId = row['ID Classe'] || row['classId'];
          student.email = row['Email'] || row['email'];
          // phoneNumber, guardianName, guardianPhone, isActive not in entity - skip them
          student.address = row['Adresse'] || row['address'];

          // Validation
          if (!student.firstName || !student.lastName || !student.registrationNumber) {
            result.errors.push({
              row: rowNumber,
              message: 'Nom, prénom et matricule requis',
            });
            result.failedImports++;
            continue;
          }

          // Check duplicate registration number
          const existing = await this.studentRepository.findOne({
            where: { registrationNumber: student.registrationNumber },
          });

          if (existing) {
            result.warnings.push(
              `Ligne ${rowNumber}: Matricule ${student.registrationNumber} déjà existant`,
            );
            result.failedImports++;
            continue;
          }

          await this.studentRepository.save(student);
          result.successfulImports++;
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            message: error.message,
          });
          result.failedImports++;
        }
      }

      result.success = result.failedImports === 0;
      this.logger.log(
        `Students import: ${result.successfulImports} success, ${result.failedImports} failed`,
      );

      return result;
    } catch (error) {
      this.logger.error('Students import failed', error.stack);
      throw new BadRequestException(`Échec import élèves: ${error.message}`);
    }
  }

  /**
   * Validate grades data before import (dry-run)
   */
  async validateGradesData(data: any[]): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      preview: data.slice(0, 10), // First 10 rows preview
    };

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      const rowNumber = i + 2;

      // Check required fields
      if (!row['ID Élève'] && !row['studentId']) {
        result.errors.push({
          row: rowNumber,
          field: 'ID Élève',
          message: 'ID Élève manquant',
        });
        result.isValid = false;
      }

      if (!row['ID Matière'] && !row['subjectId']) {
        result.errors.push({
          row: rowNumber,
          field: 'ID Matière',
          message: 'ID Matière manquant',
        });
        result.isValid = false;
      }

      // Validate note value
      const noteValue = parseFloat(row['Note'] || row['value']);
      const maxValue = parseFloat(row['Note Max'] || row['maxValue'] || '20');

      if (isNaN(noteValue)) {
        result.errors.push({
          row: rowNumber,
          field: 'Note',
          value: row['Note'],
          message: 'Note invalide (doit être un nombre)',
        });
        result.isValid = false;
      }

      if (noteValue < 0) {
        result.errors.push({
          row: rowNumber,
          field: 'Note',
          value: noteValue,
          message: 'Note négative non autorisée',
        });
        result.isValid = false;
      }

      if (noteValue > maxValue) {
        result.errors.push({
          row: rowNumber,
          field: 'Note',
          value: noteValue,
          message: `Note ${noteValue} supérieure à la note maximale ${maxValue}`,
        });
        result.isValid = false;
      }

      // Check coefficient
      const coefficient = parseFloat(row['Coefficient'] || row['coefficient'] || '1');
      if (coefficient <= 0) {
        result.warnings.push(
          `Ligne ${rowNumber}: Coefficient ${coefficient} invalide, sera remplacé par 1`,
        );
      }

      // Limit to first 100 errors
      if (result.errors.length >= 100) {
        result.warnings.push('Plus de 100 erreurs détectées, validation arrêtée');
        break;
      }
    }

    return result;
  }
}
