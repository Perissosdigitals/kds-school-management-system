import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { TEST_USERS, API_ENDPOINTS } from './data';

/**
 * Authentication Helper
 * Handles login flow for all user roles
 */
export async function loginAs(
  page: Page,
  role: 'admin' | 'teacher' | 'parent' | 'student'
): Promise<void> {
  const user = TEST_USERS[role];
  
  // Navigate to login page
  await page.goto('/login');
  
  // Fill credentials
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 5000 });
  
  // Verify token stored
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  expect(token).toBeTruthy();
}

/**
 * API Helper
 * Makes authenticated API requests
 */
export async function apiRequest(
  page: Page,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<any> {
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  
  const response = await page.request.fetch(
    `http://localhost:3001${endpoint}`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data: data ? JSON.stringify(data) : undefined,
    }
  );
  
  return {
    status: response.status(),
    data: response.ok() ? await response.json() : null,
  };
}

/**
 * Extended Test with Fixtures
 */
export const test = base.extend({
  // Authenticated pages for each role
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'e2e/.auth/admin.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'e2e/.auth/teacher.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  parentPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'e2e/.auth/parent.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'e2e/.auth/student.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
