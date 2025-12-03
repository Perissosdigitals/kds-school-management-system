import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Grade } from '../../grades/entities/grade.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Student } from '../../students/entities/student.entity';

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  classId?: string;
  studentId?: string;
  subjectId?: string;
  trimester?: string;
  academicYear?: string;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /**
   * Export grades to Excel
   */
  async exportGradesToExcel(filters: ExportFilters): Promise<Buffer> {
    this.logger.log('Exporting grades to Excel');

    // Build query
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher')
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('grade.evaluationDate', 'DESC');

    // Apply filters
    if (filters.classId) {
      query.andWhere('student.classId = :classId', { classId: filters.classId });
    }
    if (filters.studentId) {
      query.andWhere('grade.studentId = :studentId', { studentId: filters.studentId });
    }
    if (filters.subjectId) {
      query.andWhere('grade.subjectId = :subjectId', { subjectId: filters.subjectId });
    }
    if (filters.trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester: filters.trimester });
    }
    if (filters.academicYear) {
      query.andWhere('grade.academicYear = :academicYear', { academicYear: filters.academicYear });
    }
    if (filters.startDate) {
      query.andWhere('grade.evaluationDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('grade.evaluationDate <= :endDate', { endDate: filters.endDate });
    }

    const grades = await query.getMany();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Notes');

    // Add headers
    worksheet.columns = [
      { header: 'Élève', key: 'student', width: 25 },
      { header: 'Matricule', key: 'registrationNumber', width: 15 },
      { header: 'Classe', key: 'class', width: 10 },
      { header: 'Matière', key: 'subject', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Note', key: 'value', width: 10 },
      { header: 'Note Max', key: 'maxValue', width: 10 },
      { header: 'Note/20', key: 'normalized', width: 10 },
      { header: 'Coefficient', key: 'coefficient', width: 12 },
      { header: 'Trimestre', key: 'trimester', width: 18 },
      { header: 'Année', key: 'academicYear', width: 12 },
      { header: 'Professeur', key: 'teacher', width: 25 },
      { header: 'Commentaire', key: 'comments', width: 40 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    for (const grade of grades) {
      const normalizedValue = (grade.value / grade.maxValue) * 20;

      worksheet.addRow({
        student: grade.student ? `${grade.student.firstName} ${grade.student.lastName}` : 'N/A',
        registrationNumber: grade.student?.registrationNumber || 'N/A',
        class: grade.student?.class?.name || 'N/A',
        subject: grade.subject?.name || 'N/A',
        type: grade.evaluationType,
        date: grade.evaluationDate,
        value: grade.value,
        maxValue: grade.maxValue,
        normalized: normalizedValue.toFixed(2),
        coefficient: grade.coefficient,
        trimester: grade.trimester,
        academicYear: grade.academicYear,
        teacher: grade.teacher ? `${grade.teacher.firstName} ${grade.teacher.lastName}` : 'N/A',
        comments: grade.comments || '',
      });
    }

    // Add summary at the end
    const summaryRow = worksheet.addRow({});
    summaryRow.font = { bold: true };
    worksheet.addRow({
      student: 'TOTAL',
      value: `${grades.length} notes`,
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    this.logger.log(`Exported ${grades.length} grades to Excel`);

    return buffer as any; // Type workaround for ExcelJS Buffer
  }

  /**
   * Export grades to CSV
   */
  async exportGradesToCSV(filters: ExportFilters): Promise<string> {
    this.logger.log('Exporting grades to CSV');

    // Build query (same as Excel)
    const query = this.gradesRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher')
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('grade.evaluationDate', 'DESC');

    // Apply filters
    if (filters.classId) {
      query.andWhere('student.classId = :classId', { classId: filters.classId });
    }
    if (filters.studentId) {
      query.andWhere('grade.studentId = :studentId', { studentId: filters.studentId });
    }
    if (filters.subjectId) {
      query.andWhere('grade.subjectId = :subjectId', { subjectId: filters.subjectId });
    }
    if (filters.trimester) {
      query.andWhere('grade.trimester = :trimester', { trimester: filters.trimester });
    }
    if (filters.academicYear) {
      query.andWhere('grade.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    const grades = await query.getMany();

    // Build CSV
    const headers = [
      'Élève',
      'Matricule',
      'Classe',
      'Matière',
      'Type',
      'Date',
      'Note',
      'Note Max',
      'Note/20',
      'Coefficient',
      'Trimestre',
      'Année',
      'Professeur',
      'Commentaire',
    ];

    let csv = headers.join(',') + '\n';

    for (const grade of grades) {
      const normalizedValue = (grade.value / grade.maxValue) * 20;
      const row = [
        `"${grade.student ? `${grade.student.firstName} ${grade.student.lastName}` : 'N/A'}"`,
        `"${grade.student?.registrationNumber || 'N/A'}"`,
        `"${grade.student?.class?.name || 'N/A'}"`,
        `"${grade.subject?.name || 'N/A'}"`,
        `"${grade.evaluationType}"`,
        `"${grade.evaluationDate}"`,
        grade.value,
        grade.maxValue,
        normalizedValue.toFixed(2),
        grade.coefficient,
        `"${grade.trimester}"`,
        `"${grade.academicYear}"`,
        `"${grade.teacher ? `${grade.teacher.firstName} ${grade.teacher.lastName}` : 'N/A'}"`,
        `"${grade.comments || ''}"`,
      ];
      csv += row.join(',') + '\n';
    }

    this.logger.log(`Exported ${grades.length} grades to CSV`);
    return csv;
  }

  /**
   * Export attendance to Excel
   */
  async exportAttendanceToExcel(filters: ExportFilters): Promise<Buffer> {
    this.logger.log('Exporting attendance to Excel');

    // Build query
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('student.class', 'class')
      .orderBy('attendance.date', 'DESC')
      .addOrderBy('student.lastName', 'ASC');

    // Apply filters
    if (filters.classId) {
      query.andWhere('student.classId = :classId', { classId: filters.classId });
    }
    if (filters.studentId) {
      query.andWhere('attendance.studentId = :studentId', { studentId: filters.studentId });
    }
    if (filters.startDate) {
      query.andWhere('attendance.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('attendance.date <= :endDate', { endDate: filters.endDate });
    }

    const records = await query.getMany();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Présences');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Élève', key: 'student', width: 25 },
      { header: 'Matricule', key: 'registrationNumber', width: 15 },
      { header: 'Classe', key: 'class', width: 10 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Justifié', key: 'justified', width: 10 },
      { header: 'Raison', key: 'reason', width: 30 },
      { header: 'Document', key: 'document', width: 30 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    for (const record of records) {
      worksheet.addRow({
        date: record.date,
        student: record.student ? `${record.student.firstName} ${record.student.lastName}` : 'N/A',
        registrationNumber: record.student?.registrationNumber || 'N/A',
        class: record.student?.class?.name || 'N/A',
        status: record.status,
        justified: record.isJustified ? 'Oui' : 'Non',
        reason: record.reason || '',
        document: record.justificationDocument || '',
      });
    }

    // Summary
    worksheet.addRow({});
    worksheet.addRow({
      date: 'TOTAL',
      student: `${records.length} enregistrements`,
    }).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    this.logger.log(`Exported ${records.length} attendance records to Excel`);

    return buffer as any; // Type workaround for ExcelJS Buffer
  }

  /**
   * Export students to Excel
   */
  async exportStudentsToExcel(filters: ExportFilters): Promise<Buffer> {
    this.logger.log('Exporting students to Excel');

    // Build query
    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class')
      .orderBy('student.lastName', 'ASC');

    if (filters.classId) {
      query.andWhere('student.classId = :classId', { classId: filters.classId });
    }

    const students = await query.getMany();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Élèves');

    // Add Title Row
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'LISTE DES ÉLÈVES';
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF2F75B5' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(1).height = 30;

    // Add headers
    worksheet.getRow(2).values = [
      'ID', 'Nom', 'Prénom', 'Date Naissance', 'Sexe', 'Classe', 'Contact Urgence', 'Téléphone', 'Adresse', 'Info Médicale', 'Statut'
    ];

    worksheet.columns = [
      { key: 'id', width: 15 },
      { key: 'lastName', width: 20 },
      { key: 'firstName', width: 20 },
      { key: 'dob', width: 15 },
      { key: 'gender', width: 10 },
      { key: 'gradeLevel', width: 10 },
      { key: 'emergencyContact', width: 30 },
      { key: 'phone', width: 15 },
      { key: 'address', width: 30 },
      { key: 'medicalInfo', width: 20 },
      { key: 'status', width: 10 },
    ];

    // Style header
    const headerRow = worksheet.getRow(2);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    for (const student of students) {
      worksheet.addRow({
        id: student.registrationNumber,
        lastName: student.lastName,
        firstName: student.firstName,
        dob: student.dob, // Date formatting handled by Excel usually, or convert to string
        gender: student.gender === 'Masculin' ? 'M' : (student.gender === 'Féminin' ? 'F' : student.gender),
        gradeLevel: student.gradeLevel,
        emergencyContact: `${student.emergencyContactName || ''} ${student.emergencyContactPhone || ''}`.trim(),
        phone: student.phone || '0',
        address: student.address || '0',
        medicalInfo: student.medicalInfo || '0',
        status: student.status,
      });
    }

    // Summary
    worksheet.addRow({});
    worksheet.addRow({
      registrationNumber: 'TOTAL',
      lastName: `${students.length} élèves`,
    }).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    this.logger.log(`Exported ${students.length} students to Excel`);

    return buffer as any; // Type workaround for ExcelJS Buffer
  }

  /**
   * Export all data (grades + attendance + students)
   */
  async exportAllData(academicYear: string): Promise<Buffer> {
    this.logger.log(`Exporting all data for academic year ${academicYear}`);

    // For now, return a summary workbook
    // TODO: Properly merge multiple workbooks when ExcelJS API allows it
    const workbook = new ExcelJS.Workbook();
    const summary = workbook.addWorksheet('Résumé');
    
    summary.addRow(['Export Complet des Données']);
    summary.addRow(['Année Académique', academicYear]);
    summary.addRow(['Date Export', new Date().toLocaleDateString()]);
    summary.addRow([]);
    summary.addRow(['Contenu disponible:']);
    summary.addRow(['- Notes (via /api/data/export/grades)']);
    summary.addRow(['- Présences (via /api/data/export/attendance)']);
    summary.addRow(['- Élèves (via /api/data/export/students)']);
    summary.addRow([]);
    summary.addRow(['Note:', 'Utilisez les endpoints individuels pour exporter chaque type de données.']);

    const buffer = await workbook.xlsx.writeBuffer();
    this.logger.log('Exported all data summary successfully');

    return buffer as any; // Type workaround for ExcelJS Buffer
  }
}
