// Mock API responses for E2E tests
export function setupApiMocks(page) {
  // Mock successful user creation
  page.route('**/auth/v1/signup', async (route) => {
    const request = route.request()
    const postData = request.postDataJSON()

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

    // Simulate successful registration
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'test-user-id',
          email: postData.email,
          email_confirmed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        session: null
      })
    })
  })

  // Mock other API calls if needed
  page.route('**/rest/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] })
    })
  })
}
