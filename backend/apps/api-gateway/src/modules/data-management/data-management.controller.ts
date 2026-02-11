import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './services/export.service';
import { ImportService } from './services/import.service';
import { BackupService } from './services/backup.service';
import { ValidationService } from './services/validation.service';
import { MigrationService } from './services/migration.service';
import { ExportFiltersDto, ExportFormat } from './dto/export-filters.dto';
import { BackupOptionsDto } from './dto/backup-options.dto';
import { MigrationOptionsDto } from './dto/migration-options.dto';

@ApiTags('Data Management')
@Controller('data')
export class DataManagementController {
  constructor(
    private readonly exportService: ExportService,
    private readonly importService: ImportService,
    private readonly backupService: BackupService,
    private readonly validationService: ValidationService,
    private readonly migrationService: MigrationService,
  ) { }

  // ============= EXPORT ENDPOINTS =============

  @Get('export/grades')
  @ApiOperation({ summary: 'Export grades to Excel or CSV' })
  @ApiResponse({ status: 200, description: 'Grades exported successfully' })
  async exportGrades(@Query() filters: ExportFiltersDto, @Res() res: Response) {
    const format = filters.format || ExportFormat.EXCEL;

    if (format === ExportFormat.EXCEL) {
      const buffer = await this.exportService.exportGradesToExcel(filters);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=notes_${Date.now()}.xlsx`);
      res.send(buffer);
    } else if (format === ExportFormat.CSV) {
      const csv = await this.exportService.exportGradesToCSV(filters);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=notes_${Date.now()}.csv`);
      res.send(csv);
    } else {
      throw new BadRequestException('Format non supporté');
    }
  }

  @Get('export/attendance')
  @ApiOperation({ summary: 'Export attendance records to Excel' })
  @ApiResponse({ status: 200, description: 'Attendance exported successfully' })
  async exportAttendance(@Query() filters: ExportFiltersDto, @Res() res: Response) {
    const buffer = await this.exportService.exportAttendanceToExcel(filters);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=presences_${Date.now()}.xlsx`);
    res.send(buffer);
  }

  @Get('export/students')
  @ApiOperation({ summary: 'Export students to Excel' })
  @ApiResponse({ status: 200, description: 'Students exported successfully' })
  async exportStudents(@Query() filters: ExportFiltersDto, @Res() res: Response) {
    const buffer = await this.exportService.exportStudentsToExcel(filters);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=eleves_${Date.now()}.xlsx`);
    res.send(buffer);
  }

  @Get('export/all')
  @ApiOperation({ summary: 'Export all data (grades, attendance, students) to single Excel file' })
  @ApiQuery({ name: 'academicYear', required: true, description: 'Academic year', example: '2024-2025' })
  @ApiResponse({ status: 200, description: 'All data exported successfully' })
  async exportAllData(@Query('academicYear') academicYear: string, @Res() res: Response) {
    if (!academicYear) {
      throw new BadRequestException('Academic year is required');
    }

    const buffer = await this.exportService.exportAllData(academicYear);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=donnees_completes_${academicYear}_${Date.now()}.xlsx`);
    res.send(buffer);
  }

  // ============= IMPORT ENDPOINTS =============

  @Post('import/grades')
  @ApiOperation({ summary: 'Import grades from Excel/CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Grades imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importGrades(
    @UploadedFile() file: Express.Multer.File,
    @Query('validate') validate?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const shouldValidate = validate === 'true';
    return this.importService.importGradesFromFile(file.buffer, shouldValidate);
  }

  @Post('import/attendance')
  @ApiOperation({ summary: 'Import attendance records from Excel/CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Attendance imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importAttendance(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.importService.importAttendanceFromFile(file.buffer);
  }

  @Post('import/students')
  @ApiOperation({ summary: 'Import students from Excel/CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Students imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.importService.importStudentsFromFile(file.buffer);
  }

  @Post('import/teachers')
  @ApiOperation({ summary: 'Import teachers from Excel/CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Teachers imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importTeachers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.importService.importTeachersFromFile(file.buffer);
  }

  @Post('import/classes')
  @ApiOperation({ summary: 'Import classes from Excel/CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Classes imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importClasses(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.importService.importClassesFromFile(file.buffer);
  }

  @Post('validate-import')
  @ApiOperation({ summary: 'Validate import data without actually importing (dry-run)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Validation completed' })
  @UseInterceptors(FileInterceptor('file'))
  async validateImport(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: 'grades' | 'attendance' | 'students',
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Parse file and validate without saving
    const XLSX = require('xlsx');
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (type === 'grades') {
      return this.importService.validateGradesData(data);
    }

    // Add validation for other types if needed
    return {
      isValid: true,
      errors: [],
      warnings: [],
      preview: data.slice(0, 10),
    };
  }

  // ============= BACKUP/RESTORE ENDPOINTS =============

  @Post('backup')
  @ApiOperation({ summary: 'Create database backup' })
  @ApiResponse({ status: 201, description: 'Backup created successfully' })
  async createBackup(@Body() options: BackupOptionsDto) {
    return this.backupService.createBackup(options);
  }

  @Get('backup/list')
  @ApiOperation({ summary: 'List all backups' })
  @ApiResponse({ status: 200, description: 'Backups list retrieved successfully' })
  async listBackups() {
    return this.backupService.listBackups();
  }

  @Post('restore/:backupId')
  @ApiOperation({ summary: 'Restore from backup' })
  @ApiResponse({ status: 200, description: 'Backup restored successfully' })
  async restoreBackup(@Param('backupId') backupId: string) {
    await this.backupService.restoreBackup(backupId);
    return {
      success: true,
      message: `Database restored from backup ${backupId}`,
    };
  }

  @Delete('backup/:backupId')
  @ApiOperation({ summary: 'Delete a backup' })
  @ApiResponse({ status: 200, description: 'Backup deleted successfully' })
  async deleteBackup(@Param('backupId') backupId: string) {
    await this.backupService.deleteBackup(backupId);
    return {
      success: true,
      message: `Backup ${backupId} deleted`,
    };
  }

  // ============= VALIDATION ENDPOINTS =============

  @Post('validate/grades')
  @ApiOperation({ summary: 'Validate grades data integrity' })
  @ApiResponse({ status: 200, description: 'Grades validation completed' })
  async validateGrades() {
    return this.validationService.validateGradesData();
  }

  @Post('validate/students')
  @ApiOperation({ summary: 'Validate students data integrity' })
  @ApiResponse({ status: 200, description: 'Students validation completed' })
  async validateStudents() {
    return this.validationService.validateStudentsData();
  }

  @Post('validate/attendance')
  @ApiOperation({ summary: 'Validate attendance data integrity' })
  @ApiResponse({ status: 200, description: 'Attendance validation completed' })
  async validateAttendance() {
    return this.validationService.validateAttendanceData();
  }

  @Get('integrity-check')
  @ApiOperation({ summary: 'Check overall data integrity' })
  @ApiResponse({ status: 200, description: 'Integrity check completed' })
  async checkIntegrity() {
    return this.validationService.checkDataIntegrity();
  }

  // ============= MIGRATION ENDPOINTS =============

  @Post('migrate/academic-year')
  @ApiOperation({ summary: 'Migrate to new academic year' })
  @ApiResponse({ status: 200, description: 'Migration completed successfully' })
  async migrateAcademicYear(@Body() options: MigrationOptionsDto) {
    return this.migrationService.migrateAcademicYear(options);
  }

  @Post('migrate/preview')
  @ApiOperation({ summary: 'Preview academic year migration without executing' })
  @ApiResponse({ status: 200, description: 'Migration preview generated' })
  async previewMigration(@Body() options: MigrationOptionsDto) {
    return this.migrationService.previewMigration(options);
  }
}
