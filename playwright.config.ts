import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration
 * Read from: E2E_TESTING_STUDY.md Section 1 (Infrastructure)
 * 
 * 4 Test Projects:
 * - cycle-notes: Tests N-001 to N-010 (Grades CRUD, calculations, reports)
 * - cycle-attendance: Tests A-001 to A-010 (Bulk entry, justifications, stats)
 * - cycle-data-management: Tests D-001 to D-010 (Export, import, backup, validation)
 * - cycle-multi-roles: Tests R-001 to R-010 (Admin, Teacher, Parent, Student RBAC)
 */
export default defineConfig({
  testDir: './e2e',

  // Test timeout: 30s per test (most should complete <10s)
  timeout: 30 * 1000,

  // Expect timeout: 5s for assertions
  expect: {
    timeout: 5000,
  },

  // Fail fast on CI
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Retries: 0 locally, 2 on CI
  retries: process.env.CI ? 2 : 0,

  // Workers: parallel execution
  workers: process.env.CI ? 2 : undefined,

  // Reporter: HTML for detailed results
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['json', { outputFile: 'e2e-results.json' }],
    ['list'],
  ],

  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // API URL
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },

    // Trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Viewport
    viewport: { width: 1280, height: 720 },
  },

  // 4 Test Projects for E2E Cycles
  projects: [
    // Setup project: generates auth states before running tests
    {
      name: 'setup',
      testMatch: /e2e\/auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'cycle-notes',
      testMatch: /e2e\/cycles\/cycle-notes\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/teacher.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'cycle-attendance',
      testMatch: /e2e\/cycles\/cycle-attendance\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/teacher.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'cycle-data-management',
      testMatch: /e2e\/cycles\/cycle-data-management\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'cycle-multi-roles',
      testMatch: /e2e\/cycles\/cycle-multi-roles\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },

    {
      name: 'cycle-students',
      testMatch: /e2e\/cycles\/cycle-students\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'cycle-auth',
      testMatch: /e2e\/cycles\/cycle-auth\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Auth tests manage their own authentication
      },
    },

    {
      name: 'cycle-teachers',
      testMatch: /e2e\/cycles\/cycle-teachers\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'cycle-classes',
      testMatch: /e2e\/cycles\/cycle-classes\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'cycle-enrollment',
      testMatch: /e2e\/cycles\/cycle-enrollment\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Development server (optional - désactivé car serveurs déjà lancés manuellement)
  // webServer: process.env.CI ? undefined : {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
