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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradesDto } from './dto/query-grades.dto';
import { Grade } from './entities/grade.entity';

@ApiTags('Grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all grades with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Grades list retrieved successfully', type: [Grade] })
  findAll(@Query() queryDto: QueryGradesDto) {
    return this.gradesService.findAll(queryDto);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Count grades with filters' })
  @ApiResponse({ status: 200, description: 'Grades count retrieved successfully' })
  count(@Query() queryDto: QueryGradesDto) {
    return this.gradesService.count(queryDto);
  }

  @Get('stats/average/student/:studentId')
  @ApiOperation({ summary: 'Get average grade for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID (UUID)' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'trimester', required: false, description: 'Filter by trimester' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year' })
  @ApiResponse({ status: 200, description: 'Student average retrieved successfully' })
  getAverageByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('subjectId') subjectId?: string,
    @Query('trimester') trimester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.gradesService.getAverageByStudent(studentId, subjectId, trimester, academicYear);
  }

  @Get('stats/average/subject/:subjectId')
  @ApiOperation({ summary: 'Get average grade for a subject' })
  @ApiParam({ name: 'subjectId', description: 'Subject ID (UUID)' })
  @ApiQuery({ name: 'trimester', required: false, description: 'Filter by trimester' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year' })
  @ApiResponse({ status: 200, description: 'Subject average retrieved successfully' })
  getAverageBySubject(
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Query('trimester') trimester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.gradesService.getAverageBySubject(subjectId, trimester, academicYear);
  }

  @Get('stats/top-students')
  @ApiOperation({ summary: 'Get top performing students' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top students', example: 10 })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'trimester', required: false, description: 'Filter by trimester' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year' })
  @ApiResponse({ status: 200, description: 'Top students retrieved successfully' })
  getTopStudents(
    @Query('limit') limit?: number,
    @Query('subjectId') subjectId?: string,
    @Query('trimester') trimester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.gradesService.getTopStudents(limit || 10, subjectId, trimester, academicYear);
  }

  @Get('stats/distribution')
  @ApiOperation({ summary: 'Get grade distribution by ranges' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'trimester', required: false, description: 'Filter by trimester' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year' })
  @ApiResponse({ status: 200, description: 'Grade distribution retrieved successfully' })
  getGradeDistribution(
    @Query('subjectId') subjectId?: string,
    @Query('trimester') trimester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.gradesService.getGradeDistribution(subjectId, trimester, academicYear);
  }

  @Get('stats/by-evaluation-type')
  @ApiOperation({ summary: 'Get statistics by evaluation type' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year' })
  @ApiResponse({ status: 200, description: 'Statistics by evaluation type retrieved successfully' })
  getStatsByEvaluationType(
    @Query('studentId') studentId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.gradesService.getStatsByEvaluationType(studentId, subjectId, academicYear);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a grade by ID' })
  @ApiParam({ name: 'id', description: 'Grade ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Grade retrieved successfully', type: Grade })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new grade' })
  @ApiResponse({ status: 201, description: 'Grade created successfully', type: Grade })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple grades at once' })
  @ApiResponse({ status: 201, description: 'Grades created successfully', type: [Grade] })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  createBulk(@Body() createGradeDtos: CreateGradeDto[]) {
    return this.gradesService.createBulk(createGradeDtos);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a grade' })
  @ApiParam({ name: 'id', description: 'Grade ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully', type: Grade })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Update grade visibility to parents' })
  @ApiParam({ name: 'id', description: 'Grade ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Grade visibility updated successfully', type: Grade })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  updateVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('visibleToParents') visibleToParents: boolean,
  ) {
    return this.gradesService.updateVisibility(id, visibleToParents);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grade' })
  @ApiParam({ name: 'id', description: 'Grade ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Grade deleted successfully' })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradesService.remove(id);
  }
}
