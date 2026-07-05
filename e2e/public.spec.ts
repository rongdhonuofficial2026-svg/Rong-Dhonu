import { test, expect } from '@playwright/test';

test.describe('Public Navigation & Middleware', () => {
  test('should load the homepage and redirect to default locale /en', async ({ page }) => {
    // Navigate to root
    const response = await page.goto('/');
    
    // next-intl middleware should redirect / to /en (default locale)
    expect(page.url()).toContain('/en');
    
    // Expect the title to contain Rongdhonu
    await expect(page).toHaveTitle(/Rongdhonu|রংধনু/i);
    
    // Verify the skip to content link exists (accessibility)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should enforce route protection for /dashboard', async ({ page }) => {
    await page.goto('/en/dashboard');
    
    // Middleware should redirect unauthenticated user to /login
    expect(page.url()).toContain('/en/login');
  });

  test('should enforce route protection for /admin', async ({ page }) => {
    await page.goto('/en/admin');
    
    // Middleware should redirect unauthenticated user to /login
    expect(page.url()).toContain('/en/login');
  });

  test('should render 404 for unknown routes', async ({ page }) => {
    const response = await page.goto('/en/does-not-exist');
    
    // Next.js should return a 404 status
    expect(response?.status()).toBe(404);
    
    // The not-found page should be rendered
    await expect(page.locator('h1')).toBeVisible();
  });
});
