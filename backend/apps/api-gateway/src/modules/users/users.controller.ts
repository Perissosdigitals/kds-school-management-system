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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Response } from 'express';

// Ensure upload directories exist
const avatarDir = './uploads/users/avatars';
if (!existsSync(avatarDir)) {
  mkdirSync(avatarDir, { recursive: true });
}

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post(':id/avatar')
  @ApiOperation({ summary: 'Uploader l\'avatar d\'un utilisateur' })
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/users/avatars',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
        return cb(new BadRequestException('Seules les images (JPG, PNG, WEBP) sont autorisées !'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('L\'avatar est requis');
    }
    const avatarUrl = `/api/v1/users/avatar/${file.filename}`;
    return this.usersService.updateAvatar(id, avatarUrl);
  }

  @Public()
  @Get('avatar/:filename')
  @ApiOperation({ summary: 'Servir l\'avatar d\'un utilisateur' })
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const rawPath = join('uploads', 'users', 'avatars', filename);
    let filePath = resolve(process.cwd(), rawPath);

    if (!existsSync(filePath)) {
      // Fallback
      filePath = resolve(process.cwd(), '..', '..', rawPath);
    }

    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'Avatar non trouvé' });
    }

    return res.sendFile(filePath);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs', type: [User] })
  @ApiQuery({ name: 'role', required: false, description: 'Filtrer par rôle' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filtrer par statut actif' })
  async findAll(@Query() query: any): Promise<User[]> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fondatrice', 'admin', 'directrice', 'director', 'enseignant', 'comptable', 'agent', 'manager', 'accountant', 'agent_admin')
  @ApiOperation({ summary: 'Mettre à jour les permissions d\'un utilisateur' })
  async updatePermissions(
    @Param('id') id: string,
    @Body('permissions') permissions: any
  ) {
    return this.usersService.updatePermissions(id, permissions);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: User })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Désactiver un utilisateur (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur désactivé avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'Utilisateur désactivé avec succès' };
  }
}
