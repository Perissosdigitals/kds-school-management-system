import { test, expect } from '../../fixtures/base';
import { TEST_CLASSES, API_ENDPOINTS, PERFORMANCE_THRESHOLDS } from '../../fixtures/data';

/**
 * E2E Test: D-001 - Export grades to Excel
 * Reference: E2E_TEST_MATRIX.md Line 70
 * Priority: P0 Critical
 * 
 * Scenario:
 * Admin selects grades export, chooses Excel format,
 * applies filters, downloads file successfully
 * 
 * Expected:
 * - File downloaded in .xlsx format
 * - Export completes <5s for 500 records
 * - File contains expected data
 */
test.describe('Cycle 3: Data Management - Export', () => {
  test('D-001: Admin exports grades to Excel', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kds.ci');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Navigate to data export
    await page.goto('/data/export');
    await expect(page.locator('h2')).toContainText('Export de Données');

    // Select data type: Grades
    await page.click('button:has-text("Notes")');
    await expect(page.locator('button:has-text("Notes")')).toHaveClass(/border-blue-500/);

    // Select format: Excel
    await page.click('button:has-text("Excel")');
    await expect(page.locator('button:has-text("Excel")')).toHaveClass(/border-green-500/);

    // Apply filters
    await page.fill('input[name="academicYear"]', '2024-2025');
    await page.selectOption('select[name="trimester"]', 'Trimestre 1');

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Record start time
    const startTime = Date.now();

    // Click export
    await page.click('button:has-text("Exporter")');

    // Wait for download
    const download = await downloadPromise;

    // Record end time
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify performance: <5s (PERFORMANCE_THRESHOLDS.api.export)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.api.export);
    console.log(`Export took ${duration}ms`);

    // Verify filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/grades_2024-2025_.*\.xlsx/);

    // Verify file downloaded
    const path = await download.path();
    expect(path).toBeTruthy();

    // Success message
    const successMessage = page.locator('.bg-green-50');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Export réussi');
  });
});

/**
 * E2E Test: D-007 - Create compressed backup
 * Reference: E2E_TEST_MATRIX.md Line 76
 * Priority: P0 Critical
 * 
 * Scenario:
 * Admin creates backup with compression enabled,
 * backup completes <10s, file saved with metadata
 * 
 * Expected:
 * - Backup created in .sql.gz format
 * - Backup duration <10s
 * - Backup appears in list
 * - File size ~70% smaller than uncompressed
 */
