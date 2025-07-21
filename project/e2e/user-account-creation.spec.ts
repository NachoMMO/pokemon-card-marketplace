import { test, expect } from '@playwright/test'
import { setupApiMocks } from './helpers/api-mocks.js'

test.describe('User Account Creation Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks
    await setupApiMocks(page)

    // Go to register page
    await page.goto('/register')
  })

  test('Successful account creation with valid data', async ({ page }) => {
    // Given I am an unregistered visitor
    await expect(page.locator('h1')).toContainText('Create Account')

    // When I enter the following data
    await page.fill('[data-testid="name-field"]', 'Juan Pérez')
    await page.fill('[data-testid="email-field"]', 'juan.nuevo@example.com')
    await page.fill('[data-testid="password-field"]', 'MiPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'MiPassword123!')

    // And I accept the terms and conditions
    await page.check('[data-testid="terms-checkbox"]')

    // And I click the "Create account" button
    await page.click('[data-testid="create-account-button"]')

    // Then I should see the message "Account created successfully"
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Account created successfully')

    // And I should be redirected to the welcome page
    await page.waitForURL('/welcome')
    await expect(page).toHaveURL('/welcome')

    // And I should receive a confirmation email message
    await expect(page.locator('[data-testid="email-confirmation-notice"]')).toContainText('confirmation email')
  })

  test('Attempt to create account with existing email', async ({ page }) => {
    // Mock the auth service to return error for existing email
    await page.route('**/auth/signup', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: 'This email is already registered' }
        })
      })
    })

    // When I enter data with existing email
    await page.fill('[data-testid="name-field"]', 'María González')
    await page.fill('[data-testid="email-field"]', 'juan.perez@example.com') // Existing email
    await page.fill('[data-testid="password-field"]', 'AnotherPassword456!')
    await page.fill('[data-testid="confirm-password-field"]', 'AnotherPassword456!')
    await page.check('[data-testid="terms-checkbox"]')
    await page.click('[data-testid="create-account-button"]')

    // Then I should see the error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('This email is already registered')

    // And I should remain on the registration page
    await expect(page).toHaveURL('/register')
  })

  test('Attempt to create account with mismatched passwords', async ({ page }) => {
    // When I enter mismatched passwords
    await page.fill('[data-testid="name-field"]', 'Carlos López')
    await page.fill('[data-testid="email-field"]', 'carlos.lopez@example.com')
    await page.fill('[data-testid="password-field"]', 'MiPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'AnotherPassword456!')
    await page.check('[data-testid="terms-checkbox"]')
    await page.click('[data-testid="create-account-button"]')

    // Then I should see the error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Passwords do not match')

    // And a new account should not be created (no redirect)
    await expect(page).toHaveURL('/register')
  })

  test('Form validation for required fields', async ({ page }) => {
        // When I try to submit without filling anything
    await page.click('[data-testid="create-account-button"]')

    // Then I should see validation errors for required fields
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()

    // And I should remain on the register page
    await expect(page).toHaveURL('/register')
  })

  test('Form validation for invalid email format', async ({ page }) => {
        // When I enter invalid email format
    await page.fill('[data-testid="name-field"]', 'Ana Martínez')
    await page.fill('[data-testid="email-field"]', 'invalid-email-format')
    await page.fill('[data-testid="password-field"]', 'ValidPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'ValidPassword123!')
    await page.check('[data-testid="terms-checkbox"]')
    await page.click('[data-testid="create-account-button"]')

    // Then I should see email validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format')
  })

  test('Form validation for weak password', async ({ page }) => {
    // When I enter weak password
    await page.fill('[data-testid="name-field"]', 'Test User')
    await page.fill('[data-testid="email-field"]', 'test@example.com')
    await page.fill('[data-testid="password-field"]', '123')
    await page.fill('[data-testid="confirm-password-field"]', '123')
    await page.check('[data-testid="terms-checkbox"]')
    await page.click('[data-testid="create-account-button"]')

    // Then I should see password validation error
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters long')
  })

  test('Terms and conditions requirement', async ({ page }) => {
    // When I fill valid data but don't accept terms
    await page.fill('[data-testid="name-field"]', 'Test User')
    await page.fill('[data-testid="email-field"]', 'test@example.com')
    await page.fill('[data-testid="password-field"]', 'Password123!')
    await page.fill('[data-testid="confirm-password-field"]', 'Password123!')
    // Don't check terms checkbox
    await page.click('[data-testid="create-account-button"]')

    // Then I should see terms validation error
    await expect(page.locator('[data-testid="terms-error"]')).toContainText('You must accept the terms and conditions')
  })

  test('Loading state during account creation', async ({ page }) => {
    // Mock slow response to test loading state
    await page.route('**/auth/signup', async route => {
      // Add delay to simulate slow response
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user123', email: 'test@example.com' },
          error: null
        })
      })
    })

    // Fill valid form data
    await page.fill('[data-testid="name-field"]', 'Test User')
    await page.fill('[data-testid="email-field"]', 'test@example.com')
    await page.fill('[data-testid="password-field"]', 'Password123!')
    await page.fill('[data-testid="confirm-password-field"]', 'Password123!')
    await page.check('[data-testid="terms-checkbox"]')

    // Click submit button
    await page.click('[data-testid="create-account-button"]')

    // Then I should see loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    await expect(page.locator('[data-testid="create-account-button"]')).toBeDisabled()

    // Wait for completion
    await page.waitForURL('/welcome', { timeout: 10000 })
  })
})
