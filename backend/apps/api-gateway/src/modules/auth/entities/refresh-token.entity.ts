import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Table des refresh tokens pour permettre le renouvellement des JWT
 * Améliore la sécurité en limitant la durée de vie des access tokens
 */
@Entity('refresh_tokens')
@Index(['userId', 'isRevoked'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'replaced_by_token', type: 'uuid', nullable: true })
  replacedByToken: string | null;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Vérifie si le token est encore valide
   */
  isValid(): boolean {
    return !this.isRevoked && new Date() < this.expiresAt;
  }

  /**
   * Vérifie si le token a expiré
   */
  isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }
}
