import { test, expect } from '../../fixtures/base';
import { TestHelpers } from '../../helpers/test-helpers';

/**
 * E2E Test Cycle: Classes CRUD Operations
 * Tests class management and student assignment
 */

test.describe('Classes Module - CRUD Operations', () => {

    test('C-001: Admin creates new class', async ({ page }) => {
        await page.goto('/classes');
        await expect(page.locator('h1, h2')).toContainText(/Classes|Salles/i);

        // Click add class button
        const addButton = page.locator('button:has-text("Ajouter"), button:has-text("Add"), button:has-text("Créer")').first();
        await addButton.click();

        // Wait for form
        await page.waitForSelector('form');

        // Fill class data
        const classData = {
            name: `CP-${Date.now()}`,
            gradeLevel: 'CP',
            academicYear: '2024-2025',
            capacity: '30',
        };

        await page.fill('input[name="name"]', classData.name);
        await page.selectOption('select[name="grade_level"], select[name="gradeLevel"]', classData.gradeLevel);
        await page.fill('input[name="academic_year"], input[name="academicYear"]', classData.academicYear);
        await page.fill('input[name="capacity"]', classData.capacity);

        // Submit
        const submitButton = page.locator('button[type="submit"]');
        const responsePromise = TestHelpers.waitForApiResponse(page, /\/api\/v1\/classes/, 'POST');

        await submitButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(201);

        // Verify success
        await TestHelpers.verifySuccessMessage(page);
    });

    test('C-002: Admin views class list', async ({ page }) => {
        await page.goto('/classes');

        // Wait for classes to load
        await TestHelpers.waitForTableRows(page, 'table, .class-grid, .class-list', 1);

        // Verify classes displayed
        const classElements = page.locator('table tbody tr, .class-card');
        const count = await classElements.count();
        expect(count).toBeGreaterThan(0);
    });

    test('C-003: Admin views class details with students', async ({ page }) => {
        await page.goto('/classes');

        // Click on first class
        const firstClass = page.locator('table tbody tr, .class-card').first();
        await firstClass.click();

        // Wait for detail page
        await page.waitForURL(/\/classes\/[\w-]+/);

        // Verify class information displayed
        const classInfo = page.locator('.class-detail, .class-info');
        await classInfo.waitFor({ state: 'visible' });

        // Verify students list
        const studentsList = page.locator('.students-list, table');
        await studentsList.waitFor({ state: 'visible' });
    });

    test('C-004: Admin assigns teacher to class', async ({ page }) => {
        await page.goto('/classes');

        // Click on first class
        const firstClass = page.locator('table tbody tr, .class-card').first();
        await firstClass.click();

        await page.waitForURL(/\/classes\/[\w-]+/);

        // Find assign teacher button
        const assignButton = page.locator('button:has-text("Assigner"), button:has-text("Assign Teacher")');

        if (await assignButton.isVisible()) {
            await assignButton.click();

            // Select teacher from dropdown
            const teacherSelect = page.locator('select[name="teacher"], select[name="teacherId"]');
            await teacherSelect.selectOption({ index: 1 }); // Select first available teacher

            // Confirm
            const confirmButton = page.locator('button[type="submit"], button:has-text("Confirm")');
            await confirmButton.click();

            // Verify success
            await TestHelpers.verifySuccessMessage(page);
        }
    });

    test('C-005: Admin updates class capacity', async ({ page }) => {
        await page.goto('/classes');

        // Click edit on first class
        const editButton = page.locator('button[title="Modifier"], button:has-text("Edit")').first();
        await editButton.click();

        // Wait for form
        await page.waitForSelector('form');

        // Update capacity
        await page.fill('input[name="capacity"]', '35');

        // Submit
        const updateButton = page.locator('button[type="submit"]');
        await updateButton.click();

        // Verify success
        await TestHelpers.verifySuccessMessage(page);
    });

    test('C-006: View class statistics', async ({ page }) => {
        await page.goto('/classes');

        // Click on first class
        const firstClass = page.locator('table tbody tr, .class-card').first();
        await firstClass.click();

        await page.waitForURL(/\/classes\/[\w-]+/);

        // Navigate to statistics tab if exists
        const statsTab = page.locator('button:has-text("Statistiques"), a:has-text("Statistics")');

        if (await statsTab.isVisible()) {
            await statsTab.click();
            await page.waitForTimeout(500);

            // Verify statistics displayed
            const statCards = page.locator('.stat-card, .metric');
            const count = await statCards.count();
            expect(count).toBeGreaterThan(0);
        }
    });
});
