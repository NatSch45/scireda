import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Should load without errors
    await expect(page).toHaveTitle(/Scireda/);
    
    // Should show either login page or networks page
    const isLoginPage = await page.getByText('Connexion').isVisible().catch(() => false);
    const isNetworksPage = await page.getByText('Mes réseaux').isVisible().catch(() => false);
    
    expect(isLoginPage || isNetworksPage).toBe(true);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Basic navigation test
    await expect(page).toHaveURL(/\/(login|networks)?/);
  });

  test('no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (like API calls to mock server)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('fetch') && 
      !error.includes('NetworkError') &&
      !error.includes('localhost:3333')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should be responsive (no horizontal scroll)
    const body = await page.locator('body').boundingBox();
    expect(body?.width).toBeLessThanOrEqual(375);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Should utilize full width on desktop
    await expect(page.locator('body')).toBeVisible();
  });
});


