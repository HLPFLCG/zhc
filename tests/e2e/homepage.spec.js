/**
 * E2E Tests for Homepage
 * Using Playwright
 */

const { test, expect } = require('@playwright/test');

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Zaitsev Holding Group/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have proper navigation menu', async ({ page }) => {
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
    
    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCount(3);
    
    await expect(navLinks.nth(0)).toHaveText('About');
    await expect(navLinks.nth(1)).toHaveText('Portfolio');
    await expect(navLinks.nth(2)).toHaveText('Contact');
  });

  test('should navigate to About page', async ({ page }) => {
    await page.click('text=About');
    await expect(page).toHaveURL(/about\.html/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to Portfolio page', async ({ page }) => {
    await page.click('text=Portfolio');
    await expect(page).toHaveURL(/portfolio\.html/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.click('text=Contact');
    await expect(page).toHaveURL(/contact\.html/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have mobile menu toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const menuToggle = page.locator('#mobileMenuToggle');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
    
    const navMenu = page.locator('#navMenu');
    await expect(navMenu).toHaveClass(/active/);
  });

  test('should have hero section', async ({ page }) => {
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('img')).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveAttribute('role', 'contentinfo');
  });

  test('should have skip links', async ({ page }) => {
    const skipLinks = page.locator('.skip-link');
    await expect(skipLinks).toHaveCount(3);
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper ARIA labels
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt');
    }
  });

  test('should handle window resize', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('nav')).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have meta tags for SEO', async ({ page }) => {
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content');
    
    const keywords = page.locator('meta[name="keywords"]');
    await expect(keywords).toHaveAttribute('content');
  });

  test('should have Open Graph tags', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content');
    
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content');
    
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content');
  });

  test('should have canonical URL', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://zaitsev.co/');
  });

  test('should have proper language attribute', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should load resources efficiently', async ({ page }) => {
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      };
    });

    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
    expect(performanceMetrics.loadComplete).toBeLessThan(10000);
  });

  test('should have structured data', async ({ page }) => {
    const structuredData = page.locator('script[type="application/ld+json"]');
    await expect(structuredData).toHaveCount(1);
    
    const content = await structuredData.textContent();
    const data = JSON.parse(content);
    
    expect(data).toHaveProperty('@context', 'https://schema.org');
    expect(data).toHaveProperty('@type', 'Organization');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(focusedElement).toBe('A');
  });

  test('should have no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(errors.length).toBe(0);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('.hero')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    }
  });
});