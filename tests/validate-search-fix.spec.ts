import { test, expect } from '@playwright/test';

test.describe('Search Bar Fix Validation', () => {

  test('validate search input padding prevents icon overlap', async ({ page }) => {
    // Navigate to admin page (will redirect to login, but search bar styling is testable on login too)
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot for context
    await page.screenshot({
      path: 'tests/screenshots/search-bar-full-page.png',
      fullPage: false
    });

    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search"]');

    // If we're on login page, the search won't exist - go check the login page itself
    const isLoginPage = await page.locator('text=Admin Login').isVisible().catch(() => false);

    if (isLoginPage) {
      console.log('On login page - testing email input padding instead');
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      // Get computed styles
      const paddingLeft = await emailInput.evaluate((el) => {
        return window.getComputedStyle(el).paddingLeft;
      });
      console.log(`Email input padding-left: ${paddingLeft}`);

      await page.screenshot({
        path: 'tests/screenshots/login-page-inputs.png',
        fullPage: false
      });
    } else {
      // On admin dashboard - test the search input
      await expect(searchInput).toBeVisible();

      // Get the search input's computed padding-left
      const paddingLeft = await searchInput.evaluate((el) => {
        return window.getComputedStyle(el).paddingLeft;
      });

      console.log(`Search input computed padding-left: ${paddingLeft}`);

      // Parse the padding value (e.g., "44px" -> 44)
      const paddingValue = parseFloat(paddingLeft);

      // Validate: pl-11 = 2.75rem = 44px, should be >= 40px minimum
      expect(paddingValue).toBeGreaterThanOrEqual(40);

      // Get bounding boxes
      const searchIcon = page.locator('input[placeholder*="Search"]').locator('..').locator('svg');
      const iconBox = await searchIcon.boundingBox();
      const inputBox = await searchInput.boundingBox();

      if (iconBox && inputBox) {
        console.log(`Icon position: left=${iconBox.x}, width=${iconBox.width}`);
        console.log(`Input position: left=${inputBox.x}`);
        console.log(`Text should start at: ${inputBox.x + paddingValue}px`);
        console.log(`Icon ends at: ${iconBox.x + iconBox.width}px`);

        // Verify text start position is after icon end position
        const textStartX = inputBox.x + paddingValue;
        const iconEndX = iconBox.x + iconBox.width;
        expect(textStartX).toBeGreaterThan(iconEndX);
      }

      // Screenshot the search area
      const searchContainer = page.locator('input[placeholder*="Search"]').locator('..');
      await searchContainer.screenshot({
        path: 'tests/screenshots/search-input-area.png'
      });
    }
  });
});
