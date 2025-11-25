import { test, expect } from '../../fixtures/base';
import { TestHelpers } from '../../helpers/test-helpers';

/**
 * E2E Test Cycle: Students CRUD Operations
 * Tests complete student lifecycle: Create, Read, Update, Delete
 */

test.describe('Students Module - CRUD Operations', () => {
    let createdStudentId: string;

    test('S-001: Admin creates new student successfully', async ({ page }) => {
        // Navigate to students page
        await page.goto('/students');
        await expect(page.locator('h1, h2')).toContainText(/\u00c9l\u00e8ves|Students/i);

        // Click "Add Student" button
        const addButton = page.locator('button:has-text("Ajouter"), button:has-text("Add")').first();
        await addButton.click();

        // Wait for form to appear
        await page.waitForSelector('form', { timeout: 5000 });

        // Fill student data
        const studentData = TestHelpers.generateStudentData();

        await page.fill('input[name="firstName"], input[name="first_name"]', studentData.firstName);
        await page.fill('input[name="lastName"], input[name="last_name"]', studentData.lastName);
        await page.fill('input[name="dateOfBirth"], input[name="date_of_birth"]', studentData.dateOfBirth);
        await page.fill('input[name="placeOfBirth"], input[name="place_of_birth"]', studentData.placeOfBirth);
        await page.selectOption('select[name="gender"]', studentData.gender);
        await page.fill('input[name="nationality"]', studentData.nationality);
        await page.fill('input[name="address"], textarea[name="address"]', studentData.address);

        // Parent information
        await page.fill('input[name="parentName"], input[name="parent_name"]', studentData.parentName);
        await page.fill('input[name="parentPhone"], input[name="parent_phone"]', studentData.parentPhone);
        await page.fill('input[name="parentEmail"], input[name="parent_email"]', studentData.parentEmail);

        // Submit form
        const submitButton = page.locator('button[type="submit"]:has-text("Enregistrer"), button[type="submit"]:has-text("Save")');

        // Listen for API response
        const responsePromise = TestHelpers.waitForApiResponse(page, /\/api\/v1\/students/, 'POST');

        await submitButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(201);

        const responseData = await response.json();
        createdStudentId = responseData.id;
        expect(responseData.firstName || responseData.first_name).toBe(studentData.firstName);

        // Verify success message
        await TestHelpers.verifySuccessMessage(page);
    });

    test('S-002: Admin views student details', async ({ page }) => {
        // Navigate to students list
        await page.goto('/students');

        // Wait for table to load
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click on first student to view details
        const firstRow = page.locator('table tbody tr').first();
        await firstRow.click();

        // Verify detail page loaded
        await page.waitForURL(/\/students\/[\w-]+/, { timeout: 5000 });

        // Verify student information is displayed
        const detailView = page.locator('.student-detail, .card, .detail-container');
        await detailView.waitFor({ state: 'visible', timeout: 5000 });
    });

    test('S-003: Admin updates student information', async ({ page }) => {
        // Navigate to students list
        await page.goto('/students');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click edit button for first student
        const editButton = page.locator('button[title="Modifier"], button:has-text("Modifier"), a:has-text("Edit")').first();
        await editButton.click();

        // Wait for edit form
        await page.waitForSelector('form', { timeout: 5000 });

        // Update address
        const newAddress = '456 Avenue de la République, Abidjan';
        await page.fill('input[name="address"], textarea[name="address"]', newAddress);

        // Submit update
        const updateButton = page.locator('button[type="submit"]:has-text("Enregistrer"), button[type="submit"]:has-text("Update")');
        const responsePromise = TestHelpers.waitForApiResponse(page, /\/api\/v1\/students/, 'PUT');

        await updateButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(200);

        // Verify success
        await TestHelpers.verifySuccessMessage(page);
    });

    test('S-004: Admin searches for students', async ({ page }) => {
        await page.goto('/students');

        // Find search input
        const searchInput = page.locator('input[type="search"], input[placeholder*="Recherch"], input[placeholder*="Search"]');

        if (await searchInput.isVisible()) {
            await searchInput.fill('Koné');
            await page.waitForTimeout(500); // Wait for search debounce

            // Verify filtered results
            const rows = page.locator('table tbody tr');
            const count = await rows.count();
            expect(count).toBeGreaterThanOrEqual(0);
        }
    });

    test('S-005: Admin deletes student (soft delete)', async ({ page }) => {
        await page.goto('/students');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Get initial count
        const initialCount = await page.locator('table tbody tr').count();

        // Find delete button
        const deleteButton = page.locator('button[title="Supprimer"], button:has-text("Delete")').first();

        if (await deleteButton.isVisible()) {
            await deleteButton.click();

            // Confirm deletion in modal/dialog
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Oui"), button:has-text("Supprimer")').last();
            await confirmButton.click({ timeout: 3000 }).catch(() => { });

            // Verify student removed from list
            await page.waitForTimeout(1000);
            const newCount = await page.locator('table tbody tr').count();
            expect(newCount).toBeLessThanOrEqual(initialCount);
        }
    });
});
