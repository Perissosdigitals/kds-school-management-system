import { Page } from '@playwright/test';

/**
 * E2E Test Helpers
 * Reusable utility functions for E2E tests
 */

export class TestHelpers {
    /**
     * Wait for network request to complete
     */
    static async waitForApiResponse(page: Page, urlPattern: RegExp, method = 'GET') {
        return page.waitForResponse(
            response => response.url().match(urlPattern) !== null && response.request().method() === method,
            { timeout: 10000 }
        );
    }

    /**
     * Get auth token from localStorage
     */
    static async getAuthToken(page: Page): Promise<string> {
        return await page.evaluate(() => localStorage.getItem('access_token') || '');
    }

    /**
     * Make an authenticated API request
     */
    static async apiRequest(page: Page, endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) {
        const token = await this.getAuthToken(page);
        const baseURL = 'http://localhost:3001';

        return await page.request[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](
            `${baseURL}${endpoint}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: body,
            }
        );
    }

    /**
     * Fill form field and wait for validation
     */
    static async fillAndValidate(page: Page, selector: string, value: string) {
        await page.fill(selector, value);
        await page.waitForTimeout(200); // Wait for validation
    }

    /**
     * Select dropdown option and wait for dependent data to load
     */
    static async selectAndWait(page: Page, selector: string, value: string, waitMs = 500) {
        await page.selectOption(selector, value);
        await page.waitForTimeout(waitMs);
    }

    /**
     * Click button and wait for navigation or response
     */
    static async clickAndWait(page: Page, selector: string, waitForUrl?: RegExp) {
        const button = page.locator(selector);
        await button.click();

        if (waitForUrl) {
            await page.waitForURL(waitForUrl, { timeout: 5000 });
        }
    }

    /**
     * Verify success message
     */
    static async verifySuccessMessage(page: Page, expectedText?: string) {
        const successMessage = page.locator('.bg-green-50, .alert-success, [role="alert"][class*="success"]').first();
        await successMessage.waitFor({ state: 'visible', timeout: 5000 });

        if (expectedText) {
            await expect(successMessage).toContainText(expectedText);
        }

        return successMessage;
    }

    /**
     * Verify error message
     */
    static async verifyErrorMessage(page: Page, expectedText?: string) {
        const errorMessage = page.locator('.bg-red-50, .alert-error, [role="alert"][class*="error"]').first();
        await errorMessage.waitFor({ state: 'visible', timeout: 5000 });

        if (expectedText) {
            await expect(errorMessage).toContainText(expectedText);
        }

        return errorMessage;
    }

    /**
     * Generate random student data
     */
    static generateStudentData() {
        const firstNames = ['Aya', 'Kofi', 'Amina', 'Kwame', 'Fatou', 'Yao', 'Mariama', 'Koffi'];
        const lastNames = ['Koné', 'Traoré', 'Diallo', 'Touré', 'Sanogo', 'Coulibaly', 'Ouattara'];
        const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];

        return {
            firstName: randomFirst,
            lastName: randomLast,
            dateOfBirth: '2015-03-15',
            placeOfBirth: 'Abidjan',
            gender: Math.random() > 0.5 ? 'Masculin' : 'Féminin',
            nationality: 'Ivoirienne',
            address: '123 Rue de la Paix, Abidjan',
            parentName: `Parent de ${randomFirst}`,
            parentPhone: '+225 07 12 34 56 78',
            parentEmail: `parent.${randomFirst.toLowerCase()}@example.com`,
        };
    }

    /**
     * Wait for table to load with minimum rows
     */
    static async waitForTableRows(page: Page, tableSelector: string, minRows = 1) {
        const table = page.locator(tableSelector);
        await table.waitFor({ state: 'visible', timeout: 5000 });

        // Wait for at least minRows to be present
        await page.waitForFunction(
            ({ selector, count }) => {
                const rows = document.querySelectorAll(`${selector} tbody tr`);
                return rows.length >= count;
            },
            { selector: tableSelector, count: minRows },
            { timeout: 10000 }
        );
    }

    /**
     * Navigate to a route and verify page loaded
     */
    static async navigateToAndVerify(page: Page, path: string, headerText: string) {
        await page.goto(path);
        const header = page.locator('h1, h2, h3').first();
        await header.waitFor({ state: 'visible', timeout: 5000 });

        if (headerText) {
            await expect(header).toContainText(headerText);
        }
    }
}

// Export expect for convenience
import { expect } from '@playwright/test';
export { expect };
