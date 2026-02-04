import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

// Ensure upload directories exist
const docDir = './uploads/documents';
if (!existsSync(docDir)) {
  mkdirSync(docDir, { recursive: true });
}
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { EntityType } from './entities/document.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Public()
  @Get('test-ping')
  @ApiOperation({ summary: 'Test route for debugging' })
  testPing() {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }

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

  @Post('sync/:studentId')
  @ApiOperation({ summary: 'Synchronize student documents (clean orphaned references)' })
  async syncStudentDocuments(@Param('studentId') studentId: string) {
    return this.documentsService.syncStudentDocuments(studentId);
  }

  @Public()
  @Get(':id/view')
  @ApiOperation({ summary: 'View document file' })
  async viewFile(@Param('id') id: string, @Query() query: any, @Res() res: Response) {
    try {
      const { data, contentType, fileName } = await this.documentsService.getFile(id);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', data.length);

      // Set headers to allow embedding in iframes/objects
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *; default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *;");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);

      return res.send(data);
    } catch (error) {
      console.error(`[Documents] Error serving file: ${id}`, error);
      return res.status(error.status || 500).json({
        message: error.message || 'Error retrieving file from storage'
      });
    }
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

  @Post('upload')
  @ApiOperation({ summary: 'Upload document file' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/i)) {
        return cb(new BadRequestException('Only PDF, Word, and Image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('studentId') studentId: string,
    @Body('type') type: string,
    @Body('title') title: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.documentsService.handleFileUpload(file, studentId, type, title);
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
