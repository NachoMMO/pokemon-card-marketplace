import { test, expect } from '@playwright/test'

test.describe('Authentication Guards', () => {
  test('should redirect authenticated user from login page to dashboard', async ({ page }) => {
    // Primero hacer login
    await page.goto('/login')

    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')

    // Ahora intentar ir a páginas de guest - deben redirigir al dashboard
    await page.goto('/login')
    await expect(page).toHaveURL('/dashboard')

    await page.goto('/register')
    await expect(page).toHaveURL('/dashboard')

    await page.goto('/')
    await expect(page).toHaveURL('/dashboard')

    await page.goto('/welcome')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
    // Intentar acceder al dashboard sin estar autenticado
    await page.goto('/dashboard')

    // Debe redirigir a login
    await expect(page).toHaveURL('/login')
  })

  test('should redirect authenticated user with confirmed email from onboarding to dashboard', async ({ page }) => {
    // Primero hacer login
    await page.goto('/login')

    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')

    // Intentar ir a onboarding - debe redirigir al dashboard (usuario con email confirmado)
    await page.goto('/onboarding')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should redirect unauthenticated user from onboarding to login', async ({ page }) => {
    // Intentar acceder a onboarding sin estar autenticado
    await page.goto('/onboarding')

    // Debe redirigir a login
    await expect(page).toHaveURL('/login')
  })
})
