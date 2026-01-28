import { test, expect } from '@playwright/test';

test.describe('UI Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Wait for app to load
    await page.waitForSelector('.ProseMirror', { timeout: 10000 });
  });

  test('full page - light mode', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/full-page-light.png',
      fullPage: true,
    });
  });

  test('full page - dark mode', async ({ page }) => {
    // Toggle dark mode via the toolbar button
    await page.click('[aria-label="Toggle dark mode"]');
    await page.waitForTimeout(300); // Wait for transition
    await page.screenshot({
      path: 'tests/screenshots/full-page-dark.png',
      fullPage: true,
    });
  });

  test('sidebar closed', async ({ page }) => {
    // Toggle sidebar via the toolbar button
    await page.click('[aria-label="Toggle sidebar"]');
    await page.waitForTimeout(300); // Wait for transition
    await page.screenshot({
      path: 'tests/screenshots/sidebar-closed.png',
      fullPage: true,
    });
  });

  test('sidebar closed - dark mode', async ({ page }) => {
    // Toggle sidebar and dark mode
    await page.click('[aria-label="Toggle sidebar"]');
    await page.click('[aria-label="Toggle dark mode"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'tests/screenshots/sidebar-closed-dark.png',
      fullPage: true,
    });
  });

  test('editor with content', async ({ page }) => {
    // Focus the editor and add content
    const editor = page.locator('.ProseMirror');
    await editor.click();

    // Type sample content with formatting
    await page.keyboard.type('Welcome to ClearType');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('This is a rich text editor built with TipTap.');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Features:');
    await page.keyboard.press('Enter');
    // Create a bullet list
    await page.keyboard.type('- Dark mode support');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- Document management');
    await page.keyboard.press('Enter');
    await page.keyboard.type('- Auto-save');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Enjoy writing!');

    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'tests/screenshots/editor-with-content.png',
      fullPage: true,
    });
  });

  test('editor with content - dark mode', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    await editor.click();

    await page.keyboard.type('Dark Mode Editor');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Testing the dark theme appearance.');

    // Toggle dark mode
    await page.click('[aria-label="Toggle dark mode"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'tests/screenshots/editor-content-dark.png',
      fullPage: true,
    });
  });

  test('multiple documents', async ({ page }) => {
    // Create a new document
    await page.click('[aria-label="New document"]');
    await page.waitForTimeout(200);

    // Add content to the new document
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.type('Second Document');

    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'tests/screenshots/multiple-documents.png',
      fullPage: true,
    });
  });
});
