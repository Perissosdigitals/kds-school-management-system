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
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || 'admin@kds.edu');
  await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'admin123');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 15000 });

  // Save authenticated state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
  console.log('✅ Admin auth saved to e2e/.auth/admin.json');
});

// Teacher authentication
setup.skip('authenticate as teacher', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.TEACHER_EMAIL || 'jean.dupont@teacher.kds.edu');
  await page.fill('input[type="password"]', process.env.TEACHER_PASSWORD || 'teacher123'); // Assuming default password for cloud env users
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|home)/, { timeout: 15000 });
  await page.context().storageState({ path: 'e2e/.auth/teacher.json' });
  console.log('✅ Teacher auth saved to e2e/.auth/teacher.json');
});

// Parent authentication
setup.skip('authenticate as parent', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.PARENT_EMAIL || 'parent1@example.com'); // From CLOUDFLARE_DEPLOYMENT_COMPLETE.md
  await page.fill('input[type="password"]', process.env.PARENT_PASSWORD || 'parent123');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|home)/, { timeout: 15000 });
  await page.context().storageState({ path: 'e2e/.auth/parent.json' });
  console.log('✅ Parent auth saved to e2e/.auth/parent.json');
});

// Student authentication
setup.skip('authenticate as student', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.STUDENT_EMAIL || 'alice.dubois@student.kds.edu'); // From CLOUDFLARE_DEPLOYMENT_COMPLETE.md
  await page.fill('input[type="password"]', process.env.STUDENT_PASSWORD || 'student123');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|home)/, { timeout: 15000 });
  await page.context().storageState({ path: 'e2e/.auth/student.json' });
  console.log('✅ Student auth saved to e2e/.auth/student.json');
});
