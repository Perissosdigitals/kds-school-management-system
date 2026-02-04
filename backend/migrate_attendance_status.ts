import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load env vars from backend .env
config({ path: '.env' });

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'kds_school',
    entities: ['apps/api-gateway/src/modules/**/*.entity.ts'],
    synchronize: false,
});

async function migrate() {
    try {
        await dataSource.initialize();
        console.log('📦 Connected to database');

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            console.log('🔄 Starting migration of Attendance Statuses...');

            // Mapping: French -> English
            const mappings = {
                'Présent': 'present',
                'Absent': 'absent',
                'Retard': 'late',
                'Absent excusé': 'excused',
                'En retard': 'late' // specific variation found in logs
            };

            for (const [french, english] of Object.entries(mappings)) {
                console.log(`   Mapping '${french}' -> '${english}'...`);
                await queryRunner.query(
                    `UPDATE attendance SET status = '${english}' WHERE status = '${french}'`
                );
            }

            // Safety check: Are there any left?
            const remaining = await queryRunner.query(
                `SELECT DISTINCT status FROM attendance WHERE status NOT IN ('present', 'absent', 'late', 'excused')`
            );

            if (remaining.length > 0) {
                console.warn('⚠️  Warning: Unknown statuses remaining in DB:', remaining);
            } else {
                console.log('✅ All statuses migrated successfully!');
            }

            await queryRunner.commitTransaction();
            console.log('💾 Changes saved.');

        } catch (err) {
            console.error('❌ Migration failed:', err);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        await dataSource.destroy();
    }
}

migrate();
