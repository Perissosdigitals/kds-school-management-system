import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

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
      select: ['id', 'email', 'role', 'first_name', 'last_name', 'phone', 'is_active', 'last_login_at', 'created_at', 'updated_at'],
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

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.is_active = false;
    await this.usersRepository.save(user);
  }
}
