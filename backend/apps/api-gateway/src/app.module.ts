import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { GradesModule } from './modules/grades/grades.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ImportModule } from './modules/import/import.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthController } from './health.controller';
import { EnhancedHealthController } from './health-enhanced.controller';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { SeedModule } from './database/seeds/seed.module';
import { UsersModule } from './modules/users/users.module';
import { SchoolLifeModule } from './modules/school-life/school-life.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting (60 requêtes par minute par défaut)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 secondes
      limit: 60,  // 60 requêtes max
    }]),

    // Database (skip if not available)
    ...(process.env.DATABASE_HOST
      ? [
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            username: process.env.DATABASE_USER || 'kds_admin',
            password: process.env.DATABASE_PASSWORD || 'kds_secure_password',
            database: process.env.DATABASE_NAME || 'kds_school_db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV === 'development',
            logging: process.env.NODE_ENV === 'development',
          }),
        ]
      : []),

    // Feature modules
    AuthModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    GradesModule,
    TimetableModule,
    AttendanceModule,
    DocumentsModule,
    FinanceModule,
    ImportModule,
    AnalyticsModule,
    SubjectsModule,
    UsersModule,
    SchoolLifeModule,
    InventoryModule,
    EnrollmentModule,
    SeedModule,
  ],
  controllers: [HealthController, EnhancedHealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Active le rate limiting globalement
    },
  ],
})
export class AppModule {}
