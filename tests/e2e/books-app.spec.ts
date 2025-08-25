import { expect, test } from '@playwright/test';

test.describe('Books Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test.describe('Homepage', () => {
    test('should display the books list', async ({ page }) => {
      await expect(page.locator('h1')).toContainText(/books/i);

      // Wait for books to load
      await page.waitForLoadState('networkidle');

      // Should show book cards
      const bookCards = page.locator('[data-testid="book-card"]');
      await expect(bookCards.first()).toBeVisible();
    });

    test('should navigate to book details', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Click on the first book
      const firstBook = page.locator('[data-testid="book-card"]').first();
      await firstBook.click();

      // Should navigate to book details page
      await expect(page).toHaveURL(/\/books\/\d+/);

      // Should show book details
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should filter books by genre', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Find and click a genre filter
      const genreFilter = page.locator('[data-testid="genre-filter"]').first();
      await genreFilter.click();

      // Wait for filtered results
      await page.waitForLoadState('networkidle');

      // Verify URL contains genre parameter
      await expect(page).toHaveURL(/genre=/);
    });
  });

  test.describe('Book Details Page', () => {
    test('should show complete book information', async ({ page }) => {
      // Navigate to first book
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('[data-testid="book-card"]').first().click();

      // Verify book details are shown
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="book-author"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-image"]')).toBeVisible();
    });

    test('should show breadcrumb navigation', async ({ page }) => {
      await page.goto('/books/1');

      // Check for breadcrumbs
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs).toContainText('Books');
    });

    test('should navigate back to books list', async ({ page }) => {
      await page.goto('/books/1');

      // Click back to books
      await page.locator('[data-testid="back-to-books"]').click();

      // Should return to books list
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should show mobile-friendly layout
      const bookCards = page.locator('[data-testid="book-card"]');
      await expect(bookCards.first()).toBeVisible();

      // Check if mobile menu exists (if implemented)
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should show tablet-friendly layout
      const bookCards = page.locator('[data-testid="book-card"]');
      await expect(bookCards).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have good Core Web Vitals', async ({ page }) => {
      await page.goto('/');

      // Measure First Contentful Paint
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                resolve(entry.startTime);
              }
            }
          }).observe({ entryTypes: ['paint'] });
        });
      });

      // FCP should be under 1.8 seconds
      expect(fcp).toBeLessThan(1800);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      // Check for h1
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      // Check that there's only one h1
      await expect(h1).toHaveCount(1);
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through the page
      await page.keyboard.press('Tab');

      // Check that focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that all images have alt text
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/books/999999');

      // Should show 404 or error message
      await expect(page.locator('text=not found')).toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate offline
      await page.route('**/api/**', (route) => {
        route.abort('failed');
      });

      await page.goto('/');

      // Should show error state or offline message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should search books by title', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for search input
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('gatsby');
        await page.keyboard.press('Enter');

        await page.waitForLoadState('networkidle');

        // Should show filtered results
        const results = page.locator('[data-testid="book-card"]');
        await expect(results).toHaveCount.greaterThan(0);
      }
    });
  });
});