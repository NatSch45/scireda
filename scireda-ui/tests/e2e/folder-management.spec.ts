import { test, expect } from '@playwright/test';

async function setupFolderTests(page: any) {
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
              title: 'Note in folder',
              content: 'Content',
              networkId: 1,
              parentId: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ],
          subFolders: [
            {
              id: 2,
              name: 'Subfolder',
              networkId: 1,
              parentId: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ]
        },
        {
          id: 3,
          name: 'Empty Folder',
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
          notes: [],
          subFolders: []
        }
      ])
    });
  });

  await page.route('**/scireda-api/notes/top-level?networkId=1', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // Mock folder content API
  await page.route('**/scireda-api/folders/2', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 2,
        name: 'Subfolder',
        networkId: 1,
        parentId: 1,
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
            id: 2,
            title: 'Note in subfolder',
            content: 'Subfolder content',
            networkId: 1,
            parentId: 2,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        subFolders: []
      })
    });
  });
}

test.describe('Folder Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupFolderTests(page);
  });

  test('should display folders with item counts', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Should show folders with counts
    await expect(page.getByText('Documents')).toBeVisible();
    await expect(page.getByText('(2)')).toBeVisible(); // 1 note + 1 subfolder
    
    await expect(page.getByText('Empty Folder')).toBeVisible();
    await expect(page.getByText('(0)')).toBeVisible();
  });

  test('should expand folder and show contents', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Click expand button
    await page.locator('button').first().click();
    
    // Should show folder contents
    await expect(page.getByText('Note in folder')).toBeVisible();
    await expect(page.getByText('Subfolder')).toBeVisible();
  });

  test('should expand nested subfolder', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Expand main folder
    await page.locator('button').first().click();
    
    // Wait for subfolder to appear and expand it
    await expect(page.getByText('Subfolder')).toBeVisible();
    await page.getByText('Subfolder').locator('..').locator('button').first().click();
    
    // Should show subfolder content
    await expect(page.getByText('Note in subfolder')).toBeVisible();
  });

  test('should show context menu on folder hover', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Hover over folder
    await page.getByText('Documents').hover();
    
    // Should show action buttons
    await expect(page.locator('[title="Créer une note dans ce dossier"]')).toBeVisible();
    await expect(page.locator('[title="Créer un sous-dossier"]')).toBeVisible();
    await expect(page.locator('[title="Supprimer le dossier"]')).toBeVisible();
  });

  test('should create note in folder', async ({ page }) => {
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
    
    // Hover and click create note button
    await page.getByText('Documents').hover();
    await page.locator('[title="Créer une note dans ce dossier"]').click();
    
    // Should show form with folder context
    await expect(page.getByPlaceholder('Nom de la note')).toBeVisible();
    
    // Create note
    await page.getByPlaceholder('Nom de la note').fill('New note in folder');
    await page.getByRole('button', { name: /créer/i }).click();
    
    // Form should close
    await expect(page.getByPlaceholder('Nom de la note')).not.toBeVisible();
  });

  test('should create subfolder', async ({ page }) => {
    // Mock folder creation
    await page.route('**/scireda-api/folders', async route => {
      if (route.request().method() === 'POST') {
        const postData = await route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 4,
            name: postData.name,
            networkId: postData.networkId,
            parentId: postData.parentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        });
      }
    });

    await page.goto('/networks/1');
    
    // Hover and click create subfolder button
    await page.getByText('Documents').hover();
    await page.locator('[title="Créer un sous-dossier"]').click();
    
    // Should show form
    await expect(page.getByPlaceholder('Nom du dossier')).toBeVisible();
    
    // Create subfolder
    await page.getByPlaceholder('Nom du dossier').fill('New subfolder');
    await page.getByRole('button', { name: /créer/i }).click();
    
    // Form should close
    await expect(page.getByPlaceholder('Nom du dossier')).not.toBeVisible();
  });

  test('should delete empty folder with simple confirmation', async ({ page }) => {
    // Mock folder deletion
    await page.route('**/scireda-api/folders/3', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      }
    });

    await page.goto('/networks/1');
    
    // Hover and click delete button for empty folder
    await page.getByText('Empty Folder').hover();
    await page.locator('[title="Supprimer le dossier"]').click();
    
    // Should show simple confirmation modal
    await expect(page.getByText('Supprimer le dossier')).toBeVisible();
    await expect(page.getByText('Êtes-vous sûr de vouloir supprimer le dossier "Empty Folder"')).toBeVisible();
    
    // Confirm deletion
    await page.getByRole('button', { name: /supprimer/i }).click();
    
    // Modal should close
    await expect(page.getByText('Supprimer le dossier')).not.toBeVisible();
  });

  test('should delete non-empty folder with force confirmation', async ({ page }) => {
    // Mock folder content check and deletion
    await page.route('**/scireda-api/folders/1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      }
    });

    await page.goto('/networks/1');
    
    // Hover and click delete button for non-empty folder
    await page.getByText('Documents').hover();
    await page.locator('[title="Supprimer le dossier"]').click();
    
    // Should show warning modal
    await expect(page.getByText('Dossier non vide')).toBeVisible();
    await expect(page.getByText('Le dossier "Documents" contient des éléments')).toBeVisible();
    
    // Continue to force delete
    await page.getByRole('button', { name: /continuer/i }).click();
    
    // Should show force delete confirmation
    await expect(page.getByText('⚠️ Suppression définitive')).toBeVisible();
    await expect(page.getByText('ATTENTION : Cette action est irréversible')).toBeVisible();
    
    // Confirm force deletion
    await page.getByRole('button', { name: /supprimer définitivement/i }).click();
    
    // Modal should close
    await expect(page.getByText('⚠️ Suppression définitive')).not.toBeVisible();
  });

  test('should cancel folder deletion', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Hover and click delete button
    await page.getByText('Empty Folder').hover();
    await page.locator('[title="Supprimer le dossier"]').click();
    
    // Cancel deletion
    await page.getByRole('button', { name: /annuler/i }).click();
    
    // Modal should close, folder should remain
    await expect(page.getByText('Supprimer le dossier')).not.toBeVisible();
    await expect(page.getByText('Empty Folder')).toBeVisible();
  });

  test('should not show hover effect on empty folder expand button', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Find empty folder expand button
    const emptyFolderRow = page.getByText('Empty Folder').locator('..');
    const expandButton = emptyFolderRow.locator('button').first();
    
    // Button should be disabled and not have hover effect
    await expect(expandButton).toBeDisabled();
    
    // Hover should not show background color
    await expandButton.hover();
    // The button should not have hover:bg-slate-600 class applied when disabled
  });

  test('should double-click folder name to expand', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Double-click on folder name
    await page.getByText('Documents').dblclick();
    
    // Should expand and show contents
    await expect(page.getByText('Note in folder')).toBeVisible();
    await expect(page.getByText('Subfolder')).toBeVisible();
  });

  test('should not expand empty folder on double-click', async ({ page }) => {
    await page.goto('/networks/1');
    
    // Double-click on empty folder name
    await page.getByText('Empty Folder').dblclick();
    
    // Should not expand (no content to show)
    // Verify no additional content appears
    const folderContent = page.locator('.ml-4');
    await expect(folderContent).toHaveCount(0);
  });
});
