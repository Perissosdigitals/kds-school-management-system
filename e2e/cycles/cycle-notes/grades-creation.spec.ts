import { test, expect } from '../../fixtures/base';
import { TEST_CLASSES, TEST_SUBJECTS, TEST_STUDENTS, TEST_GRADE_DATA, API_ENDPOINTS } from '../../fixtures/data';

/**
 * E2E Test: N-001 - Teacher creates single grade
 * Reference: E2E_TEST_MATRIX.md Line 50
 * Priority: P0 Critical
 * 
 * Scenario:
 * Teacher navigates to grade entry form, selects class/subject,
 * enters single grade, submits successfully
 * 
 * Expected:
 * - Grade saved to database
 * - HTTP 201 response
 * - Success feedback displayed
 * - Grade ID returned
 */
test.describe('Cycle 1: Notes - Single Grade Creation', () => {
  test('N-001: Teacher creates single grade successfully', async ({ page }) => {
    // Step 1: Login as teacher
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'teacher@kds.ci');
    await page.fill('input[type="password"], input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Step 2: Navigate to grade entry
    await page.goto('/grades/entry');
    await expect(page.locator('h2')).toContainText('Saisie des Notes');

    // Step 3: Select class
    await page.selectOption('select[name="class"]', TEST_CLASSES.cp.id);
    await page.waitForTimeout(500); // Wait for subjects to load

    // Step 4: Select subject (Français)
    await page.selectOption('select[name="subject"]', TEST_SUBJECTS.francais.id);
    await page.waitForTimeout(500); // Wait for students to load

    // Step 5: Verify students loaded (30 students)
    const studentsTable = page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr');
    await expect(studentsTable).toHaveCount(30);

    // Step 6: Fill evaluation details
    await page.selectOption('select[name="trimester"]', 'Trimestre 1');
    await page.selectOption('select[name="evaluationType"]', 'Devoir Surveillé');
    await page.fill('input[name="title"]', 'DS Lecture - La Petite Poule Rousse');
    await page.fill('input[name="date"]', '2024-11-20');
    await page.fill('input[name="maxValue"]', '20');
    await page.fill('input[name="coefficient"]', '2');

    // Step 7: Enter grade for first student (Aya Koné)
    const firstStudentRow = studentsTable.first();
    await expect(firstStudentRow.locator('td').nth(1)).toContainText('Koné Aya');
    await firstStudentRow.locator('input[type="number"]').first().fill('16');
    await firstStudentRow.locator('input[type="text"]').last().fill('Très bon travail');

    // Step 8: Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Step 9: Wait for success message
    const successMessage = page.locator('.bg-green-50');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    await expect(successMessage).toContainText('1 note(s) enregistrée(s) avec succès');

    // Step 10: Verify via API
    const token = await page.evaluate(() => localStorage.getItem('ksp_token'));
    const response = await page.request.get(
      `${process.env.API_URL || 'http://localhost:3002'}${API_ENDPOINTS.grades.getByClass}?classId=${TEST_CLASSES.cp.id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    expect(response.status()).toBe(200);
    const grades = await response.json();
    expect(grades.length).toBeGreaterThan(0);

    const lastGrade = grades[grades.length - 1];
    expect(lastGrade.value).toBe(16);
    expect(lastGrade.maxValue).toBe(20);
    expect(lastGrade.coefficient).toBe(2);
    expect(lastGrade.title).toBe('DS Lecture - La Petite Poule Rousse');
  });
});

/**
 * E2E Test: N-002 - Teacher creates bulk grades (30 students)
 * Reference: E2E_TEST_MATRIX.md Line 51
 * Priority: P0 Critical
 * 
 * Scenario:
 * Teacher selects class, enters grades for all 30 students,
 * submits bulk, verifies all saved
 * 
 * Expected:
 * - 30 grades created atomically
 * - HTTP 201 response
 * - Bulk operation <1 minute
 * - All grades retrievable via API
 */
test.describe('Cycle 1: Notes - Bulk Grade Creation', () => {
  test('N-002: Teacher creates bulk grades for 30 students', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'teacher@kds.ci');
    await page.fill('input[type="password"], input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Navigate to grade entry
    await page.goto('/grades/entry');

    // Select class and subject
    await page.selectOption('select[name="class"]', TEST_CLASSES.ce1.id);
    await page.waitForTimeout(500);
    await page.selectOption('select[name="subject"]', TEST_SUBJECTS.mathematiques.id);
    await page.waitForTimeout(500);

    // Fill evaluation details
    await page.fill('input[name="title"]', 'Composition Trimestre 1');
    await page.fill('input[name="date"]', '2024-11-24');
    await page.fill('input[name="maxValue"]', '20');
    await page.fill('input[name="coefficient"]', '3');

    // Enter grades for all 30 students
    const studentsTable = page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr');
    const studentCount = await studentsTable.count();

    expect(studentCount).toBe(30);

    // Fill grades (varying from 10 to 20)
    for (let i = 0; i < studentCount; i++) {
      const row = studentsTable.nth(i);
      const grade = 10 + (i % 11); // Grades: 10, 11, 12, ..., 20
      await row.locator('input[type="number"]').first().fill(grade.toString());
    }

    // Record start time
    const startTime = Date.now();

    // Submit bulk
    await page.locator('button[type="submit"]').click();

    // Wait for success
    const successMessage = page.locator('.bg-green-50');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    await expect(successMessage).toContainText('30 note(s) enregistrée(s)');

    // Record end time
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify performance: <60s (1 minute)
    expect(duration).toBeLessThan(60000);
    console.log(`Bulk creation took ${duration}ms`);

    // Verify all grades via API
    const token = await page.evaluate(() => localStorage.getItem('ksp_token'));
    const response = await page.request.get(
      `http://localhost:3001${API_ENDPOINTS.grades.getByClass}?classId=${TEST_CLASSES.ce1.id}&trimester=Trimestre 1`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    expect(response.status()).toBe(200);
    const grades = await response.json();

    // Should have at least 30 grades for this class/trimester
    const compositionGrades = grades.filter((g: any) =>
      g.title === 'Composition Trimestre 1' && g.subjectId === TEST_SUBJECTS.mathematiques.id
    );

    expect(compositionGrades.length).toBe(30);
  });
});

/**
 * E2E Test: N-003 - Grade validation (value <= maxValue)
 * Reference: E2E_TEST_MATRIX.md Line 52
 * Priority: P0 Critical
 * 
 * Scenario:
 * Teacher attempts to enter grade > maxValue,
 * system rejects with validation error
 * 
 * Expected:
 * - Validation error displayed
 * - Grade NOT saved
 * - HTTP 400 response
 */
test.describe('Cycle 1: Notes - Validation', () => {
  test('N-003: System rejects grade > maxValue', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'teacher@kds.ci');
    await page.fill('input[type="password"], input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Navigate to grade entry
    await page.goto('/grades/entry');

    // Select class and subject
    await page.selectOption('select[name="class"]', TEST_CLASSES.cp.id);
    await page.waitForTimeout(500);
    await page.selectOption('select[name="subject"]', TEST_SUBJECTS.francais.id);
    await page.waitForTimeout(500);

    // Fill evaluation details with maxValue = 20
    await page.fill('input[name="title"]', 'Test Validation');
    await page.fill('input[name="maxValue"]', '20');

    // Enter INVALID grade (25 > 20)
    const firstRow = page.locator('table tbody tr, .data-table tbody tr, [data-testid*="table"] tbody tr').first();
    await firstRow.locator('input[type="number"]').first().fill('25');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Expect error message
    const errorMessage = page.locator('.bg-red-50');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText('Note invalide');
    await expect(errorMessage).toContainText('25');
    await expect(errorMessage).toContainText('entre 0 et 20');

    // Verify grade NOT saved via API
    const token = await page.evaluate(() => localStorage.getItem('ksp_token'));
    const response = await page.request.get(
      `${process.env.API_URL || 'http://localhost:3002'}${API_ENDPOINTS.grades.getByClass}?classId=${TEST_CLASSES.cp.id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    const grades = await response.json();
    const testValidationGrades = grades.filter((g: any) => g.title === 'Test Validation');

    expect(testValidationGrades.length).toBe(0); // No grades with this title
  });
});
