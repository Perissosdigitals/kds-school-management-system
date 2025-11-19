import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectsDto } from './dto/query-subjects.dto';
import { Subject } from './entities/subject.entity';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subjects with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Subjects list retrieved successfully', type: [Subject] })
  findAll(@Query() queryDto: QuerySubjectsDto) {
    return this.subjectsService.findAll(queryDto);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Count subjects with filters' })
  @ApiResponse({ status: 200, description: 'Subjects count retrieved successfully' })
  count(@Query() queryDto: QuerySubjectsDto) {
    return this.subjectsService.count(queryDto);
  }

  @Get('stats/by-grade-level')
  @ApiOperation({ summary: 'Get subjects statistics grouped by grade level' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatsByGradeLevel() {
    return this.subjectsService.getStatsByGradeLevel();
  }

  @Get('stats/total-weekly-hours')
  @ApiOperation({ summary: 'Get total weekly hours for all active subjects' })
  @ApiResponse({ status: 200, description: 'Total weekly hours retrieved successfully' })
  getTotalWeeklyHours() {
    return this.subjectsService.getTotalWeeklyHours();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by ID' })
  @ApiParam({ name: 'id', description: 'Subject ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Subject retrieved successfully', type: Subject })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully', type: Subject })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully', type: Subject })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update subject active status' })
  @ApiParam({ name: 'id', description: 'Subject ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Subject status updated successfully', type: Subject })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.subjectsService.updateStatus(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectsService.remove(id);
  }
}
