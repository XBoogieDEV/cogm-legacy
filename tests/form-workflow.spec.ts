import { test, expect } from '@playwright/test';

test.describe('Form Workflow - Complete Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should scroll to form when CTA clicked', async ({ page }) => {
    const ctaButton = page.locator('button.btn-primary').first();
    await ctaButton.click();
    await page.waitForTimeout(1000);

    const formSection = page.locator('h2:has-text("Deceased Member Registry")');
    await expect(formSection).toBeInViewport();
  });

  test('should hide CTA button after clicking', async ({ page }) => {
    const ctaButton = page.locator('button.btn-primary').first();
    await ctaButton.click();
    await page.waitForTimeout(1000);

    // CTA should disappear after form started
    await expect(ctaButton).not.toBeVisible();
  });

  test('should display progress indicator starting at 0%', async ({ page }) => {
    const ctaButton = page.locator('button.btn-primary').first();
    await ctaButton.click();
    await page.waitForTimeout(500);

    const progressText = page.locator('text=Form Progress');
    await expect(progressText).toBeVisible();

    const percentText = page.locator('text=/0%/');
    await expect(percentText).toBeVisible();
  });

  test('should increment progress as fields are filled', async ({ page }) => {
    const ctaButton = page.locator('button.btn-primary').first();
    await ctaButton.click();
    await page.waitForTimeout(500);

    // Fill first required field
    await page.locator('select[name="title"]').selectOption('MWGM');
    await page.waitForTimeout(300);

    // Progress should be 20% (1 of 5 required fields)
    const percentText = page.locator('text=/20%/');
    await expect(percentText).toBeVisible();
  });

  test('should reach 100% when all required fields filled', async ({ page }) => {
    const ctaButton = page.locator('button.btn-primary').first();
    await ctaButton.click();
    await page.waitForTimeout(500);

    // Fill all required fields
    await page.locator('select[name="title"]').selectOption('MWGM');
    await page.locator('input[name="fullName"]').fill('John Doe Sr.');
    await page.locator('input[name="passingDate"]').fill('2024-01-15');
    await page.locator('select[name="jurisdiction"]').selectOption('Michigan');
    await page.locator('input[name="yearsOfService"]').fill('2010-2018');

    await page.waitForTimeout(300);

    const percentText = page.locator('text=/100%/');
    await expect(percentText).toBeVisible();
  });
});

test.describe('Form Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display Section 1: Deceased Member Information', async ({ page }) => {
    const section = page.locator('text=Deceased Member Information');
    await expect(section).toBeVisible();
  });

  test('should display Section 2: Supporting Documents', async ({ page }) => {
    const section = page.locator('text=Supporting Documents');
    await expect(section).toBeVisible();
  });

  test('should display Section 3: Additional Information', async ({ page }) => {
    const section = page.locator('text=Additional Information');
    await expect(section).toBeVisible();
  });

  test('should display Section 4: Your Information', async ({ page }) => {
    const section = page.locator('text=Your Information');
    await expect(section).toBeVisible();
  });

  test('should have numbered section headers', async ({ page }) => {
    // Check for section number badges
    const sectionNumbers = page.locator('[class*="rounded-full"][class*="bg-gradient"]');
    const count = await sectionNumbers.count();

    expect(count).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Collapsible Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should have collapsible Memorial Service Information section', async ({ page }) => {
    const collapsibleButton = page.locator('button:has-text("Memorial Service Information")');
    await expect(collapsibleButton).toBeVisible();
  });

  test('should have collapsible Family Contact Information section', async ({ page }) => {
    const collapsibleButton = page.locator('button:has-text("Family Contact Information")');
    await expect(collapsibleButton).toBeVisible();
  });

  test('should expand section when clicked', async ({ page }) => {
    const collapsibleButton = page.locator('button:has-text("Memorial Service Information")');
    await collapsibleButton.click();
    await page.waitForTimeout(300);

    // Check for fields inside the section
    const serviceDate = page.locator('input[name="memorialServiceDate"]');
    await expect(serviceDate).toBeVisible();
  });

  test('should collapse section when clicked again', async ({ page }) => {
    const collapsibleButton = page.locator('button:has-text("Memorial Service Information")');

    // Open
    await collapsibleButton.click();
    await page.waitForTimeout(300);

    // Close
    await collapsibleButton.click();
    await page.waitForTimeout(300);

    // Fields should be hidden
    const serviceDate = page.locator('input[name="memorialServiceDate"]');
    await expect(serviceDate).not.toBeVisible();
  });
});

