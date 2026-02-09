// scripts/run-cloud-verification.ts
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const TEST_SUITES = [
    { name: 'cycle-auth', description: 'Authentication & Authorization' },
    { name: 'cycle-students', description: 'Student CRUD Operations' },
    { name: 'cycle-teachers', description: 'Teacher CRUD Operations' },
    { name: 'cycle-classes', description: 'Class Management' },
    { name: 'cycle-notes', description: 'Grades & Academic Records' },
    { name: 'cycle-attendance', description: 'Attendance Tracking' }
];

class CloudVerificationRunner {
    private results: any[] = [];

    async runAllTests() {
        console.log('🚀 LANCEMENT DES TESTS PRODUCTION CLOUDFLARE');

        for (const suite of TEST_SUITES) {
            try {
                console.log(`\n🔍 Exécution: ${suite.name} - ${suite.description}`);

                const startTime = Date.now();
                const output = execSync(
                    `BASE_URL=${process.env.BASE_URL} npx playwright test --project=${suite.name} --reporter=json`,
                    { encoding: 'utf-8', stdio: 'pipe' }
                );
                const duration = Date.now() - startTime;

                const result = JSON.parse(output);
                const passed = result.suites[0]?.specs.filter((s: any) => s.ok).length || 0;
                const total = result.suites[0]?.specs.length || 0;

                this.results.push({
                    suite: suite.name,
                    description: suite.description,
                    status: passed === total ? '✅ PASS' : '❌ FAIL',
                    passed,
                    total,
                    duration: `${duration}ms`,
                    timestamp: new Date().toISOString()
                });

                console.log(`   ${passed === total ? '✅' : '❌'} ${passed}/${total} tests passed (${duration}ms)`);

            } catch (error: any) {
                this.results.push({
                    suite: suite.name,
                    description: suite.description,
                    status: '❌ ERROR',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`   ❌ Test suite failed: ${error.message}`);
            }
        }

        return this.generateReport();
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            environment: 'cloudflare-production',
            url: process.env.BASE_URL,
            results: this.results,
            summary: {
                totalSuites: this.results.length,
                passedSuites: this.results.filter(r => r.status === '✅ PASS').length,
                totalTests: this.results.reduce((sum, r) => sum + (r.total || 0), 0),
                passedTests: this.results.reduce((sum, r) => sum + (r.passed || 0), 0),
                successRate: `${((this.results.filter(r => r.status === '✅ PASS').length / this.results.length) * 100).toFixed(1)}%`
            }
        };

        writeFileSync(`logs/verification/${process.env.TEST_TIMESTAMP || 'latest'}/report.json`, JSON.stringify(report, null, 2));
        return report;
    }
}

new CloudVerificationRunner().runAllTests().catch(console.error);
