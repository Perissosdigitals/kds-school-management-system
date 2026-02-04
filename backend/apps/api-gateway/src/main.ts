import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { initializeSentry } from './sentry.config';

// Initialize Sentry before anything else
initializeSentry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'frame-ancestors': ["'self'", 'http://localhost:5173', 'http://localhost:5174'],
          'upgrade-insecure-requests': null,
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      frameguard: false,
      hsts: false,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('KSP School Management System API')
    .setDescription(`
# API Complète pour la Gestion Scolaire KSP

Cette API fournit tous les endpoints nécessaires pour gérer une école complète.

## Authentification

Tous les endpoints protégés nécessitent un JWT Bearer Token.

### Flow d'authentification:
1. **POST /auth/login** - Obtenir access_token + refresh_token
2. **Ajouter le header**: \`Authorization: Bearer <access_token>\`
3. **Refresh**: POST /auth/refresh avec le refresh_token quand l'access_token expire

## Rate Limiting

- Global: 60 requêtes/minute
- Login: 5 tentatives/minute

## Versions

- **v1.0**: Version initiale avec tous les modules CRUD
- **Sécurité**: Bcrypt, JWT, Refresh Tokens, Rate Limiting
- **Monitoring**: Sentry, Health Checks

## Support

- **Email**: support@ksp-school.ci
- **Documentation**: https://docs.ksp-school.ci
`)
    .setVersion('1.0.0')
    .setContact('KSP School', 'https://ksp-school.ci', 'support@ksp-school.ci')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', '🔐 Authentification et autorisation')
    .addTag('students', '👨‍🎓 Gestion des élèves')
    .addTag('teachers', '👩‍🏫 Gestion des enseignants')
    .addTag('classes', '🏫 Gestion des classes')
    .addTag('grades', '📝 Gestion des notes')
    .addTag('timetable', '📅 Emploi du temps')
    .addTag('attendance', '✅ Présences et absences')
    .addTag('documents', '📄 Documents élèves')
    .addTag('finance', '💰 Gestion financière')
    .addTag('import', '📊 Import/Export de données')
    .addTag('analytics', '📈 Tableaux de bord et rapports')
    .addTag('users', '👤 Gestion des utilisateurs')
    .addTag('subjects', '📚 Matières')
    .addTag('school-life', '🎉 Vie scolaire')
    .addTag('inventory', '📦 Inventaire')
    .addTag('health', '❤️ Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'KSP API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 KSP API Gateway running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
