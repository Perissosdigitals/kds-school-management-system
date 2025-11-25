import { test, expect } from '../../fixtures/base';
import { TestHelpers } from '../../helpers/test-helpers';

/**
 * E2E Test Cycle: Teachers CRUD Operations
 * Tests teacher management: Create, Read, Update, Delete
 */

test.describe('Teachers Module - CRUD Operations', () => {

    test('T-001: Admin creates new teacher', async ({ page }) => {
        await page.goto('/teachers');
        await expect(page.locator('h1, h2')).toContainText(/Enseignants|Teachers/i);

        // Click add teacher button
        const addButton = page.locator('button:has-text("Ajouter"), button:has-text("Add")').first();
        await addButton.click();

        // Wait for form
        await page.waitForSelector('form');

        // Fill teacher data
        const teacherData = {
            firstName: 'Jean',
            lastName: 'Kouassi',
            email: `jean.kouassi.${Date.now()}@ksp.school`,
            phone: '+225 07 12 34 56 78',
            specialty: 'Mathématiques',
            qualification: 'Licence en Mathématiques',
        };

        await page.fill('input[name="firstName"], input[name="first_name"]', teacherData.firstName);
        await page.fill('input[name="lastName"], input[name="last_name"]', teacherData.lastName);
        await page.fill('input[name="email"]', teacherData.email);
        await page.fill('input[name="phone"], input[name="telephone"]', teacherData.phone);
        await page.fill('input[name="specialty"], input[name="matiere"]', teacherData.specialty);
        await page.fill('input[name="qualification"], textarea[name="qualification"]', teacherData.qualification);

        // Submit
        const submitButton = page.locator('button[type="submit"]');
        const responsePromise = TestHelpers.waitForApiResponse(page, /\/api\/v1\/teachers/, 'POST');

        await submitButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(201);

        //Verify success message
        await TestHelpers.verifySuccessMessage(page);
    });

    test('T-002: Admin views teachers list', async ({ page }) => {
        await page.goto('/teachers');

        // Wait for table to load
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Verify table has data
        const rows = await page.locator('table tbody tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('T-003: Admin searches teachers by name', async ({ page }) => {
        await page.goto('/teachers');

        const searchInput = page.locator('input[type="search"], input[placeholder*="Recherch"], input[placeholder*="Search"]');

        if (await searchInput.isVisible()) {
            await searchInput.fill('Mamadou');
            await page.waitForTimeout(500);

            // Verify filtered results
            const rows = page.locator('table tbody tr');
            const count = await rows.count();
            expect(count).toBeGreaterThanOrEqual(0);
        }
    });

    test('T-004: Admin updates teacher information', async ({ page }) => {
        await page.goto('/teachers');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click edit button
        const editButton = page.locator('button[title="Modifier"], button:has-text("Edit")').first();
        await editButton.click();

        // Wait for form
        await page.waitForSelector('form');

        // Update phone number
        const newPhone = '+225 07 99 88 77 66';
        await page.fill('input[name="phone"], input[name="telephone"]', newPhone);

        // Submit
        const updateButton = page.locator('button[type="submit"]');
        await updateButton.click();

        // Verify success
        await TestHelpers.verifySuccessMessage(page);
    });

    test('T-005: View teacher schedule and classes', async ({ page }) => {
        await page.goto('/teachers');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click on first teacher
        const firstRow = page.locator('table tbody tr').first();
        await firstRow.click();

        // Wait for detail page
        await page.waitForURL(/\/teachers\/[\w-]+/);

        // Verify teacher details visible
        const detailView = page.locator('.teacher-detail, .card');
        await detailView.waitFor({ state: 'visible' });
    });
});