test.describe('Cycle 3: Data Management - Backup', () => {
  test('D-007: Admin creates compressed backup', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kds.ci');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Navigate to backup manager
    await page.goto('/data/backups');
    await expect(page.locator('h2')).toContainText('Gestion des Sauvegardes');

    // Click create backup
    await page.click('button:has-text("Créer une sauvegarde")');

    // Fill modal
    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible();

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    await modal.locator('input[placeholder*="backup"]').fill(`backup_e2e_${timestamp}`);
    await modal.locator('textarea').fill('E2E Test Backup - Compressed');

    // Verify compression checkbox is checked (default)
    const compressCheckbox = modal.locator('input[type="checkbox"]');
    await expect(compressCheckbox).toBeChecked();

    // Record start time
    const startTime = Date.now();

    // Click create
    await modal.locator('button:has-text("Créer")').click();

    // Wait for success message
    const successMessage = page.locator('.bg-green-50');
    await expect(successMessage).toBeVisible({ timeout: 15000 });
    await expect(successMessage).toContainText('Sauvegarde créée avec succès');

    // Record end time
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify performance: <10s
    expect(duration).toBeLessThan(10000);
    console.log(`Backup creation took ${duration}ms`);

    // Verify backup appears in list
    await page.reload();
    const backupRow = page.locator(`tr:has-text("backup_e2e_${timestamp}")`);
    await expect(backupRow).toBeVisible();

    // Verify it's marked as compressed
    await expect(backupRow.locator('.bg-blue-100')).toContainText('Compressé');

    // Verify via API
    const token = await page.evaluate(() => localStorage.getItem('ksp_token'));
    const response = await page.request.get(
      `${process.env.API_URL || 'http://localhost:3002'}${API_ENDPOINTS.dataManagement.backup}/list`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    expect(response.status()).toBe(200);
    const backups = await response.json();

    const e2eBackup = backups.find((b: any) => b.name === `backup_e2e_${timestamp}`);
    expect(e2eBackup).toBeDefined();
    expect(e2eBackup.compressed).toBe(true);
    expect(e2eBackup.filename).toMatch(/\.sql\.gz$/);
  });

  /**
   * E2E Test: D-008 - List backups sorted DESC
   * Reference: E2E_TEST_MATRIX.md Line 77
   * Priority: P1 High
   */
  test('D-008: Admin lists backups sorted by date DESC', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kds.ci');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Navigate to backups
    await page.goto('/data/backups');

    // Wait for table to load
    const table = page.locator('table tbody');
    await expect(table.locator('tr').first()).toBeVisible({ timeout: 5000 });

    // Get all backup rows
    const rows = table.locator('tr');
    const rowCount = await rows.count();

    if (rowCount > 1) {
      // Extract dates from first and last rows
      const firstRowDate = await rows.first().locator('td').nth(2).textContent();
      const lastRowDate = await rows.last().locator('td').nth(2).textContent();

      // Parse dates (format: DD/MM/YYYY HH:MM)
      const parseDate = (dateStr: string) => {
        const parts = dateStr?.trim().split(/[\s\/,:]+/);
        if (parts && parts.length >= 5) {
          return new Date(
            parseInt(parts[2]), // year
            parseInt(parts[1]) - 1, // month (0-indexed)
            parseInt(parts[0]), // day
            parseInt(parts[3]), // hour
            parseInt(parts[4]) // minute
          );
        }
        return null;
      };

      const firstDate = parseDate(firstRowDate || '');
      const lastDate = parseDate(lastRowDate || '');

      if (firstDate && lastDate) {
        // First row date should be >= last row date (DESC order)
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(lastDate.getTime());
        console.log(`Backups sorted correctly: ${firstDate} >= ${lastDate}`);
      }
    }

    // Verify via API
    const token = await page.evaluate(() => localStorage.getItem('ksp_token'));
    const response = await page.request.get(
      `${process.env.API_URL || 'http://localhost:3002'}${API_ENDPOINTS.dataManagement.backup}/list`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    expect(response.status()).toBe(200);
    const backups = await response.json();

    // Verify API returns sorted DESC
    for (let i = 0; i < backups.length - 1; i++) {
      const currentDate = new Date(backups[i].createdAt);
      const nextDate = new Date(backups[i + 1].createdAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });
});

/**
 * E2E Test: D-010 - Migration preview accurate
 * Reference: E2E_TEST_MATRIX.md Line 79
 * Priority: P0 Critical
 * 
 * Scenario:
 * Admin opens migration wizard, selects academic years,
 * preview shows accurate counts matching DB
 * 
 * Expected:
 * - Preview returns HTTP 201
 * - Counts match actual DB records
 * - Level transitions correct (CP→CE1, CE1→CE2, etc.)
 * - No data modified (preview only)
 */
test.describe('Cycle 3: Data Management - Migration Preview', () => {
  test('D-010: Migration preview shows accurate counts', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@kds.ci');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });

    // Make direct API call to get preview (component not yet created)
    const token = await page.evaluate(() => localStorage.getItem('ksp_token'));
    const response = await page.request.post(
      `http://localhost:3001${API_ENDPOINTS.dataManagement.migrate}/preview`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          currentYear: '2024-2025',
          newYear: '2025-2026',
        }),
      }
    );

    // Verify response
    expect(response.status()).toBe(201);
    const preview = await response.json();

    // Verify structure
    expect(preview).toHaveProperty('currentClasses');
    expect(preview).toHaveProperty('studentsToMigrate');
    expect(preview).toHaveProperty('gradesToArchive');
    expect(preview).toHaveProperty('levelTransitions');

    // Verify counts are positive integers
    expect(preview.currentClasses).toBeGreaterThan(0);
    expect(preview.studentsToMigrate).toBeGreaterThan(0);
    expect(preview.gradesToArchive).toBeGreaterThan(0);

    // Expected: 6 classes, 129 students (from fixtures)
    expect(preview.currentClasses).toBe(6);
    expect(preview.studentsToMigrate).toBe(129);

    // Verify level transitions
    expect(preview.levelTransitions).toBeInstanceOf(Array);
    expect(preview.levelTransitions.length).toBeGreaterThan(0);

    // Check sample transitions
    const transitions = preview.levelTransitions;
    const cpToCe1 = transitions.find((t: any) => t.from.includes('CP'));
    expect(cpToCe1).toBeDefined();
    expect(cpToCe1.to).toContain('CE1');

    console.log('Migration Preview:', JSON.stringify(preview, null, 2));

    // Verify no data was modified (preview only)
    const studentsResponse = await page.request.get(
      `${process.env.API_URL || 'http://localhost:3002'}/students`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    const students = await studentsResponse.json();

    // Students should still be in 2024-2025 classes
    const student2025 = students.find((s: any) =>
      s.class?.academicYear === '2025-2026'
    );
    expect(student2025).toBeUndefined(); // No students migrated yet
  });
});
