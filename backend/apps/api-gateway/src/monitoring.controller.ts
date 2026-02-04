import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductionHealthService } from './common/monitoring/production-health.service';

@ApiTags('monitoring')
@Controller('health')
export class MonitoringController {
    constructor(private readonly healthService: ProductionHealthService) { }

    @Get()
    @ApiOperation({ summary: 'Vérification de santé simple pour le démarrage' })
    async health() {
        return { status: 'ok', timestamp: new Date() };
    }

    @Get('summary')
    @ApiOperation({ summary: 'Obtenir un résumé complet de la santé de production' })
    async getSummary() {
        return this.healthService.getHealthSummary();
    }
}
