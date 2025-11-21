import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    memory: MemoryStatus;
  };
  version: string;
  environment: string;
}

interface ServiceStatus {
  status: 'up' | 'down';
  responseTime?: number;
  message?: string;
}

interface MemoryStatus {
  status: 'ok' | 'warning' | 'critical';
  usedMB: number;
  totalMB: number;
  percentage: number;
}

/**
 * Health Check Controller pour monitoring uptime
 * À utiliser avec UptimeRobot, BetterUptime, ou Pingdom
 */
@ApiTags('health')
@Controller()
@SkipThrottle() // Pas de rate limit sur les health checks
export class EnhancedHealthController {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  /**
   * Health check simple (pour uptime monitoring)
   * Retourne 200 si l'API est up
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check simple' })
  @ApiResponse({ status: 200, description: 'Service opérationnel' })
  @ApiResponse({ status: 503, description: 'Service indisponible' })
  async simpleHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check détaillé avec statut de tous les services
   */
  @Get('health/detailed')
  @ApiOperation({ summary: 'Health check détaillé' })
  @ApiResponse({ status: 200, description: 'Statut détaillé des services' })
  async detailedHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    // Vérifier la base de données
    const dbStatus = await this.checkDatabase();

    // Vérifier la mémoire
    const memoryStatus = this.checkMemory();

    // Statut global
    const allServicesUp = dbStatus.status === 'up';
    const memoryOk = memoryStatus.status !== 'critical';
    
    let globalStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (allServicesUp && memoryOk) {
      globalStatus = 'healthy';
    } else if (allServicesUp) {
      globalStatus = 'degraded';
    } else {
      globalStatus = 'unhealthy';
    }

    return {
      status: globalStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        api: {
          status: 'up',
          responseTime: Date.now() - startTime,
        },
        database: dbStatus,
        memory: memoryStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Readiness probe (Kubernetes)
   * Retourne 200 si l'app est prête à recevoir du trafic
   */
  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async readiness() {
    const dbStatus = await this.checkDatabase();
    
    if (dbStatus.status === 'down') {
      return {
        status: 'not ready',
        reason: 'Database unavailable',
      };
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Liveness probe (Kubernetes)
   * Retourne 200 si l'app est alive
   */
  @Get('health/live')
  @ApiOperation({ summary: 'Liveness probe' })
  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Vérifier la connexion à la base de données
   */
  private async checkDatabase(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      // Tenter une simple query
      await this.connection.query('SELECT 1');
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }

  /**
   * Vérifier l'utilisation de la mémoire
   */
  private checkMemory(): MemoryStatus {
    const memUsage = process.memoryUsage();
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((usedMB / totalMB) * 100);

    let status: 'ok' | 'warning' | 'critical';
    if (percentage < 70) {
      status = 'ok';
    } else if (percentage < 90) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return {
      status,
      usedMB,
      totalMB,
      percentage,
    };
  }
}
