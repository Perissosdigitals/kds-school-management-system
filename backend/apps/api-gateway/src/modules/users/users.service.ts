import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly activityLogService: ActivityLogService,
  ) { }

  async findAll(query: any): Promise<User[]> {
    const { role, isActive } = query;
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.first_name',
        'user.last_name',
        'user.phone',
        'user.is_active',
        'user.last_login_at',
        'user.created_at',
        'user.avatar_url',
        'user.custom_permissions',
      ]);

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.is_active = :isActive', { isActive: isActive === 'true' });
    }

    queryBuilder.orderBy('user.created_at', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'first_name', 'last_name', 'phone', 'is_active', 'last_login_at', 'created_at', 'updated_at', 'avatar_url', 'custom_permissions'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      email: createUserDto.email,
      password_hash: hashedPassword,
      role: createUserDto.role,
      first_name: createUserDto.firstName,
      last_name: createUserDto.lastName,
      phone: createUserDto.phone,
      is_active: true,
      custom_permissions: createUserDto.role === UserRole.FONDATRICE || createUserDto.role === UserRole.ADMIN ? null : {},
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email: updateUserDto.email } });
      if (existingUser) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
    }

    if (updateUserDto.password) {
      user.password_hash = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, {
      email: updateUserDto.email || user.email,
      role: updateUserDto.role || user.role,
      first_name: updateUserDto.firstName || user.first_name,
      last_name: updateUserDto.lastName || user.last_name,
      phone: updateUserDto.phone !== undefined ? updateUserDto.phone : user.phone,
      is_active: updateUserDto.isActive !== undefined ? updateUserDto.isActive : user.is_active,
    });

    const updatedUser = await this.usersRepository.save(user);

    // Log activity
    try {
      await this.activityLogService.create({
        user_id: user.id,
        user_name: `${user.first_name} ${user.last_name}`,
        user_role: user.role,
        action: 'Mise à jour utilisateur',
        category: 'auth',
        details: `Profil de l'utilisateur ${user.email} mis à jour`,
      });
    } catch (e) {
      console.warn('Failed to log user update activity:', e);
    }

    return updatedUser;
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.findOne(id);
    user.avatar_url = avatarUrl;
    return this.usersRepository.save(user);
  }

  async updatePermissions(id: string, permissions: any): Promise<User> {
    await this.usersRepository.update(id, { custom_permissions: permissions });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.is_active = false;
    await this.usersRepository.save(user);
  }
}
