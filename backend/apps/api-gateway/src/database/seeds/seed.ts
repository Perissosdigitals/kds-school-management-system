import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    console.log('🚀 Starting seed process...\n');
    const result = await seedService.seed();

    console.log('\n📊 Seeding Summary:');
    console.log('═══════════════════════════════════');
    console.log(`👤 Users: ${result.users}`);
    console.log(`👨‍🏫 Teachers: ${result.teachers}`);
    console.log(`🏫 Classes: ${result.classes}`);
    console.log(`📚 Subjects: ${result.subjects}`);
    console.log(`👨‍🎓 Students: ${result.students}`);
    console.log(`📅 Timetable Slots: ${result.timetableSlots}`);
    console.log(`📊 Grades: ${result.grades}`);
    console.log(`✅ Attendance Records: ${result.attendance}`);
    console.log(`💰 Transactions: ${result.transactions}`);
    console.log(`📄 Documents: ${result.documents}`);
    console.log('═══════════════════════════════════');
    console.log('\n🎉 All done! Database is ready for testing.');
    console.log('\n📝 Test credentials:');
    console.log('   Email: admin@ksp-school.com');
    console.log('   Password: admin123\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
