import { test, expect } from '@playwright/test';

test.describe('Artist Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/login');
    await page.fill('input[name="email"]', 'artist@rongdhonu.art');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');
  });

  test('Artist can update profile', async ({ page }) => {
    await page.click('text=Profile');
    await expect(page.locator('h1')).toContainText('Profile Settings');
    
    await page.fill('input[name="full_name_en"]', 'Updated Artist Name');
    await page.click('button[type="submit"]');
    
    // Expect success toast
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test('Artist can navigate to artwork submission', async ({ page }) => {
    await page.click('text=My Artworks');
    await page.click('text=Submit New Artwork');
    await expect(page.locator('h1')).toContainText('Submit Artwork');
  });
});
