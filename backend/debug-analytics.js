const { AnalyticsService } = require('./dist/apps/api-gateway/src/modules/analytics/analytics.service');
const { Test } = require('@nestjs/testing');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { DashboardMetrics } = require('./dist/apps/api-gateway/src/modules/analytics/entities/dashboard-metrics.entity');

async function testDashboard() {
    const mockRepo = {
        query: async (q) => {
            const { Client } = require('pg');
            require('dotenv').config();
            const client = new Client({
                user: process.env.DATABASE_USER,
                host: process.env.DATABASE_HOST,
                database: process.env.DATABASE_NAME,
                password: process.env.DATABASE_PASSWORD,
                port: process.env.DATABASE_PORT,
            });
            await client.connect();
            try {
                const res = await client.query(q);
                return res.rows;
            } finally {
                await client.end();
            }
        }
    };

    const service = new AnalyticsService(mockRepo);
    const result = await service.getDashboard();
    console.log(JSON.stringify(result, null, 2));
}

testDashboard().catch(console.error);
