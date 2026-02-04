import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
    constructor(
        @InjectRepository(ActivityLog)
        private readonly activityLogRepository: Repository<ActivityLog>,
    ) { }

    async create(data: Partial<ActivityLog>): Promise<ActivityLog> {
        const log = this.activityLogRepository.create(data);
        return this.activityLogRepository.save(log);
    }

    async findAll(params: { category?: string; search?: string; page?: number; limit?: number }) {
        const { category, search, page = 1, limit = 100 } = params;
        const query = this.activityLogRepository.createQueryBuilder('log');

        if (category && category !== 'all') {
            query.andWhere('log.category = :category', { category });
        }

        if (search) {
            query.andWhere(
                '(log.user_name ILIKE :search OR log.action ILIKE :search OR log.details ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        query.orderBy('log.timestamp', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        return query.getMany();
    }
}
