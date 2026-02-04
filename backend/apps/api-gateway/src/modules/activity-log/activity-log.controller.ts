import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog } from './entities/activity-log.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Activities')
@Controller('activities')
export class ActivityLogController {
    constructor(private readonly activityLogService: ActivityLogService) { }

    @Post()
    @ApiOperation({ summary: 'Enregistrer une nouvelle activité' })
    async create(@Body() data: Partial<ActivityLog>) {
        return this.activityLogService.create(data);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Récupérer le journal d\'activités' })
    async findAll(
        @Query('category') category?: string,
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.activityLogService.findAll({ category, search, page, limit });
    }
}
