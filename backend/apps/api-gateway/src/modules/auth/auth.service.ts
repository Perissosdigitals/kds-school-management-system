import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HashingService } from './hashing.service';
import { RefreshTokenService } from './refresh-token.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private hashingService: HashingService,
    private refreshTokenService: RefreshTokenService,
    private activityLogService: ActivityLogService,
  ) { }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersRepository.createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email: loginDto.email })
      .getOne();

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashingService.comparePassword(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.last_login_at = new Date();
    await this.usersRepository.save(user);

    // Log login activity
    try {
      await this.activityLogService.create({
        user_id: user.id,
        user_name: `${user.first_name} ${user.last_name}`,
        user_role: user.role,
        action: 'Connexion au système',
        category: 'auth',
        details: `Utilisateur ${user.email} s'est connecté`,
      });
    } catch (e) {
      console.warn('Failed to log login activity:', e);
    }

    // Générer access token et refresh token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user,
      ipAddress,
      userAgent,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      expires_in: 86400, // 24 heures en secondes
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  }

  async refreshAccessToken(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const newRefreshToken = await this.refreshTokenService.rotateRefreshToken(
      refreshToken,
      ipAddress,
      userAgent,
    );

    if (!newRefreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = newRefreshToken.user;
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken.token,
      expires_in: 86400,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const token = await this.refreshTokenService.validateRefreshToken(refreshToken);
    if (token) {
      try {
        await this.activityLogService.create({
          user_id: token.user.id,
          user_name: `${token.user.first_name} ${token.user.last_name}`,
          user_role: token.user.role,
          action: 'Déconnexion du système',
          category: 'auth',
          details: `Utilisateur ${token.user.email} s'est déconnecté`,
        });
      } catch (e) {
        console.warn('Failed to log logout activity:', e);
      }
    }
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async getUserProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user || !user.password_hash) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.hashingService.comparePassword(
      changePasswordDto.currentPassword,
      user.password_hash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and save new password
    const newPasswordHash = await this.hashingService.hashPassword(changePasswordDto.newPassword);
    user.password_hash = newPasswordHash;
    await this.usersRepository.save(user);

    // Revoke all refresh tokens for security
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }
}
