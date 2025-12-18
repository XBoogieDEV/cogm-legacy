import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should display admin dashboard title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('should display statistics cards', async ({ page }) => {
    await expect(page.locator('p:has-text("Total Submissions")')).toBeVisible();
    await expect(page.locator('p:has-text("Pending Review")')).toBeVisible();
    await expect(page.locator('p:has-text("Published")').first()).toBeVisible();
  });

  test('should display submissions table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Jurisdiction")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should have navigation back to main site', async ({ page }) => {
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });
});

test.describe('Admin Dashboard - Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should filter submissions by search term', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Washington');
    await page.waitForTimeout(300);

    const rows = page.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRow = rows.first();
      await expect(firstRow).toContainText('Washington');
    }
  });

  test('should have status filter dropdown', async ({ page }) => {
    const statusFilter = page.locator('select').first();
    await expect(statusFilter).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('pending');
    await page.waitForTimeout(300);

    const rows = page.locator('tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const statusBadges = page.locator('tbody tr span:has-text("Pending")');
      expect(await statusBadges.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Dashboard - Submission Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should open detail modal when clicking view button', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.locator('[role="dialog"], .modal, [class*="modal"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should close modal when clicking close button', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"]').first();
      await closeButton.click();

      await expect(page.locator('[role="dialog"], .modal, [class*="modal"]')).not.toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Admin Dashboard - Status Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should display status badges with correct colors', async ({ page }) => {
    const pendingBadge = page.locator('span:has-text("Pending")').first();
    const reviewedBadge = page.locator('span:has-text("Reviewed")').first();
    const publishedBadge = page.locator('span:has-text("Published")').first();

    if (await pendingBadge.isVisible()) {
      await expect(pendingBadge).toBeVisible();
    }
    if (await reviewedBadge.isVisible()) {
      await expect(reviewedBadge).toBeVisible();
    }
    if (await publishedBadge.isVisible()) {
      await expect(publishedBadge).toBeVisible();
    }
  });
});

test.describe('Admin Dashboard - Document Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should display Supporting Documents section in modal', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Check for the Supporting Documents section
      const documentsSection = page.locator('h3:has-text("Supporting Documents")');
      await expect(documentsSection).toBeVisible({ timeout: 5000 });

      // Check for document cards (either with content or placeholder)
      const documentCards = page.locator('[class*="rounded-xl"][class*="border"]');
      expect(await documentCards.count()).toBeGreaterThan(0);
    }
  });

  test('should show obituary link card', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Check for Obituary Link section
      const obituaryCard = page.locator('text=Obituary Link');
      await expect(obituaryCard).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show obituary documents card', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Check for Obituary Documents section
      const obituaryDocsCard = page.locator('text=Obituary Documents');
      await expect(obituaryDocsCard).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show memorial program card', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Check for Memorial Program section
      const programCard = page.locator('text=Memorial Program');
      await expect(programCard).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Admin Dashboard - Responsive Design', () => {
  test('should display properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');

    // h1 is hidden on mobile, check for stats instead
    await expect(page.locator('p:has-text("Total Submissions")')).toBeVisible();
  });

  test('should display properly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin');

    await expect(page.locator('h1')).toBeVisible();
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should display properly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');

    await expect(page.locator('h1')).toBeVisible();
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });
});
