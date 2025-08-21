import { test, expect } from '@playwright/test';

async function setupNoteEditor(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
  });
  
  // Mock auth and network data
  await page.route('**/scireda-api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        email: 'test@example.com',
        username: 'testuser'
      })
    });
  });

  await page.route('**/scireda-api/networks', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        id: 1,
        name: 'Test Network',
        userId: '1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }])
    });
  });

  await page.route('**/scireda-api/folders/top-level?networkId=1', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.route('**/scireda-api/notes/top-level?networkId=1', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          title: 'Test Note',
          content: '# Test Note\n\nThis is a test note content.',
          networkId: 1,
          parentId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ])
    });
  });
}

test.describe('Note Editor', () => {
  test.beforeEach(async ({ page }) => {
    await setupNoteEditor(page);
  });

  test('should display note editor when note is selected', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Select note
    await page.getByText('Test Note').click();
    
    // Should show editor with note content
    await expect(page.getByDisplayValue('Test Note')).toBeVisible();
    await expect(page.getByText('# Test Note')).toBeVisible();
    await expect(page.getByText('This is a test note content')).toBeVisible();
  });

  test('should show save status indicator', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Select note
    await page.getByText('Test Note').click();
    
    // Should show saved status
    await expect(page.getByText('Sauvegardé')).toBeVisible();
    await expect(page.locator('.bg-green-400')).toBeVisible();
  });

  test('should show unsaved changes indicator when editing', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Select note
    await page.getByText('Test Note').click();
    
    // Edit title
    await page.getByDisplayValue('Test Note').fill('Modified Test Note');
    
    // Should show unsaved changes
    await expect(page.getByText('Modifications non sauvegardées')).toBeVisible();
    await expect(page.locator('.bg-orange-400')).toBeVisible();
  });

  test('should auto-save after editing title', async ({ page }) => {
    // Mock update API
    await page.route('**/scireda-api/notes/1', async route => {
      if (route.request().method() === 'PUT') {
        const putData = await route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: putData.title,
            content: putData.content,
            networkId: 1,
            parentId: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: new Date().toISOString()
          })
        });
      }
    });

    await page.goto('/networks/1');
    
    // Select note
    await page.getByText('Test Note').click();
    
    // Edit title
    await page.getByDisplayValue('Test Note').fill('Auto-saved Note');
    
    // Wait for auto-save (2 seconds timeout)
    await page.waitForTimeout(2500);
    
    // Should show saved status
    await expect(page.getByText('Sauvegardé')).toBeVisible();
  });

  test('should show manual save button when there are unsaved changes', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Select note
    await page.getByText('Test Note').click();
    
    // Edit content
    await page.getByText('This is a test note content').fill('Modified content');
    
    // Should show manual save button
    await expect(page.getByRole('button', { name: /sauvegarder/i })).toBeVisible();
  });

  test('should manually save when save button is clicked', async ({ page }) => {
    // Mock update API
    await page.route('**/scireda-api/notes/1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: 'Test Note',
            content: 'Manually saved content',
            networkId: 1,
            parentId: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: new Date().toISOString()
          })
        });
      }
    });

    await page.goto('/networks/1');
    
    // Select note
    await page.getByText('Test Note').click();
    
    // Edit content
    await page.getByText('This is a test note content').fill('Manually saved content');
    
    // Click save button
    await page.getByRole('button', { name: /sauvegarder/i }).click();
    
    // Should show saved status
    await expect(page.getByText('Sauvegardé')).toBeVisible();
    await expect(page.getByRole('button', { name: /sauvegarder/i })).not.toBeVisible();
  });

  test('should show empty editor state when no note is selected', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Should show empty editor
    await expect(page.getByText('Sélectionnez une note')).toBeVisible();
  });

  test('should handle editor loading state', async ({ page }) => {
    // Mock slow API response
    await page.route('**/scireda-api/notes/1', async route => {
      if (route.request().method() === 'PUT') {
        await page.waitForTimeout(1000); // Simulate slow response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: 'Test Note',
            content: 'Updated content',
            networkId: 1,
            parentId: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: new Date().toISOString()
          })
        });
      }
    });

    await page.goto('/networks/1');
    
    // Select note
    await page.getByText('Test Note').click();
    
    // Edit and save manually
    await page.getByText('This is a test note content').fill('Updated content');
    await page.getByRole('button', { name: /sauvegarder/i }).click();
    
    // Should show loading state
    await expect(page.getByText('Sauvegarde...')).toBeVisible();
  });

  test('should preserve unsaved changes when switching notes', async ({ page }) => {
    // Add another note to the mock
    await page.route('**/scireda-api/notes/top-level?networkId=1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Test Note',
            content: '# Test Note\n\nThis is a test note content.',
            networkId: 1,
            parentId: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            title: 'Second Note',
            content: '# Second Note\n\nSecond note content.',
            networkId: 1,
            parentId: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ])
      });
    });

    await page.goto('/networks/1');
    
    // Select first note
    await page.getByText('Test Note').click();
    
    // Make changes
    await page.getByDisplayValue('Test Note').fill('Modified Note');
    
    // Switch to second note - should trigger auto-save
    await page.getByText('Second Note').click();
    
    // Should show second note content
    await expect(page.getByDisplayValue('Second Note')).toBeVisible();
  });
});
