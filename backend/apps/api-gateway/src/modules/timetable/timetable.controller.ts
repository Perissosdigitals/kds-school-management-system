import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { UpdateTimetableSlotDto } from './dto/update-timetable-slot.dto';
import { QueryTimetableSlotsDto } from './dto/query-timetable-slots.dto';
import { TimetableSlot } from './entities/timetable-slot.entity';

@ApiTags('Timetable')
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  @ApiOperation({ summary: 'Get all timetable slots with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Timetable slots list retrieved successfully', type: [TimetableSlot] })
  findAll(@Query() queryDto: QueryTimetableSlotsDto) {
    return this.timetableService.findAll(queryDto);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Count timetable slots with filters' })
  @ApiResponse({ status: 200, description: 'Timetable slots count retrieved successfully' })
  count(@Query() queryDto: QueryTimetableSlotsDto) {
    return this.timetableService.count(queryDto);
  }

  @Get('class/:classId/schedule')
  @ApiOperation({ summary: 'Get weekly schedule for a class' })
  @ApiParam({ name: 'classId', description: 'Class ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Weekly schedule retrieved successfully', type: [TimetableSlot] })
  getWeeklyScheduleByClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.timetableService.getWeeklyScheduleByClass(classId, academicYear);
  }

  @Get('teacher/:teacherId/schedule')
  @ApiOperation({ summary: 'Get weekly schedule for a teacher' })
  @ApiParam({ name: 'teacherId', description: 'Teacher ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Weekly schedule retrieved successfully', type: [TimetableSlot] })
  getWeeklyScheduleByTeacher(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.timetableService.getWeeklyScheduleByTeacher(teacherId, academicYear);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a timetable slot by ID' })
  @ApiParam({ name: 'id', description: 'Timetable slot ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Timetable slot retrieved successfully', type: TimetableSlot })
  @ApiResponse({ status: 404, description: 'Timetable slot not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.timetableService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new timetable slot' })
  @ApiResponse({ status: 201, description: 'Timetable slot created successfully', type: TimetableSlot })
  @ApiResponse({ status: 400, description: 'Invalid input data or time conflict' })
  @ApiResponse({ status: 409, description: 'Schedule conflict detected' })
  create(@Body() createSlotDto: CreateTimetableSlotDto) {
    return this.timetableService.create(createSlotDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a timetable slot' })
  @ApiParam({ name: 'id', description: 'Timetable slot ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Timetable slot updated successfully', type: TimetableSlot })
  @ApiResponse({ status: 404, description: 'Timetable slot not found' })
  @ApiResponse({ status: 409, description: 'Schedule conflict detected' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSlotDto: UpdateTimetableSlotDto,
  ) {
    return this.timetableService.update(id, updateSlotDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update timetable slot active status' })
  @ApiParam({ name: 'id', description: 'Timetable slot ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Timetable slot status updated successfully', type: TimetableSlot })
  @ApiResponse({ status: 404, description: 'Timetable slot not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.timetableService.updateStatus(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timetable slot' })
  @ApiParam({ name: 'id', description: 'Timetable slot ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Timetable slot deleted successfully' })
  @ApiResponse({ status: 404, description: 'Timetable slot not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.timetableService.remove(id);
  }
}
