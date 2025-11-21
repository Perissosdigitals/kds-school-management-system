import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Service de hashing sécurisé pour les mots de passe
 * Utilise bcrypt avec salt rounds configurable
 */
@Injectable()
export class HashingService {
  private readonly saltRounds = 10;

  /**
   * Hash un mot de passe en clair
   * @param password - Mot de passe en clair
   * @returns Promise<string> - Hash bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare un mot de passe en clair avec un hash
   * @param password - Mot de passe en clair
   * @param hash - Hash bcrypt à comparer
   * @returns Promise<boolean> - true si le mot de passe correspond
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Vérifie si un hash bcrypt est valide
   * @param hash - String à vérifier
   * @returns boolean - true si c'est un hash bcrypt valide
   */
  isValidHash(hash: string): boolean {
    // Bcrypt hash format: $2a$10$... ou $2b$10$...
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(hash);
  }

  /**
   * Génère un mot de passe temporaire sécurisé
   * @param length - Longueur du mot de passe (défaut: 12)
   * @returns string - Mot de passe aléatoire
   */
  generateTemporaryPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}
