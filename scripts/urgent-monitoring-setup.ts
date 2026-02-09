// scripts/urgent-monitoring-setup.ts
// Configuration for Urgent Monitoring Setup

export const URGENT_MONITORING = {
    setup: [
        'Real-time error tracking',
        'Performance metrics (response time < 200ms)',
        'Database connection monitoring',
        'User authentication tracking',
        'API endpoint health checks'
    ],

    alerts: [
        { threshold: 'error_rate > 1%', action: 'SMS + Email' },
        { threshold: 'response_time > 500ms', action: 'Email alert' },
        { threshold: 'database_down > 1min', action: 'PagerDuty' },
        { threshold: 'user_login_failed > 5/min', action: 'Security alert' }
    ],

    endpoints: {
        health: 'https://kds-backend-api-production.perissosdigitals.workers.dev/api/v1/health',
        auth: 'https://kds-backend-api-production.perissosdigitals.workers.dev/api/v1/auth/login'
    }
};
