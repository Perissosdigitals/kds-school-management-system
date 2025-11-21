import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../hashing.service';

/**
 * Tests unitaires pour HashingService
 */
describe('HashingService', () => {
  let service: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashingService],
    }).compile();

    service = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should handle empty passwords', async () => {
      const hash = await service.hashPassword('test');
      const result = await service.comparePassword('', hash);

      expect(result).toBe(false);
    });
  });

  describe('isValidHash', () => {
    it('should return true for valid bcrypt hash', async () => {
      const hash = await service.hashPassword('test');
      const isValid = service.isValidHash(hash);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid hash format', () => {
      const invalidHashes = [
        'plaintext',
        'short',
        'not-a-hash-at-all',
        '$2a$invalid',
        '',
      ];

      invalidHashes.forEach(hash => {
        expect(service.isValidHash(hash)).toBe(false);
      });
    });
  });

  describe('generateTemporaryPassword', () => {
    it('should generate password with default length', () => {
      const password = service.generateTemporaryPassword();

      expect(password).toBeDefined();
      expect(password.length).toBe(12);
    });

    it('should generate password with custom length', () => {
      const length = 20;
      const password = service.generateTemporaryPassword(length);

      expect(password.length).toBe(length);
    });

    it('should generate different passwords each time', () => {
      const password1 = service.generateTemporaryPassword();
      const password2 = service.generateTemporaryPassword();

      expect(password1).not.toBe(password2);
    });

    it('should contain mix of characters', () => {
      const password = service.generateTemporaryPassword(100);

      // Vérifie qu'il contient différents types de caractères
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[0-9]/); // numbers
    });
  });
});
