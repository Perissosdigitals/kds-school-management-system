import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Tests E2E pour l'authentification
 * Teste le flow complet: login, refresh token, logout
 */
describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@kds-school.ci',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@kds-school.ci');

      // Sauvegarder les tokens pour les tests suivants
      accessToken = response.body.access_token;
      refreshToken = response.body.refresh_token;
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@kds-school.ci',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@kds-school.ci',
          password: 'password',
        })
        .expect(401);
    });

    it('should fail with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@kds-school.ci',
        })
        .expect(400);
    });

    it('should enforce rate limiting (max 5 attempts)', async () => {
      // Faire 6 tentatives rapides
      const attempts = Array.from({ length: 6 }, (_, i) =>
        request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'test@kds-school.ci',
            password: 'wrong',
          })
      );

      const responses = await Promise.all(attempts);
      
      // La 6ème devrait être throttled
      const throttledResponse = responses[responses.length - 1];
      expect(throttledResponse.status).toBe(429);
    }, 15000);
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refresh_token: refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body.refresh_token).not.toBe(refreshToken); // Token rotation

      // Mettre à jour le refresh token
      refreshToken = response.body.refresh_token;
    });

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refresh_token: 'invalid-token',
        })
        .expect(401);
    });

    it('should fail with missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({
          refresh_token: refreshToken,
        })
        .expect(204);
    });

    it('should not be able to use revoked refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refresh_token: refreshToken,
        })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    let validAccessToken: string;

    beforeAll(async () => {
      // Login pour obtenir un nouveau token
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@kds-school.ci',
          password: 'admin123',
        });

      validAccessToken = response.body.access_token;
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);
    });

    it('should fail to access protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/students')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
