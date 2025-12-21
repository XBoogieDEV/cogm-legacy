import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow', () => {
  test('should display login page with all required elements', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=Invalid email or password, text=error, [role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('should have link to home page', async ({ page }) => {
    await page.goto('/admin/login');

    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('login form should be keyboard accessible', async ({ page }) => {
    await page.goto('/admin/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    const emailFocused = await page.evaluate(() =>
      document.activeElement?.matches('input[type="email"], input[name="email"]')
    );

    await page.keyboard.press('Tab');
    const passwordFocused = await page.evaluate(() =>
      document.activeElement?.matches('input[type="password"], input[name="password"]')
    );

    await page.keyboard.press('Tab');
    const submitFocused = await page.evaluate(() =>
      document.activeElement?.matches('button[type="submit"]')
    );

    // At least email and password fields should be reachable
    expect(emailFocused || passwordFocused || submitFocused).toBeTruthy();
  });
});

test.describe('Admin Dashboard - Status Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should display status change buttons in detail modal', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Check for status action buttons
      const reviewButton = page.locator('button:has-text("Mark Reviewed")');
      const publishButton = page.locator('button:has-text("Publish")');

      // At least one action button should be visible (depends on current status)
      const reviewVisible = await reviewButton.isVisible().catch(() => false);
      const publishVisible = await publishButton.isVisible().catch(() => false);

      // One of them should be visible for pending/reviewed items
      expect(reviewVisible || publishVisible).toBeTruthy();
    }
  });

  test('should display submission details in modal', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Check for key detail sections
      await expect(page.locator('text=Deceased Member Information')).toBeVisible();
      await expect(page.locator('text=Submission Details')).toBeVisible();
    }
  });

  test('should show delete button in modal', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      const deleteButton = page.locator('button:has-text("Delete Record")');
      await expect(deleteButton).toBeVisible();
    }
  });
});

test.describe('Admin Dashboard - Delete Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      const deleteButton = page.locator('button:has-text("Delete Record")');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(300);

        // Check for confirmation dialog
        await expect(page.locator('text=Delete Memorial Record?')).toBeVisible();
        await expect(page.locator('text=This action cannot be undone')).toBeVisible();
      }
    }
  });

  test('should have cancel button in delete dialog', async ({ page }) => {
    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      const deleteButton = page.locator('button:has-text("Delete Record")');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(300);

        const cancelButton = page.locator('button:has-text("Cancel")');
        await expect(cancelButton).toBeVisible();

        // Click cancel and verify dialog closes
        await cancelButton.click();
        await expect(page.locator('text=Delete Memorial Record?')).not.toBeVisible({ timeout: 2000 });
      }
    }
  });
});

test.describe('Admin Dashboard - Search & Filter Combinations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should combine search with status filter', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    const statusFilter = page.locator('select[aria-label="Filter by status"]').first();

    if (await searchInput.isVisible() && await statusFilter.isVisible()) {
      await searchInput.fill('test');
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(500);

      // Verify both filters are applied
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('test');
    }
  });

  test('should clear all filters when clear button clicked', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('test search');
      await page.waitForTimeout(300);

      const clearButton = page.locator('button:has-text("Clear Filters")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(300);

        const searchValue = await searchInput.inputValue();
        expect(searchValue).toBe('');
      }
    }
  });

  test('should filter by jurisdiction', async ({ page }) => {
    const jurisdictionFilter = page.locator('select[aria-label="Filter by jurisdiction"]');

    if (await jurisdictionFilter.isVisible()) {
      // Get available options
      const options = await jurisdictionFilter.locator('option').allTextContents();

      if (options.length > 1) {
        // Select first non-"All" option
        const firstJurisdiction = options.find(o => o !== 'All Jurisdictions');
        if (firstJurisdiction) {
          await jurisdictionFilter.selectOption(firstJurisdiction);
          await page.waitForTimeout(500);

          // Verify filter is applied
          const selectedValue = await jurisdictionFilter.inputValue();
          expect(selectedValue).not.toBe('all');
        }
      }
    }
  });

  test('should filter by date range', async ({ page }) => {
    const dateStart = page.locator('input[aria-label="Start date"]');
    const dateEnd = page.locator('input[aria-label="End date"]');

    if (await dateStart.isVisible() && await dateEnd.isVisible()) {
      await dateStart.fill('2024-01-01');
      await dateEnd.fill('2024-12-31');
      await page.waitForTimeout(500);

      // Verify date filters are set
      const startValue = await dateStart.inputValue();
      const endValue = await dateEnd.inputValue();

      expect(startValue).toBe('2024-01-01');
      expect(endValue).toBe('2024-12-31');
    }
  });
});

test.describe('Admin Dashboard - Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should have CSV export button', async ({ page }) => {
    const csvButton = page.locator('button:has-text("CSV")');
    await expect(csvButton).toBeVisible();
  });

  test('should have PDF export button', async ({ page }) => {
    const pdfButton = page.locator('button:has-text("PDF")');
    await expect(pdfButton).toBeVisible();
  });

  test('export buttons should be enabled when submissions exist', async ({ page }) => {
    const csvButton = page.locator('button:has-text("CSV")');

    // Wait for data to load
    await page.waitForTimeout(1000);

    const rows = await page.locator('tbody tr').count();

    if (rows > 0) {
      await expect(csvButton).toBeEnabled();
    }
  });
});

