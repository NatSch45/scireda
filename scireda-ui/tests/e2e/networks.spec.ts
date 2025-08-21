import { test, expect } from '@playwright/test';

// Helper function to mock authentication
async function mockAuth(page: any) {
  // Mock the authentication token
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
  });
  
  // Mock API responses
  await page.route('**/scireda-api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      })
    });
  });

  await page.route('**/scireda-api/networks', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Mon premier réseau',
            userId: '1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            name: 'Réseau de recherche',
            userId: '1',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
          }
        ])
      });
    }
  });
}

test.describe('Networks Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test('should display networks list', async ({ page }) => {
    await page.goto('/networks');
    
    // Should show networks
    await expect(page.getByText('Mon premier réseau')).toBeVisible();
    await expect(page.getByText('Réseau de recherche')).toBeVisible();
    
    // Should show create button
    await expect(page.getByRole('button', { name: /nouveau réseau/i })).toBeVisible();
  });

  test('should open network creation modal', async ({ page }) => {
    await page.goto('/networks');
    
    // Click create network button
    await page.getByRole('button', { name: /nouveau réseau/i }).click();
    
    // Should show modal
    await expect(page.getByText('Créer un nouveau réseau')).toBeVisible();
    await expect(page.getByPlaceholder('Nom du réseau')).toBeVisible();
    await expect(page.getByRole('button', { name: /créer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /annuler/i })).toBeVisible();
  });

  test('should create a new network', async ({ page }) => {
    // Mock network creation
    await page.route('**/scireda-api/networks', async route => {
      if (route.request().method() === 'POST') {
        const postData = await route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 3,
            name: postData.name,
            userId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        });
      }
    });

    await page.goto('/networks');
    
    // Open creation modal
    await page.getByRole('button', { name: /nouveau réseau/i }).click();
    
    // Fill form
    await page.getByPlaceholder('Nom du réseau').fill('Nouveau réseau test');
    
    // Submit
    await page.getByRole('button', { name: /créer/i }).click();
    
    // Modal should close
    await expect(page.getByText('Créer un nouveau réseau')).not.toBeVisible();
  });

  test('should navigate to network workspace', async ({ page }) => {
    await page.goto('/networks');
    
    // Click on a network
    await page.getByText('Mon premier réseau').click();
    
    // Should navigate to workspace
    await expect(page.url()).toContain('/networks/1');
  });

  test('should show empty state when no networks', async ({ page }) => {
    // Mock empty networks response
    await page.route('**/scireda-api/networks', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.goto('/networks');
    
    // Should show empty state
    await expect(page.getByText(/aucun réseau/i)).toBeVisible();
    await expect(page.getByText(/créez votre premier réseau/i)).toBeVisible();
  });
});
