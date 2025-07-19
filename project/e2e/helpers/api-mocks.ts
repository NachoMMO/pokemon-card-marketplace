import { Page } from '@playwright/test'

// Mock API responses for E2E tests
export function setupApiMocks(page: Page) {
  // Mock Supabase signup endpoint
  page.route('https://bvmihvseexcqnlmxdnox.supabase.co/auth/v1/signup*', async (route) => {
    const request = route.request()
    const postData = request.postDataJSON() as { email: string; password: string }

    console.log('Intercepted signup request for email:', postData.email)

    // Simulate existing email error
    if (postData.email === 'juan.perez@example.com') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: 'User already registered'
          }
        })
      })
      return
    }

    // Simulate successful registration with proper UUID
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
          email: postData.email,
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

  // Mock other Supabase REST API calls if needed
  page.route('https://bvmihvseexcqnlmxdnox.supabase.co/rest/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    })
  })
}
