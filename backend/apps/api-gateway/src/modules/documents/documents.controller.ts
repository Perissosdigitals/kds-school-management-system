import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { EntityType } from './entities/document.entity';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents with filters' })
  async findAll(@Query() query: QueryDocumentDto) {
    return this.documentsService.findAll(query);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Count documents' })
  async count(@Query() query: QueryDocumentDto) {
    const count = await this.documentsService.count(query);
    return { count };
  }

  @Get('stats/by-type')
  @ApiOperation({ summary: 'Get statistics by document type' })
  async getStatsByType(@Query('entityType') entityType?: EntityType) {
    return this.documentsService.getStatsByType(entityType);
  }

  @Get('stats/by-entity-type')
  @ApiOperation({ summary: 'Get statistics by entity type' })
  async getStatsByEntityType() {
    return this.documentsService.getStatsByEntityType();
  }

  @Get('stats/storage')
  @ApiOperation({ summary: 'Get total storage used' })
  async getTotalStorageUsed(@Query('entityType') entityType?: EntityType) {
    return this.documentsService.getTotalStorageUsed(entityType);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired documents' })
  async getExpiredDocuments() {
    return this.documentsService.getExpiredDocuments();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring documents' })
  async getExpiringDocuments(@Query('days') days?: number) {
    return this.documentsService.getExpiringDocuments(days ? parseInt(days.toString()) : 30);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all documents for a student' })
  async getStudentDocuments(@Param('studentId') studentId: string) {
    return this.documentsService.getStudentDocuments(studentId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get all documents for a teacher' })
  async getTeacherDocuments(@Param('teacherId') teacherId: string) {
    return this.documentsService.getTeacherDocuments(teacherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create document' })
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple documents' })
  async createBulk(@Body() createDocumentDtos: CreateDocumentDto[]) {
    return this.documentsService.createBulk(createDocumentDtos);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document' })
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update document status' })
  async updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.documentsService.updateStatus(id, isActive);
  }

  @Patch(':id/download')
  @ApiOperation({ summary: 'Increment download count' })
  async incrementDownloadCount(@Param('id') id: string) {
    return this.documentsService.incrementDownloadCount(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
