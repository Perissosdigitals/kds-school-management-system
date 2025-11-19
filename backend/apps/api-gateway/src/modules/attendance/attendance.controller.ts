import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { Attendance } from './entities/attendance.entity';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attendance records with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully', type: [Attendance] })
  findAll(@Query() queryDto: QueryAttendanceDto) {
    return this.attendanceService.findAll(queryDto);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Count attendance records with filters' })
  @ApiResponse({ status: 200, description: 'Attendance count retrieved successfully' })
  count(@Query() queryDto: QueryAttendanceDto) {
    return this.attendanceService.count(queryDto);
  }

  @Get('stats/absence-rate')
  @ApiOperation({ summary: 'Get absence rate statistics' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Absence rate retrieved successfully' })
  getAbsenceRate(
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getAbsenceRate(studentId, classId, startDate, endDate);
  }

  @Get('stats/by-status')
  @ApiOperation({ summary: 'Get statistics by attendance status' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Statistics by status retrieved successfully' })
  getStatsByStatus(
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getStatsByStatus(classId, startDate, endDate);
  }

  @Get('stats/most-absent')
  @ApiOperation({ summary: 'Get students with most absences' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of students', example: 10 })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Most absent students retrieved successfully' })
  getMostAbsentStudents(
    @Query('limit') limit?: number,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getMostAbsentStudents(limit || 10, classId, startDate, endDate);
  }

  @Get('stats/unjustified')
  @ApiOperation({ summary: 'Get unjustified absences' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Unjustified absences retrieved successfully' })
  getUnjustifiedAbsences(
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getUnjustifiedAbsences(studentId, classId, startDate, endDate);
  }

  @Get('daily/:classId')
  @ApiOperation({ summary: 'Get daily attendance for a class' })
  @ApiParam({ name: 'classId', description: 'Class ID (UUID)' })
  @ApiQuery({ name: 'date', description: 'Date (YYYY-MM-DD)', example: '2024-11-18' })
  @ApiResponse({ status: 200, description: 'Daily attendance retrieved successfully', type: [Attendance] })
  getDailyAttendance(@Param('classId', ParseUUIDPipe) classId: string, @Query('date') date: string) {
    return this.attendanceService.getDailyAttendance(classId, date);
  }

  @Get('pattern/:studentId')
  @ApiOperation({ summary: 'Get attendance pattern for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID (UUID)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Attendance pattern retrieved successfully' })
  getAttendancePattern(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getAttendancePattern(studentId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Attendance record retrieved successfully', type: Attendance })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({ status: 201, description: 'Attendance record created successfully', type: Attendance })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple attendance records at once' })
  @ApiResponse({ status: 201, description: 'Attendance records created successfully', type: [Attendance] })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  createBulk(@Body() createAttendanceDtos: CreateAttendanceDto[]) {
    return this.attendanceService.createBulk(createAttendanceDtos);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiParam({ name: 'id', description: 'Attendance ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Attendance record updated successfully', type: Attendance })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Patch(':id/justification')
  @ApiOperation({ summary: 'Update justification status for an absence' })
  @ApiParam({ name: 'id', description: 'Attendance ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Justification updated successfully', type: Attendance })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  updateJustification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isJustified') isJustified: boolean,
    @Body('justificationDocument') justificationDocument?: string,
  ) {
    return this.attendanceService.updateJustification(id, isJustified, justificationDocument);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiParam({ name: 'id', description: 'Attendance ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Attendance record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.remove(id);
  }
}
