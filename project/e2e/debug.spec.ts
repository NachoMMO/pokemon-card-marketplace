import { test, expect } from '@playwright/test'

test.describe('Debug User Account Creation', () => {
  test('Debug registration form', async ({ page }) => {
    // Enable request/response logging
    page.on('request', request => console.log('REQUEST:', request.url()))
    page.on('response', response => console.log('RESPONSE:', response.url(), response.status()))

    // Mock Supabase signup endpoint
    page.route('https://bvmihvseexcqnlmxdnox.supabase.co/auth/v1/signup*', async (route) => {
      console.log('MOCK: Intercepting signup request')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
            email: 'john.doe@example.com',
            email_confirmed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          session: null
        })
      })
    })

    // Mock user_profiles endpoint for successful profile creation
    page.route('https://bvmihvseexcqnlmxdnox.supabase.co/rest/v1/user_profiles*', async (route) => {
      const method = route.request().method()
      console.log('MOCK: Intercepting user_profiles request:', method)

      if (method === 'POST') {
        // Successful profile creation
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([{
            user_id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        })
      } else {
        // For SELECT requests, return empty array
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        })
      }
    })

    // Navigate to register page
    await page.goto('/register')

    // Wait for page to load completely
    await page.waitForLoadState('networkidle')

    // Check if form is present
    await expect(page.locator('[data-testid="create-account-button"]')).toBeVisible()

    // Fill the form
    await page.fill('[data-testid="name-input"]', 'John Doe')
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com')
    await page.fill('[data-testid="password-input"]', 'MySecurePassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'MySecurePassword123!')
    await page.check('[data-testid="terms-checkbox"]')

    // Submit the form
    await page.click('[data-testid="create-account-button"]')

    // Wait for some response
    await page.waitForTimeout(5000)

    // Check what's on the page
    const bodyText = await page.textContent('body')
    console.log('Page content after submit:', bodyText)
  })
})
