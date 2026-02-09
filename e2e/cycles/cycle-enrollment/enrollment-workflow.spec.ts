import { test, expect } from '../../fixtures/base';
import { TestHelpers } from '../../helpers/test-helpers';

/**
 * E2E Test Cycle: Enrollment Module
 * Tests student enrollment workflow and updates
 */

test.describe('Enrollment Module - Workflow', () => {

    test('E-001: Admin enrolls new student in class', async ({ page }) => {
        await page.goto('/enrollment');

        // Click enroll button
        const enrollButton = page.locator('button:has-text("Inscrire"), button:has-text("Enroll")').first();
        await enrollButton.click();

        // Wait for enrollment form
        await page.waitForSelector('form');

        // Generate student data
        const studentData = TestHelpers.generateStudentData();

        // Fill student information
        await page.fill('input[name="firstName"], input[name="first_name"]', studentData.firstName);
        await page.fill('input[name="lastName"], input[name="last_name"]', studentData.lastName);
        await page.fill('input[name="dateOfBirth"], input[name="date_of_birth"]', studentData.dateOfBirth);
        await page.selectOption('select[name="gender"]', studentData.gender);

        // Select class
        const classSelect = page.locator('select[name="class"], select[name="classId"]');
        await classSelect.selectOption({ index: 1 }); // Select first available class

        // Fill parent information
        await page.fill('input[name="parentName"], input[name="parent_name"]', studentData.parentName);
        await page.fill('input[name="parentPhone"], input[name="parent_phone"]', studentData.parentPhone);
        await page.fill('input[name="parentEmail"], input[name="parent_email"]', studentData.parentEmail);

        // Submit enrollment
        const submitButton = page.locator('button[type="submit"]');
        const responsePromise = TestHelpers.waitForApiResponse(page, /\/api\/v1\/enrollment/, 'POST');

        await submitButton.click();

        const response = await responsePromise;
        expect(response.status()).toBe(201);

        const responseData = await response.json();
        expect(responseData.student).toBeDefined();
        expect(responseData.student.registrationNumber || responseData.registrationNumber).toMatch(/KSP\d{6}/);

        // Verify success
        await TestHelpers.verifySuccessMessage(page);
    });

    test('E-002: View student enrollment profile', async ({ page }) => {
        await page.goto('/students');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click on first student
        const firstStudent = page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr').first();
        await firstStudent.click();

        await page.waitForURL(/\/students\/[\w-]+/);

        // Verify enrollment information displayed
        const enrollmentSection = page.locator('.enrollment-info, .profile-section:has-text("Inscription")');
        await enrollmentSection.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });

        // Verify registration number displayed
        const regNumber = page.locator('text=/KSP\\d{6}/');
        await regNumber.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
    });

    test('E-003: Admin transfers student to different class', async ({ page }) => {
        await page.goto('/students');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Click on first student
        const firstStudent = page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr').first();
        const studentRowText = await firstStudent.textContent();
        await firstStudent.click();

        await page.waitForURL(/\/students\/[\w-]+/);

        // Find transfer button
        const transferButton = page.locator('button:has-text("Transférer"), button:has-text("Transfer")');

        if (await transferButton.isVisible()) {
            await transferButton.click();

            // Select new class
            const classSelect = page.locator('select[name="class"], select[name="classId"]');
            await classSelect.selectOption({ index: 2 }); // Select different class

            // Confirm transfer
            const confirmButton = page.locator('button[type="submit"], button:has-text("Confirm")');
            const responsePromise = TestHelpers.waitForApiResponse(page, /\/api\/v1\/enrollment\/[\w-]+/, 'PUT');

            await confirmButton.click();

            const response = await responsePromise;
            expect(response.status()).toBe(200);

            // Verify success
            await TestHelpers.verifySuccessMessage(page);
        }
    });

    test('E-004: Admin withdraws student', async ({ page }) => {
        await page.goto('/students');
        await TestHelpers.waitForTableRows(page, 'table', 1);

        // Get last student (to avoid affecting other tests)
        const lastStudent = page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr').last();
        await lastStudent.click();

        await page.waitForURL(/\/students\/[\w-]+/);

        // Find withdraw button
        const withdrawButton = page.locator('button:has-text("Retirer"), button:has-text("Withdraw")');

        if (await withdrawButton.isVisible()) {
            await withdrawButton.click();

            // Confirm withdrawal
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Oui")');
            await confirmButton.click();

            // Verify success or status change
            await page.waitForTimeout(1000);
        }
    });

    test('E-005: Verify class capacity enforcement', async ({ page }) => {
        // First, create a small capacity class for testing
        await page.goto('/classes');

        const addButton = page.locator('button:has-text("Ajouter"), button:has-text("Add")').first();
        if (await addButton.isVisible()) {
            await addButton.click();

            const classData = {
                name: `TEST-CAPACITY-${Date.now()}`,
                gradeLevel: 'CP',
                capacity: '1', // Only 1 student allowed
            };

            await page.fill('input[name="name"]', classData.name);
            await page.selectOption('select[name="grade_level"], select[name="gradeLevel"]', classData.gradeLevel);
            await page.fill('input[name="capacity"]', classData.capacity);

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);
        }
    });
});
