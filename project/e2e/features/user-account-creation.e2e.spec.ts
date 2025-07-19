import { test, expect } from '@playwright/test'

test.describe('User Account Creation Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')

    // Wait for the registration form to be visible
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible()
  })

  test('should successfully create account with valid data', async ({ page }) => {
    // Given: I am an unregistered visitor on the registration page

    // When: I enter valid data
    await page.fill('[data-testid="name-field"]', 'Juan Pérez')
    await page.fill('[data-testid="email-field"]', 'juan.perez@example.com')
    await page.fill('[data-testid="password-field"]', 'MiPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'MiPassword123!')
    await page.check('[data-testid="terms-checkbox"]')

    // And: I click the "Create account" button
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see the success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Account created successfully')

    // And: I should see confirmation email notice
    await expect(page.locator('[data-testid="email-confirmation-notice"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-confirmation-notice"]')).toContainText('juan.perez@example.com')

    // Note: In a real scenario, we would also test:
    // - Email confirmation would be tested with email service mocks
    // - Redirect to welcome page would be verified
    // - Account status "pending verification" would be checked in database
  })

  test('should show error when trying to create account with existing email', async ({ page }) => {
    // Given: There is a registered user with email "juan.perez@example.com"
    // Note: In a real scenario, we would seed the test database with existing user

    // When: I enter data with existing email
    await page.fill('[data-testid="name-field"]', 'María González')
    await page.fill('[data-testid="email-field"]', 'juan.perez@example.com')  // Existing email
    await page.fill('[data-testid="password-field"]', 'AnotherPassword456!')
    await page.fill('[data-testid="confirm-password-field"]', 'AnotherPassword456!')
    await page.check('[data-testid="terms-checkbox"]')

    // And: I click the "Create account" button
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see the error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('This email is already registered')

    // And: I should remain on the registration page
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible()

    // And: No success message should be shown
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible()
  })

  test('should show error when passwords do not match', async ({ page }) => {
    // When: I enter mismatched passwords
    await page.fill('[data-testid="name-field"]', 'Carlos López')
    await page.fill('[data-testid="email-field"]', 'carlos.lopez@example.com')
    await page.fill('[data-testid="password-field"]', 'MiPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'AnotherPassword456!')
    await page.check('[data-testid="terms-checkbox"]')

    // And: I click the "Create account" button
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see the error message
    await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('Passwords do not match')

    // And: No success message should be shown
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible()
  })

  test('should show validation errors for empty required fields', async ({ page }) => {
    // When: I click create account without filling any data
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see validation errors for all required fields
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required')

    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required')

    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required')

    await expect(page.locator('[data-testid="terms-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="terms-error"]')).toContainText('terms and conditions')
  })

  test('should validate email format', async ({ page }) => {
    // When: I enter invalid email format
    await page.fill('[data-testid="name-field"]', 'Test User')
    await page.fill('[data-testid="email-field"]', 'invalid-email-format')
    await page.fill('[data-testid="password-field"]', 'ValidPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'ValidPassword123!')
    await page.check('[data-testid="terms-checkbox"]')

    // And: I click create account
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see email format validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format')
  })

  test('should validate password strength', async ({ page }) => {
    // When: I enter weak password
    await page.fill('[data-testid="name-field"]', 'Test User')
    await page.fill('[data-testid="email-field"]', 'test@example.com')
    await page.fill('[data-testid="password-field"]', '123')  // Weak password
    await page.fill('[data-testid="confirm-password-field"]', '123')
    await page.check('[data-testid="terms-checkbox"]')

    // And: I click create account
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see password strength validation error
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters long')
  })

  test('should show loading state during account creation', async ({ page }) => {
    // Given: I fill the form with valid data
    await page.fill('[data-testid="name-field"]', 'Juan Pérez')
    await page.fill('[data-testid="email-field"]', 'juan.perez@example.com')
    await page.fill('[data-testid="password-field"]', 'MiPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'MiPassword123!')
    await page.check('[data-testid="terms-checkbox"]')

    // When: I click the create account button
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see loading state immediately (before response)
    // Note: This might be very fast, so we may need to add network delays in tests
    const submitButton = page.locator('[data-testid="create-account-button"]')

    // The button should be disabled during loading
    await expect(submitButton).toBeDisabled()
  })

  test('should require terms acceptance', async ({ page }) => {
    // When: I fill valid data but don't accept terms
    await page.fill('[data-testid="name-field"]', 'Test User')
    await page.fill('[data-testid="email-field"]', 'test@example.com')
    await page.fill('[data-testid="password-field"]', 'ValidPassword123!')
    await page.fill('[data-testid="confirm-password-field"]', 'ValidPassword123!')
    // Don't check terms checkbox

    // And: I click create account
    await page.click('[data-testid="create-account-button"]')

    // Then: I should see terms validation error
    await expect(page.locator('[data-testid="terms-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="terms-error"]')).toContainText('terms and conditions')

    // And: No success message should appear
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible()
  })
})
