import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  async getDashboard() {
    return { message: 'Analytics dashboard data' };
  }
}
