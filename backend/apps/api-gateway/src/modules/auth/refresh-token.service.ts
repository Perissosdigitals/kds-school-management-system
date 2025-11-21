import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

/**
 * Service de gestion des refresh tokens
 * Gère la création, validation, rotation et révocation des tokens
 */
@Injectable()
export class RefreshTokenService {
  // Durée de vie du refresh token : 7 jours
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Génère un nouveau refresh token pour un utilisateur
   * @param user - Utilisateur
   * @param ipAddress - Adresse IP du client
   * @param userAgent - User agent du client
   * @returns Promise<RefreshToken>
   */
  async generateRefreshToken(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshToken> {
    // Générer un token cryptographiquement sécurisé
    const token = crypto.randomBytes(64).toString('hex');

    // Calculer la date d'expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Valide un refresh token
   * @param token - Token à valider
   * @returns Promise<RefreshToken | null>
   */
  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      return null;
    }

    // Vérifier si le token est valide
    if (!refreshToken.isValid()) {
      return null;
    }

    return refreshToken;
  }

  /**
   * Rotation du refresh token (génère un nouveau et révoque l'ancien)
   * @param oldToken - Ancien token
   * @param ipAddress - Adresse IP
   * @param userAgent - User agent
   * @returns Promise<RefreshToken>
   */
  async rotateRefreshToken(
    oldToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshToken | null> {
    const oldRefreshToken = await this.validateRefreshToken(oldToken);

    if (!oldRefreshToken) {
      return null;
    }

    // Créer un nouveau token
    const newRefreshToken = await this.generateRefreshToken(
      oldRefreshToken.user,
      ipAddress,
      userAgent,
    );

    // Révoquer l'ancien token
    oldRefreshToken.isRevoked = true;
    oldRefreshToken.revokedAt = new Date();
    oldRefreshToken.replacedByToken = newRefreshToken.id;
    await this.refreshTokenRepository.save(oldRefreshToken);

    return newRefreshToken;
  }

  /**
   * Révoque un refresh token
   * @param token - Token à révoquer
   * @returns Promise<boolean>
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (!refreshToken) {
      return false;
    }

    refreshToken.isRevoked = true;
    refreshToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(refreshToken);

    return true;
  }

  /**
   * Révoque tous les refresh tokens d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Promise<number> - Nombre de tokens révoqués
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );

    return result.affected || 0;
  }

  /**
   * Nettoie les tokens expirés et révoqués (à exécuter périodiquement)
   * @returns Promise<number> - Nombre de tokens supprimés
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  /**
   * Obtient tous les refresh tokens actifs d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Promise<RefreshToken[]>
   */
  async getUserActiveTokens(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });
  }
}
