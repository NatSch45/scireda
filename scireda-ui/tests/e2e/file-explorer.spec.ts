import { test, expect } from '@playwright/test';

// Helper function to setup authenticated state with network data
async function setupWorkspace(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
  });
  
  // Mock auth
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

  // Mock networks
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

  // Mock top-level folders
  await page.route('**/scireda-api/folders/top-level?networkId=1', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          name: 'Documents',
          networkId: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          network: {
            id: 1,
            name: 'Test Network',
            userId: '1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          notes: [
            {
              id: 1,
              title: 'Note dans dossier',
              content: 'Contenu de la note',
              networkId: 1,
              parentId: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ],
          subFolders: []
        }
      ])
    });
  });

  // Mock top-level notes
  await page.route('**/scireda-api/notes/top-level?networkId=1', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 2,
          title: 'Note principale',
          content: '# Note principale\n\nContenu de la note principale',
          networkId: 1,
          parentId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ])
    });
  });
}

test.describe('File Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await setupWorkspace(page);
  });

  test('should display file explorer with folders and notes', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Should show explorer
    await expect(page.getByText('Explorateur')).toBeVisible();
    
    // Should show folder
    await expect(page.getByText('Documents')).toBeVisible();
    
    // Should show top-level note
    await expect(page.getByText('Note principale')).toBeVisible();
    
    // Should show create buttons
    await expect(page.getByRole('button', { name: /dossier/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /note/i })).toBeVisible();
  });

  test('should expand folder on click', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Click on folder to expand
    await page.locator('svg').first().click(); // Expand button
    
    // Should show folder contents
    await expect(page.getByText('Note dans dossier')).toBeVisible();
  });

  test('should expand folder on double-click name', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Double-click on folder name
    await page.getByText('Documents').dblclick();
    
    // Should show folder contents
    await expect(page.getByText('Note dans dossier')).toBeVisible();
  });

  test('should select note and display in editor', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Click on note
    await page.getByText('Note principale').click();
    
    // Should show note in editor
    await expect(page.getByDisplayValue('Note principale')).toBeVisible();
    await expect(page.getByText('# Note principale')).toBeVisible();
  });

  test('should show create note form', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Click create note button
    await page.getByRole('button', { name: /note/i }).click();
    
    // Should show form
    await expect(page.getByPlaceholder('Nom de la note')).toBeVisible();
    await expect(page.getByRole('button', { name: /créer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /annuler/i })).toBeVisible();
  });

  test('should show create folder form', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Click create folder button
    await page.getByRole('button', { name: /dossier/i }).click();
    
    // Should show form
    await expect(page.getByPlaceholder('Nom du dossier')).toBeVisible();
    await expect(page.getByRole('button', { name: /créer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /annuler/i })).toBeVisible();
  });

  test('should create new note', async ({ page }) => {
    // Mock note creation
    await page.route('**/scireda-api/notes', async route => {
      if (route.request().method() === 'POST') {
        const postData = await route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 3,
            title: postData.title,
            content: postData.content,
            networkId: postData.networkId,
            parentId: postData.parentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        });
      }
    });

    await page.goto('/networks/1');
    
    // Create note
    await page.getByRole('button', { name: /note/i }).click();
    await page.getByPlaceholder('Nom de la note').fill('Nouvelle note test');
    await page.getByRole('button', { name: /créer/i }).click();
    
    // Form should close
    await expect(page.getByPlaceholder('Nom de la note')).not.toBeVisible();
  });

  test('should show delete confirmation modal', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Hover over note to show delete button
    await page.getByText('Note principale').hover();
    
    // Click delete button
    await page.locator('[title="Supprimer la note"]').click();
    
    // Should show confirmation modal
    await expect(page.getByText('Supprimer la note')).toBeVisible();
    await expect(page.getByText('Êtes-vous sûr de vouloir supprimer')).toBeVisible();
    await expect(page.getByRole('button', { name: /supprimer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /annuler/i })).toBeVisible();
  });

  test('should show empty state when no content', async ({ page }) => {
    // Mock empty responses
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
        body: JSON.stringify([])
      });
    });

    await page.goto('/networks/1');
    
    // Should show empty state
    await expect(page.getByText('Commencez votre recherche')).toBeVisible();
    await expect(page.getByText('Ce réseau est vide')).toBeVisible();
  });
});
