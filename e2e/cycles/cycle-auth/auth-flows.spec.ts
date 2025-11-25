import { test, expect } from '../../fixtures/base';
import { TestHelpers } from '../../helpers/test-helpers';

/**
 * E2E Test Cycle: Authentication Module
 * Tests login, logout, password change, and profile management
 */

test.describe('Auth Module - User Authentication', () => {

    test('AUTH-001: User logs in successfully', async ({ page }) => {
        await page.goto('/login');

        // Fill login form
        await page.fill('input[name="email"]', 'admin@ksp.com');
        await page.fill('input[name="password"]', 'Admin123!');

        // Submit and wait for redirect
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Verify redirect to dashboard
        await page.waitForURL(/\/(dashboard|home)/, { timeout: 5000 });

        // Verify auth token stored
        const token = await TestHelpers.getAuthToken(page);
        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(20);
    });

    test('AUTH-002: Invalid credentials show error', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"]', 'wrong@email.com');
        await page.fill('input[name="password"]', 'wrongpassword');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Verify error message
        await TestHelpers.verifyErrorMessage(page);

        // Verify still on login page
        expect(page.url()).toContain('/login');
    });

    test('AUTH-003: User views own profile', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@ksp.com');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|home)/);

        // Navigate to profile
        const profileLink = page.locator('a[href*="profile"], button:has-text("Profile"), button:has-text("Profil")').first();
        await profileLink.click({ timeout: 3000 }).catch(async () => {
            // Alternative: navigate directly
            await page.goto('/profile');
        });

        // Verify profile page loaded
        await page.waitForSelector('.profile, .user-profile, [data-testid="profile"]', { timeout: 5000 });

        // Verify user information displayed
        const email = await page.locator('text=/admin@ksp.com/i, [data-label="email"], .email').first().textContent();
        expect(email).toContain('admin@ksp');
    });

    test('AUTH-004: User changes password', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'teacher@ksp.com');
        await page.fill('input[name="password"]', 'Teacher123!');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|home)/);

        // Navigate to password change
        await page.goto('/profile/password').catch(async () => {
            // Try alternate route
            await page.goto('/settings/password');
        });

        // Fill password change form
        const currentPassword = 'Teacher123!';
        const newPassword = 'NewTeacher123!';

        await page.fill('input[name="currentPassword"], input[name="current_password"]', currentPassword);
        await page.fill('input[name="newPassword"], input[name="new_password"]', newPassword);
        await page.fill('input[name="confirmPassword"], input[name="confirm_password"]', newPassword);

        // Submit
        const submitButton = page.locator('button[type="submit"]:has-text("Change"), button[type="submit"]:has-text("Modifier")');

        if (await submitButton.isVisible()) {
            const responsePromise = TestHelpers.waitForApiResponse(page, /\/api\/v1\/auth\/password/, 'PUT');
            await submitButton.click();

            const response = await responsePromise;
            expect(response.status()).toBe(200);

            // Verify success
            await TestHelpers.verifySuccessMessage(page);

            // Change password back for future tests
            await page.fill('input[name="currentPassword"], input[name="current_password"]', newPassword);
            await page.fill('input[name="newPassword"], input[name="new_password"]', currentPassword);
            await page.fill('input[name="confirmPassword"], input[name="confirm_password"]', currentPassword);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);
        }
    });

    test('AUTH-005: User logs out successfully', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@ksp.com');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|home)/);

        // Find and click logout button
        const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Déconnexion"), a:has-text("Logout")').first();
        await logoutButton.click();

        // Verify redirected to login
        await page.waitForURL(/\/login/, { timeout: 5000 });

        // Verify token removed
        const token = await page.evaluate(() => localStorage.getItem('access_token'));
        expect(token).toBeNull();
    });

    test('AUTH-006: Protected routes redirect to login', async ({ page, context }) => {
        // Clear all authentication
        await context.clearCookies();
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());

        // Try to access protected route
        await page.goto('/students');

        // Should redirect to login
        await page.waitForURL(/\/login/, { timeout: 5000 });
    });
});
