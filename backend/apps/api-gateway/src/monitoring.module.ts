import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { ProductionHealthService } from './common/monitoring/production-health.service';
import { DashboardMetrics } from './modules/analytics/entities/dashboard-metrics.entity';
import { StorageModule } from './common/services/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DashboardMetrics]),
        StorageModule,
    ],
    controllers: [MonitoringController],
    providers: [ProductionHealthService],
    exports: [ProductionHealthService],
})
export class MonitoringModule { }
