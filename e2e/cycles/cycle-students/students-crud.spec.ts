import { test, expect } from '../../fixtures/base';
import { TestHelpers } from '../../helpers/test-helpers';

/**
 * E2E Test Cycle: Students CRUD Operations
 * Tests complete student lifecycle: Create, Read, Update, Delete
 */

test.describe('Students Module - CRUD Operations', () => {
    let createdStudentId: string;

    test('S-001: Admin creates new student successfully', async ({ page }) => {
        console.log('--- S-001 START ---');
        // Navigate to dashboard first
        await page.goto('/');

        // Click on "Inscription Élève" in sidebar
        console.log('Clicking Inscription Élève sidebar link...');
        await page.getByRole('link', { name: "Inscription Élève" }).click();

        // Wait for the form or heading
        console.log('Waiting for Inscription heading or form...');
        await page.waitForSelector('h1, h2, form', { timeout: 15000 });

        // Fill student data
        const studentData = TestHelpers.generateStudentData();
        console.log('Filling form for student:', studentData.firstName, studentData.lastName);

        await page.fill('input[name="firstName"]', studentData.firstName);
        await page.fill('input[name="lastName"]', studentData.lastName);
        await page.fill('input[name="dob"]', studentData.dob);
        await page.fill('input[name="birthPlace"]', studentData.birthPlace);
        await page.selectOption('select[name="gender"]', studentData.gender);
        await page.fill('input[name="nationality"]', studentData.nationality);
        await page.fill('input[name="address"]', studentData.address);
        await page.fill('input[name="phone"]', studentData.phone);
        await page.fill('input[name="email"]', studentData.email);

        // Academic info
        await page.selectOption('select[name="gradeLevel"]', studentData.gradeLevel);

        // Wait for classes to load if gradeLevel is selected
        await page.waitForTimeout(1500);
        const classSelect = page.locator('select[name="classId"]');
        if (await classSelect.isVisible() && await classSelect.isEnabled()) {
            const options = await classSelect.locator('option').count();
            if (options > 1) {
                console.log('Selecting first available class...');
                await classSelect.selectOption({ index: 1 });
            }
        }

        // Parent information / Emergency contact
        await page.fill('input[name="emergencyContactName"]', studentData.emergencyContactName);
        await page.fill('input[name="emergencyContactPhone"]', studentData.emergencyContactPhone);

        // Submit form
        console.log('Submitting form...');
        const submitButton = page.locator('button[type="submit"]:has-text("Enregistrer")');

        // Listen for API response
        const responsePromise = TestHelpers.waitForApiResponse(page, /\/students/, 'POST');

        await submitButton.click();

        const response = await responsePromise;
        console.log('API Response status:', response.status());
        if (response.status() >= 400) {
            console.error('API Error Body:', await response.text());
        }
        expect(response.status()).toBe(201);

        const responseData = await response.json();
        createdStudentId = responseData.id;

        // Verify success message
        console.log('Verifying success message...');
        await TestHelpers.verifySuccessMessage(page, 'avec succès');
    });

    test('S-002: Admin views student details', async ({ page }) => {
        console.log('--- S-002 START ---');
        // Navigate to dashboard and then to management
        await page.goto('/');
        await page.getByRole('link', { name: "Gestion Élèves" }).click();

        // Wait for table to load
        console.log('Waiting for students table...');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click on first student name to view details
        console.log('Clicking on first student link...');
        const firstStudentLink = page.locator('table tbody tr td').nth(1);
        await firstStudentLink.click();

        // Verify detail page or view loaded
        console.log('Waiting for detail view...');
        await page.waitForSelector('.flex.flex-col.gap-6, .student-detail, h2', { timeout: 15000 });
    });

    test('S-003: Admin updates student information', async ({ page }) => {
        console.log('--- S-003 START ---');
        // Navigate to management
        await page.goto('/');
        await page.getByRole('link', { name: "Gestion Élèves" }).click();
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click edit button for first student
        console.log('Clicking edit button...');
        const editButton = page.locator('button[title*="Modifier"]').first();
        await editButton.click();

        // Wait for edit form
        console.log('Waiting for edit form...');
        await page.waitForSelector('form', { timeout: 10000 });

        // Update address
        const newAddress = '456 Avenue de la République, Abidjan';
        console.log('Updating address to:', newAddress);
        await page.fill('input[name="address"]', newAddress);

        // Submit update
        const updateButton = page.locator('button[type="submit"]:has-text("Enregistrer")');
        const responsePromise = TestHelpers.waitForApiResponse(page, /\/students\//, 'PUT');

        await updateButton.click();

        const response = await responsePromise;
        console.log('API Update status:', response.status());
        if (response.status() >= 400) {
            console.error('API Update Error Body:', await response.text());
        }
        expect(response.status()).toBe(200);

        // Verify success
        console.log('Verifying update success message...');
        await TestHelpers.verifySuccessMessage(page, 'succès');
    });

    test('S-004: Admin searches for students', async ({ page }) => {
        console.log('--- S-004 START ---');
        await page.goto('/');
        await page.getByRole('link', { name: "Gestion Élèves" }).click();
        await expect(page.locator('table')).toBeVisible({ timeout: 15000 });

        // Find search input
        const searchInput = page.locator('input[placeholder*="Recherche"], input[placeholder*="Search"]').first();

        if (await searchInput.isVisible()) {
            console.log('Performing search for "Test"...');
            await searchInput.fill('Test');
            await page.waitForTimeout(1500);

            // Verify table has results
            const tableRows = page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr');
            const count = await tableRows.count();
            console.log('Search results count:', count);
            expect(count).toBeGreaterThanOrEqual(1);
        }
    });

    test('S-005: Admin deletes student (soft delete)', async ({ page }) => {
        console.log('--- S-005 START ---');
        await page.goto('/');
        await page.getByRole('link', { name: "Gestion Élèves" }).click();
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Find delete button
        console.log('Clicking delete button...');
        const deleteButton = page.locator('button[title*="Supprimer"]').first();

        if (await deleteButton.isVisible()) {
            const responsePromise = TestHelpers.waitForApiResponse(page, /\/students\//, 'DELETE');

            console.log('Setting up dialog handler...');
            page.once('dialog', dialog => dialog.accept());

            await deleteButton.click();

            const response = await responsePromise;
            console.log('API Delete status:', response.status());
            expect([200, 204]).toContain(response.status());

            await page.waitForTimeout(1500);
            const newCount = await page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr').count();
            console.log('New count after delete:', newCount);
        }
    });
});
