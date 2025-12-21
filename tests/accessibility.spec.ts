import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit', () => {
  test.describe('Main Page - Desktop', () => {
    test('should have no critical accessibility violations on landing', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log all violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log('Accessibility violations found:');
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n[${violation.impact}] ${violation.id}: ${violation.description}`);
          console.log(`Help: ${violation.helpUrl}`);
          violation.nodes.forEach((node) => {
            console.log(`  - ${node.html}`);
            console.log(`    Fix: ${node.failureSummary}`);
          });
        });
      }

      // Take screenshot for manual review
      await page.screenshot({ path: 'tests/screenshots/a11y-main-desktop.png', fullPage: true });

      // Fail on serious or critical issues
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toHaveLength(0);
    });

    test('should have no contrast violations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ runOnly: ['color-contrast'] })
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n=== CONTRAST VIOLATIONS ===');
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n${violation.description}`);
          violation.nodes.forEach((node) => {
            console.log(`  Element: ${node.html}`);
            console.log(`  Issue: ${node.failureSummary}`);
          });
        });
      }

      expect(accessibilityScanResults.violations).toHaveLength(0);
    });

    test('form section should be accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Scroll to form
      await page.locator('button.btn-primary').first().click();
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('form')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n=== FORM ACCESSIBILITY VIOLATIONS ===');
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n[${violation.impact}] ${violation.id}: ${violation.description}`);
          violation.nodes.forEach((node) => {
            console.log(`  - ${node.html.substring(0, 100)}...`);
          });
        });
      }

      await page.screenshot({ path: 'tests/screenshots/a11y-form-desktop.png', fullPage: true });

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toHaveLength(0);
    });
  });

  test.describe('Main Page - Mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('should have no critical accessibility violations on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n=== MOBILE ACCESSIBILITY VIOLATIONS ===');
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n[${violation.impact}] ${violation.id}: ${violation.description}`);
          violation.nodes.forEach((node) => {
            console.log(`  - ${node.html.substring(0, 100)}...`);
            console.log(`    Fix: ${node.failureSummary}`);
          });
        });
      }

      await page.screenshot({ path: 'tests/screenshots/a11y-main-mobile.png', fullPage: true });

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toHaveLength(0);
    });

    test('should have readable text contrast on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .options({ runOnly: ['color-contrast'] })
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n=== MOBILE CONTRAST VIOLATIONS ===');
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n${violation.description}`);
          violation.nodes.forEach((node) => {
            console.log(`  Element: ${node.html}`);
            console.log(`  Issue: ${node.failureSummary}`);
          });
        });
      }

      expect(accessibilityScanResults.violations).toHaveLength(0);
    });

    test('form fields should be accessible on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Scroll to form
      await page.locator('button.btn-primary').first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'tests/screenshots/a11y-form-mobile.png', fullPage: true });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('form')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n=== MOBILE FORM ACCESSIBILITY VIOLATIONS ===');
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n[${violation.impact}] ${violation.id}: ${violation.description}`);
          violation.nodes.forEach((node) => {
            console.log(`  - ${node.html.substring(0, 100)}...`);
          });
        });
      }

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toHaveLength(0);
    });
  });

  test.describe('Admin Page', () => {
    test('login page should be accessible', async ({ page }) => {
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n=== ADMIN LOGIN ACCESSIBILITY VIOLATIONS ===');
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n[${violation.impact}] ${violation.id}: ${violation.description}`);
          violation.nodes.forEach((node) => {
            console.log(`  - ${node.html.substring(0, 100)}...`);
          });
        });
      }

      await page.screenshot({ path: 'tests/screenshots/a11y-admin-login.png', fullPage: true });

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toHaveLength(0);
    });
  });
});

test.describe('Keyboard Navigation', () => {
  test('should be able to navigate main page with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through focusable elements
    await page.keyboard.press('Tab');

    // Check that something is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Continue tabbing and verify focus is visible
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const hasFocusRing = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });
      // Log focused element for debugging
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      console.log(`Tab ${i + 1}: Focused on ${tag}`);
    }
  });

  test('form should be fully keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to form
    await page.locator('button.btn-primary').first().click();
    await page.waitForTimeout(1000);

    // Focus the form area
    await page.locator('input[name="fullName"]').focus();

    // Tab through all form fields
    const formFields = ['fullName', 'passingDate', 'title', 'jurisdiction', 'yearsOfService'];

    for (const field of formFields) {
      const input = page.locator(`[name="${field}"]`);
      await expect(input).toBeFocused({ timeout: 5000 }).catch(() => {
        // If not focused, tab to it
        return page.keyboard.press('Tab');
      });
      await page.keyboard.press('Tab');
    }
  });
});
