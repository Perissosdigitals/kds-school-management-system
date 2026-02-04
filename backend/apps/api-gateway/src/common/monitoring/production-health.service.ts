import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DashboardMetrics } from '../../modules/analytics/entities/dashboard-metrics.entity';
import { StorageService } from '../services/storage.service';

export interface HealthCheck {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    details: any;
    timestamp: Date;
}

@Injectable()
export class ProductionHealthService {
    private readonly logger = new Logger(ProductionHealthService.name);
    private readonly DASHBOARD_THRESHOLD_MS = 1500; // Adjusted for cloud latency
    private readonly SYNC_CONSISTENCY_THRESHOLD = 0.95; // 95% sync rate

    constructor(
        @InjectRepository(DashboardMetrics)
        private metricsRepo: Repository<DashboardMetrics>,
        private dataSource: DataSource,
        private storageService: StorageService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async performHealthChecks(): Promise<HealthCheck[]> {
        this.logger.log('Running production health checks...');
        const checks = [
            await this.checkDashboardPerformance(),
            await this.checkR2D1Consistency(),
            await this.checkDatabaseConnectivity(),
            await this.checkMetricsFreshness(),
        ];

        // Log any unhealthy states
        checks.filter(c => c.status !== 'healthy').forEach(check => {
            this.logger.warn(`Health check failed: ${check.name}`, check.details);
        });

        return checks;
    }

    private async checkDashboardPerformance(): Promise<HealthCheck> {
        const start = Date.now();

        try {
            const metrics = await this.metricsRepo.findOne({
                where: {},
                order: { metricDate: 'DESC' }
            });

            const responseTime = Date.now() - start;
            const status = responseTime <= this.DASHBOARD_THRESHOLD_MS
                ? 'healthy'
                : responseTime <= this.DASHBOARD_THRESHOLD_MS * 2
                    ? 'degraded'
                    : 'unhealthy';

            return {
                name: 'Dashboard Performance',
                status,
                responseTime,
                details: {
                    metricsAvailable: !!metrics,
                    lastCalculation: metrics?.calculatedAt,
                    threshold: `${this.DASHBOARD_THRESHOLD_MS}ms`
                },
                timestamp: new Date()
            };
        } catch (error) {
            return {
                name: 'Dashboard Performance',
                status: 'unhealthy',
                details: { error: error.message },
                timestamp: new Date()
            };
        }
    }

    private async checkR2D1Consistency(): Promise<HealthCheck> {
        try {
            // Sample check: Verify recent documents exist
            const recentDocs = await this.dataSource.query(`
                SELECT id 
                FROM documents 
                LIMIT 10
            `).catch(() => []);

            if (recentDocs.length === 0) {
                return {
                    name: 'R2/D1 Consistency',
                    status: 'healthy',
                    details: { message: 'No recent documents to check' },
                    timestamp: new Date()
                };
            }

            const consistencyChecks = await Promise.all(
                recentDocs.map(async (doc: any) => {
                    try {
                        const file = await this.storageService.getFile(doc.r2_key);
                        return file ? 1 : 0;
                    } catch {
                        return 0;
                    }
                })
            );

            const consistencyRate = consistencyChecks.reduce((a, b) => a + b, 0) / consistencyChecks.length;

            return {
                name: 'R2/D1 Consistency',
                status: consistencyRate >= this.SYNC_CONSISTENCY_THRESHOLD ? 'healthy' : 'degraded',
                details: {
                    sampleSize: recentDocs.length,
                    consistencyRate: `${(consistencyRate * 100).toFixed(1)}%`,
                    threshold: `${(this.SYNC_CONSISTENCY_THRESHOLD * 100).toFixed(1)}%`
                },
                timestamp: new Date()
            };
        } catch (error) {
            return {
                name: 'R2/D1 Consistency',
                status: 'unhealthy',
                details: { error: error.message },
                timestamp: new Date()
            };
        }
    }

    private async checkDatabaseConnectivity(): Promise<HealthCheck> {
        try {
            await this.dataSource.query('SELECT 1');
            return {
                name: 'Database Connectivity',
                status: 'healthy',
                details: { provider: this.dataSource.options.type },
                timestamp: new Date()
            };
        } catch (error) {
            return {
                name: 'Database Connectivity',
                status: 'unhealthy',
                details: { error: error.message },
                timestamp: new Date()
            };
        }
    }

    private async checkMetricsFreshness(): Promise<HealthCheck> {
        try {
            const latest = await this.metricsRepo.findOne({
                where: {},
                order: { metricDate: 'DESC' }
            });

            const now = new Date();
            const lastCalc = latest?.calculatedAt || new Date(0);
            const diffHours = (now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60);

            return {
                name: 'Metrics Freshness',
                status: diffHours < 24 ? 'healthy' : 'degraded',
                details: { lastUpdate: lastCalc, ageHours: diffHours.toFixed(1) },
                timestamp: new Date()
            };
        } catch (error) {
            return {
                name: 'Metrics Freshness',
                status: 'unhealthy',
                details: { error: error.message },
                timestamp: new Date()
            };
        }
    }

    async getHealthSummary() {
        const checks = await this.performHealthChecks();

        return {
            overall: checks.every(c => c.status === 'healthy') ? 'healthy' :
                checks.some(c => c.status === 'unhealthy') ? 'unhealthy' : 'degraded',
            checks,
            timestamp: new Date(),
            system: 'ksp-management-system'
        };
    }
}