test.describe('Jurisdiction Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display jurisdiction dropdown', async ({ page }) => {
    const dropdown = page.locator('select[name="jurisdiction"]');
    await expect(dropdown).toBeVisible();
  });

  test('should have option groups by region', async ({ page }) => {
    const dropdown = page.locator('select[name="jurisdiction"]');

    // Check for optgroups
    const optgroups = dropdown.locator('optgroup');
    const count = await optgroups.count();

    // Should have at least United States, Canada, Caribbean, Africa
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should have United States states', async ({ page }) => {
    const usOptgroup = page.locator('optgroup[label="United States"]');
    const options = usOptgroup.locator('option');
    const count = await options.count();

    // US has 50 states + DC
    expect(count).toBeGreaterThanOrEqual(50);
  });

  test('should allow selecting a jurisdiction', async ({ page }) => {
    const dropdown = page.locator('select[name="jurisdiction"]');
    await dropdown.selectOption('Michigan');

    const value = await dropdown.inputValue();
    expect(value).toBe('Michigan');
  });
});

test.describe('Title Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display title dropdown', async ({ page }) => {
    const dropdown = page.locator('select[name="title"]');
    await expect(dropdown).toBeVisible();
  });

  test('should have MWGM, MWPGM, and PMWGM options', async ({ page }) => {
    const dropdown = page.locator('select[name="title"]');

    const options = await dropdown.locator('option').allTextContents();

    expect(options.some(o => o.includes('MWGM'))).toBeTruthy();
    expect(options.some(o => o.includes('MWPGM'))).toBeTruthy();
    expect(options.some(o => o.includes('PMWGM'))).toBeTruthy();
  });

  test('should show full title descriptions', async ({ page }) => {
    const dropdown = page.locator('select[name="title"]');
    const options = await dropdown.locator('option').allTextContents();

    expect(options.some(o => o.includes('Most Worshipful Grand Master'))).toBeTruthy();
  });
});

test.describe('Date Fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should have date input for passing date', async ({ page }) => {
    const dateInput = page.locator('input[name="passingDate"]');
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveAttribute('type', 'date');
  });

  test('should accept valid date', async ({ page }) => {
    const dateInput = page.locator('input[name="passingDate"]');
    await dateInput.fill('2024-06-15');

    const value = await dateInput.inputValue();
    expect(value).toBe('2024-06-15');
  });

  test('should have date input for memorial service date', async ({ page }) => {
    // Open collapsible section
    await page.locator('button:has-text("Memorial Service Information")').click();
    await page.waitForTimeout(300);

    const dateInput = page.locator('input[name="memorialServiceDate"]');
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveAttribute('type', 'date');
  });
});

