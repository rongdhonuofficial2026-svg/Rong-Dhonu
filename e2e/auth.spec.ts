import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization Workflows', () => {
  const login = async (page: any, email: string) => {
    await page.goto('/en/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
  };

  test('Public User cannot access dashboard', async ({ page }) => {
    await page.goto('/en/dashboard');
    expect(page.url()).toContain('/login');
  });

  test('Artist can login and see member dashboard', async ({ page }) => {
    // Note: requires database to be seeded
    await login(page, 'artist@rongdhonu.art');
    await expect(page.locator('text=My Artworks')).toBeVisible();
    await expect(page.locator('text=Admin Panel')).not.toBeVisible();
  });

  test('Committee member can access moderation tools', async ({ page }) => {
    // Note: requires database to be seeded
    await login(page, 'committee@rongdhonu.art');
    await expect(page.locator('text=Admin Panel')).toBeVisible();
    
    // Check navigation to moderation
    await page.click('text=Admin Panel');
    await expect(page.locator('text=Artwork Moderation')).toBeVisible();
  });

  test('Admin can access user management', async ({ page }) => {
    // Note: requires database to be seeded
    await login(page, 'admin@rongdhonu.art');
    await expect(page.locator('text=Admin Panel')).toBeVisible();
    
    // Admins can see user management
    await page.click('text=Admin Panel');
    await expect(page.locator('text=User Management')).toBeVisible();
  });
});
