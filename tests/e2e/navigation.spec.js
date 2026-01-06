/**
 * E2E Tests for Navigation
 * Using Playwright
 */

const { test, expect } = require('@playwright/test');

test.describe('Navigation E2E Tests', () => {
  test('should navigate between all pages', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page).toHaveURL(/index\.html/);
    
    // Navigate to About
    await page.click('text=About');
    await expect(page).toHaveURL(/about\.html/);
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to Portfolio
    await page.click('text=Portfolio');
    await expect(page).toHaveURL(/portfolio\.html/);
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to Contact
    await page.click('text=Contact');
    await expect(page).toHaveURL(/contact\.html/);
    await expect(page.locator('h1')).toBeVisible();
    
    // Return to Home
    await page.click('text=Home');
    await expect(page).toHaveURL(/index\.html/);
  });

  test('should maintain navigation state', async ({ page }) => {
    await page.goto('/');
    
    const activeLink = page.locator('nav a').filter({ hasText: 'Home' });
    await expect(activeLink).toHaveClass(/active/);
  });

  test('should work with browser back button', async ({ page }) => {
    await page.goto('/');
    await page.click('text=About');
    await expect(page).toHaveURL(/about\.html/);
    
    await page.goBack();
    await expect(page).toHaveURL(/index\.html/);
    
    await page.goForward();
    await expect(page).toHaveURL(/about\.html/);
  });

  test('should handle invalid URLs gracefully', async ({ page }) => {
    const response = await page.goto('/invalid-page.html');
    expect(response.status()).toBe(404);
    
    await expect(page.locator('h1')).toContainText('404');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should scroll smoothly to sections', async ({ page }) => {
    await page.goto('/portfolio.html');
    
    await page.click('text=Contact');
    await expect(page).toHaveURL(/contact\.html/);
    
    // Verify page scrolled
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);
  });

  test('should handle external links correctly', async ({ page, context }) => {
    await page.goto('/');
    
    // Find external link
    const externalLink = page.locator('a[href^="http"]').first();
    const href = await externalLink.getAttribute('href');
    
    if (href) {
      // Should open in new tab
      const target = await externalLink.getAttribute('target');
      expect(target).toBe('_blank');
      expect(await externalLink.getAttribute('rel')).toContain('noopener');
    }
  });
});