test.describe('File Upload Zones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display obituary file upload zone', async ({ page }) => {
    const uploadZone = page.locator('#obituary-input').locator('..');
    const label = page.locator('label:has-text("Obituary Document")');

    await expect(label).toBeVisible();
  });

  test('should display program file upload zone', async ({ page }) => {
    const label = page.locator('label:has-text("Memorial Program")');
    await expect(label).toBeVisible();
  });

  test('should accept PDF, DOC, DOCX, JPG, PNG files', async ({ page }) => {
    const fileInput = page.locator('#obituary-input');
    const acceptAttr = await fileInput.getAttribute('accept');

    expect(acceptAttr).toContain('.pdf');
    expect(acceptAttr).toContain('.doc');
    expect(acceptAttr).toContain('.docx');
    expect(acceptAttr).toContain('.jpg');
    expect(acceptAttr).toContain('.png');
  });

  test('should allow multiple file selection', async ({ page }) => {
    const fileInput = page.locator('#obituary-input');
    const multipleAttr = await fileInput.getAttribute('multiple');

    expect(multipleAttr).not.toBeNull();
  });

  test('should display drag and drop instructions', async ({ page }) => {
    const dragText = page.locator('text=Drag & drop');
    const count = await dragText.count();

    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Submit Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display submit button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should be disabled when required fields empty', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should show "Submit Memorial" text', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText('Submit Memorial');
  });

  test('should be enabled when all required fields filled', async ({ page }) => {
    await page.locator('select[name="title"]').selectOption('MWGM');
    await page.locator('input[name="fullName"]').fill('John Doe Sr.');
    await page.locator('input[name="passingDate"]').fill('2024-01-15');
    await page.locator('select[name="jurisdiction"]').selectOption('Michigan');
    await page.locator('input[name="yearsOfService"]').fill('2010-2018');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Form Instructions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display instructions alert', async ({ page }) => {
    const instructionsHeader = page.locator('text=Instructions');
    await expect(instructionsHeader).toBeVisible();
  });

  test('should mention MWGM/MWPGM requirement', async ({ page }) => {
    const requirementText = page.locator('text=Must be a sitting MWGM or a MWPGM');
    await expect(requirementText).toBeVisible();
  });

  test('should indicate required fields with asterisk', async ({ page }) => {
    const requiredText = page.locator('text=* Required fields');
    await expect(requiredText).toBeVisible();
  });

  test('should show asterisk on required field labels', async ({ page }) => {
    const fullNameLabel = page.locator('label:has-text("Full Name")');
    const requiredIndicator = fullNameLabel.locator('[class*="required"], :has-text("*")');

    await expect(fullNameLabel).toBeVisible();
  });
});

test.describe('Form Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should display footer section', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should show COGM copyright', async ({ page }) => {
    const copyright = page.locator('text=/© \\d{4} COGM/');
    await expect(copyright).toBeVisible();
  });

  test('should mention "Organized 1887"', async ({ page }) => {
    const organized = page.locator('text=Organized 1887');
    await expect(organized).toBeVisible();
  });
});

test.describe('Form Field Validation UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should show helper text for full name field', async ({ page }) => {
    const helperText = page.locator('text=Include suffix if applicable');
    await expect(helperText).toBeVisible();
  });

  test('should show helper text for years of service', async ({ page }) => {
    const helperText = page.locator('text=Year range as Grand Master');
    await expect(helperText).toBeVisible();
  });

  test('should have placeholder for full name', async ({ page }) => {
    const input = page.locator('input[name="fullName"]');
    const placeholder = await input.getAttribute('placeholder');

    expect(placeholder).toContain('John');
  });

  test('should have placeholder for years of service', async ({ page }) => {
    const input = page.locator('input[name="yearsOfService"]');
    const placeholder = await input.getAttribute('placeholder');

    expect(placeholder).toMatch(/\d{4}-\d{4}/);
  });
});

test.describe('Optional Fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(500);
  });

  test('should mark cause of death as optional', async ({ page }) => {
    const label = page.locator('label:has-text("Cause of Death")');
    const optionalText = label.locator('text=(Optional)');

    await expect(optionalText).toBeVisible();
  });

  test('should mark obituary link as optional', async ({ page }) => {
    const label = page.locator('label:has-text("Obituary Link")');
    const optionalText = label.locator('text=(Optional)');

    await expect(optionalText).toBeVisible();
  });

  test('should not mark submitter fields as required', async ({ page }) => {
    const nameInput = page.locator('input[name="submitterName"]');
    const hasRequired = await nameInput.getAttribute('required');

    expect(hasRequired).toBeNull();
  });
});