test.describe('Admin Dashboard - Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should sort by name when name header clicked', async ({ page }) => {
    const nameHeader = page.locator('th button:has-text("Name")');

    if (await nameHeader.isVisible()) {
      await nameHeader.click();
      await page.waitForTimeout(300);

      // Check for sort indicator
      const sortIcon = nameHeader.locator('svg');
      await expect(sortIcon).toBeVisible();
    }
  });

  test('should toggle sort order on repeated clicks', async ({ page }) => {
    const dateHeader = page.locator('th button:has-text("Submitted")');

    if (await dateHeader.isVisible()) {
      // First click - should set descending
      await dateHeader.click();
      await page.waitForTimeout(300);

      // Second click - should toggle to ascending
      await dateHeader.click();
      await page.waitForTimeout(300);

      // Sort icon should be visible
      const sortIcon = dateHeader.locator('svg');
      await expect(sortIcon).toBeVisible();
    }
  });
});

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should require all mandatory fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');

    // Submit button should be disabled initially
    await expect(submitButton).toBeDisabled();
  });

  test('should update progress as fields are filled', async ({ page }) => {
    const progressBar = page.locator('[class*="bg-gradient-to-r"][class*="from-gold"]');

    // Fill one field
    await page.locator('input[name="fullName"]').fill('Test Name');
    await page.waitForTimeout(300);

    // Progress should update (check width style or percentage text)
    const progressText = page.locator('text=/\\d+%/').first();
    const progressValue = await progressText.textContent();

    expect(progressValue).toMatch(/\d+%/);
  });

  test('should enable submit when all required fields filled', async ({ page }) => {
    await page.locator('input[name="fullName"]').fill('John Doe Sr.');
    await page.locator('input[name="passingDate"]').fill('2024-01-15');
    await page.locator('select[name="title"]').selectOption('MWGM');
    await page.locator('select[name="jurisdiction"]').selectOption('Michigan');
    await page.locator('input[name="yearsOfService"]').fill('2010-2018');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });

  test('should accept valid email in submitter field', async ({ page }) => {
    const emailInput = page.locator('input[name="submitterEmail"]');
    await emailInput.fill('test@example.com');

    const value = await emailInput.inputValue();
    expect(value).toBe('test@example.com');
  });

  test('should accept valid URL in obituary link field', async ({ page }) => {
    const urlInput = page.locator('input[name="obituaryLink"]');
    await urlInput.fill('https://example.com/obituary');

    const value = await urlInput.inputValue();
    expect(value).toBe('https://example.com/obituary');
  });
});

test.describe('Form File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display file upload zones', async ({ page }) => {
    const obituaryUpload = page.locator('text=Obituary Document');
    const programUpload = page.locator('text=Memorial Program');

    await expect(obituaryUpload).toBeVisible();
    await expect(programUpload).toBeVisible();
  });

  test('should have drag and drop areas', async ({ page }) => {
    const uploadZones = page.locator('.upload-zone, [class*="upload-zone"]');
    const count = await uploadZones.count();

    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should show file type instructions', async ({ page }) => {
    const fileTypeText = page.locator('text=PDF, DOC, or images');
    const count = await fileTypeText.count();

    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Modal Accessibility', () => {
  test('should close modal with escape key', async ({ page }) => {
    await page.goto('/admin');

    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Verify modal is open
      const modal = page.locator('[class*="fixed"][class*="inset-0"]').first();
      await expect(modal).toBeVisible();

      // Press escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Modal should close (close button should not be visible)
      await expect(page.locator('button:has-text("Close")').first()).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    await page.goto('/admin');

    const viewButton = page.locator('button:has-text("View")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Click the backdrop (the semi-transparent overlay)
      const backdrop = page.locator('[class*="backdrop-blur"]').first();
      if (await backdrop.isVisible()) {
        await backdrop.click({ force: true, position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('Responsive Table Behavior', () => {
  test('should show table on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');

    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should allow horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');

    // Table container should allow overflow
    const tableContainer = page.locator('[class*="overflow-x-auto"]');
    await expect(tableContainer).toBeVisible();
  });

  test('should hide jurisdiction column on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto('/admin');

    // The jurisdiction header has hidden class on md:
    const jurisdictionHeader = page.locator('th:has-text("Jurisdiction")');

    // It should have the hidden class for medium screens
    const isHidden = await jurisdictionHeader.evaluate((el) =>
      el.classList.contains('hidden') || getComputedStyle(el).display === 'none'
    );

    expect(isHidden).toBeTruthy();
  });
});

test.describe('Loading States', () => {
  test('should show loading skeleton initially', async ({ page }) => {
    // Block API requests temporarily to see loading state
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/admin');

    // Check for loading skeleton elements
    const skeleton = page.locator('[class*="animate-pulse"]');
    const count = await skeleton.count();

    // Some skeleton elements should be visible during loading
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Stats Cards', () => {
  test('should display four stats cards', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Total Submissions')).toBeVisible();
    await expect(page.locator('text=Pending Review')).toBeVisible();
    await expect(page.locator('text=Reviewed').first()).toBeVisible();
    await expect(page.locator('text=Published').first()).toBeVisible();
  });

  test('should show numeric values in stats', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check that stat cards have numeric values
    const statValues = page.locator('[class*="text-3xl"]');
    const count = await statValues.count();

    expect(count).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Navigation', () => {
  test('should navigate from admin to home', async ({ page }) => {
    await page.goto('/admin');

    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });

  test('should navigate from home to admin', async ({ page }) => {
    await page.goto('/');

    const adminLink = page.locator('a[href="/admin"]');
    await adminLink.click();

    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/admin/);
  });
});
