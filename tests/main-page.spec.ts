import { test, expect } from '@playwright/test';

test.describe('Main Page - Landing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section with logo and headline', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('In Memoriam');
    await expect(page.locator('img[alt*="Conference of Grand Masters"]')).toBeVisible();
  });

  test('should have visible CTA button', async ({ page }) => {
    const ctaButton = page.locator('button.btn-primary').first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('should scroll to form when CTA is clicked', async ({ page }) => {
    const ctaButton = page.locator('button.btn-primary').first();
    await ctaButton.click();
    await page.waitForTimeout(1000);

    // Check that the form section is visible after scroll
    const formHeading = page.locator('h2:has-text("Deceased Member Registry")');
    await expect(formHeading).toBeInViewport();
  });

  test('should display navigation elements', async ({ page }) => {
    // Check for navigation link to admin
    const adminLink = page.locator('a[href="/admin"]');
    await expect(adminLink).toBeVisible();
  });
});

test.describe('Main Page - Memorial Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display form with required fields', async ({ page }) => {
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="passingDate"]')).toBeVisible();
    await expect(page.locator('select[name="title"]')).toBeVisible();
  });

  test('should have required attribute on fullName field', async ({ page }) => {
    const fullNameInput = page.locator('input[name="fullName"]');
    await expect(fullNameInput).toHaveAttribute('required', '');
  });

  test('should enable submit button when required fields are filled', async ({ page }) => {
    await page.locator('input[name="fullName"]').fill('John Doe Sr.');
    await page.locator('input[name="passingDate"]').fill('2024-01-15');
    await page.locator('select[name="title"]').selectOption('MWGM');
    await page.locator('select[name="jurisdiction"]').selectOption('Michigan');
    await page.locator('input[name="yearsOfService"]').fill('2010-2018');
    await page.locator('input[name="submitterName"]').fill('Brother Smith');
    await page.locator('input[name="submitterEmail"]').fill('test@example.com');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Main Page - Responsive Design', () => {
  test('CTA button visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const ctaButton = page.locator('button.btn-primary').first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeInViewport();
  });

  test('CTA button visible on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const ctaButton = page.locator('button.btn-primary').first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeInViewport();
  });

  test('CTA button visible on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const ctaButton = page.locator('button.btn-primary').first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeInViewport();
  });
});
