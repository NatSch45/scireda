import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login or show login form
    await expect(page.getByText('Connexion')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Mot de passe')).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/');
    
    // Fill invalid credentials
    await page.getByPlaceholder('Email').fill('invalid-email');
    await page.getByPlaceholder('Mot de passe').fill('short');
    
    // Submit form
    await page.getByRole('button', { name: /connexion/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email invalide/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    // Click register link
    await page.getByText(/créer un compte/i).click();
    
    // Should show register form
    await expect(page.getByText('Inscription')).toBeVisible();
    await expect(page.getByPlaceholder('Nom d\'utilisateur')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Mot de passe')).toBeVisible();
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register');
    
    // Fill invalid data
    await page.getByPlaceholder('Nom d\'utilisateur').fill('a'); // Too short
    await page.getByPlaceholder('Email').fill('invalid-email');
    await page.getByPlaceholder('Mot de passe').fill('123'); // Too short
    
    // Submit form
    await page.getByRole('button', { name: /inscription/i }).click();
    
    // Should show validation errors
    await expect(page.locator('.text-red-400')).toHaveCount(3);
  });
});
