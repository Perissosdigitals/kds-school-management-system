import { test as setup } from '@playwright/test';
import { TEST_USERS } from './fixtures/data';

/**
 * Authentication Setup
 * Generates .auth/*.json files for each user role
 * These files contain authenticated browser state (cookies, localStorage)
 * Used by Playwright projects via storageState option
 */

// Admin authentication
setup('authenticate as admin', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', TEST_USERS.admin.email);
  await page.fill('input[name="password"]', TEST_USERS.admin.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  
  // Save authenticated state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
  console.log('✅ Admin auth saved to e2e/.auth/admin.json');
});

// Teacher authentication
setup('authenticate as teacher', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', TEST_USERS.teacher.email);
  await page.fill('input[name="password"]', TEST_USERS.teacher.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  await page.context().storageState({ path: 'e2e/.auth/teacher.json' });
  console.log('✅ Teacher auth saved to e2e/.auth/teacher.json');
});

// Parent authentication
setup('authenticate as parent', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', TEST_USERS.parent.email);
  await page.fill('input[name="password"]', TEST_USERS.parent.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  await page.context().storageState({ path: 'e2e/.auth/parent.json' });
  console.log('✅ Parent auth saved to e2e/.auth/parent.json');
});

// Student authentication
setup('authenticate as student', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', TEST_USERS.student.email);
  await page.fill('input[name="password"]', TEST_USERS.student.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  await page.context().storageState({ path: 'e2e/.auth/student.json' });
  console.log('✅ Student auth saved to e2e/.auth/student.json');
});
