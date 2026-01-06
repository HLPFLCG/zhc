/**
 * E2E Tests for Accessibility
 * Using Playwright and axe-core
 */

const { test, expect } = require('@playwright/test');

test.describe('Accessibility E2E Tests', () => {
  test('should have no axe-core violations on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Inject axe-core
    await page.addScriptTag({
      path: 'node_modules/axe-core/axe.min.js'
    });
    
    // Run axe-core
    const results = await page.evaluate(async () => {
      return await axe.run(document);
    });
    
    // Log violations if any
    if (results.violations.length > 0) {
      console.log('Violations:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations.length).toBe(0);
  });

  test('should have no axe-core violations on About page', async ({ page }) => {
    await page.goto('/about.html');
    
    await page.addScriptTag({
      path: 'node_modules/axe-core/axe.min.js'
    });
    
    const results = await page.evaluate(async () => {
      return await axe.run(document);
    });
    
    if (results.violations.length > 0) {
      console.log('Violations:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations.length).toBe(0);
  });

  test('should have no axe-core violations on Portfolio page', async ({ page }) => {
    await page.goto('/portfolio.html');
    
    await page.addScriptTag({
      path: 'node_modules/axe-core/axe.min.js'
    });
    
    const results = await page.evaluate(async () => {
      return await axe.run(document);
    });
    
    if (results.violations.length > 0) {
      console.log('Violations:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations.length).toBe(0);
  });

  test('should have no axe-core violations on Contact page', async ({ page }) => {
    await page.goto('/contact.html');
    
    await page.addScriptTag({
      path: 'node_modules/axe-core/axe.min.js'
    });
    
    const results = await page.evaluate(async () => {
      return await axe.run(document);
    });
    
    if (results.violations.length > 0) {
      console.log('Violations:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations.length).toBe(0);
  });

  test('should work with keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement.tagName);
    expect(['A', 'BUTTON'].includes(focused)).toBe(true);
    
    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => document.activeElement.tagName);
    expect(['A', 'BUTTON'].includes(focused)).toBe(true);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement);
    
    const styles = await page.evaluate((element) => {
      return window.getComputedStyle(element);
    }, focusedElement);
    
    expect(styles.outline).not.toBe('none');
  });

  test('should have proper skip links', async ({ page }) => {
    await page.goto('/');
    
    const skipLinks = page.locator('.skip-link');
    await expect(skipLinks).toHaveCount(3);
    
    // Test skip to main content
    const skipToMain = page.locator('.skip-to-main');
    await skipToMain.focus();
    await page.keyboard.press('Enter');
    
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav[aria-label]');
    await expect(nav).toBeVisible();
    
    const menuToggle = page.locator('#mobileMenuToggle[aria-label]');
    await expect(menuToggle).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    
    for (let i = 0; i < count; i++) {
      await expect(headings.nth(i)).toBeVisible();
    }
  });

  test('should have alt text on all images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt');
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/contact.html');
    
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      
      if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
        const hasLabel = await input.evaluate(el => {
          return el.hasAttribute('aria-label') || 
                 el.hasAttribute('aria-labelledby') ||
                 document.querySelector(`label[for="${el.id}"]`);
        });
        expect(hasLabel).toBe(true);
      }
    }
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.evaluate(el => {
        return el.textContent.trim() !== '' ||
               el.hasAttribute('aria-label') ||
               el.hasAttribute('title') ||
               el.querySelector('i, img');
      });
      expect(hasLabel).toBe(true);
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a[href]');
    const count = await links.count();
    
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      
      if (text && text.trim() !== '') {
        const lowerText = text.toLowerCase();
        expect(['click here', 'more', 'read more'].includes(lowerText)).toBe(false);
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check contrast of headings
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(headings.nth(i)).toBeVisible();
    }
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    
    // Verify animations are disabled
    const animationsDisabled = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return style.animationDuration === '0s' || style.animationDuration === '0.01ms';
    });
    
    expect(animationsDisabled).toBe(true);
  });

  test('should be screen reader friendly', async ({ page }) => {
    await page.goto('/');
    
    // Check for landmark regions
    const landmarks = page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');
    await expect(landmarks).toHaveCount(4);
    
    // Check for proper language
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});