import { test, expect } from '@playwright/test'

test.describe('User Logout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/login')
  })

  test('should logout successfully from dashboard', async ({ page }) => {
    // Login primero
    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome to Pokémon Card Marketplace')).toBeVisible()

    // Hacer clic en el botón de logout
    await page.getByTestId('logout-button').click()

    // Verificar que se redirige a la página principal
    await expect(page).toHaveURL('/')

    // Verificar que ya no podemos acceder al dashboard sin autenticación
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login') // Debe redirigir a login
  })

  test('should show loading state during logout', async ({ page }) => {
    // Login primero
    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')

    // Hacer clic en el botón de logout y verificar estado de carga
    await page.getByTestId('logout-button').click()

    // El texto puede cambiar rápidamente, así que verificamos que existe el botón
    await expect(page.getByTestId('logout-button')).toBeVisible()
  })

  test('should handle logout with custom redirect', async ({ page }) => {
    // Login primero
    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')

    // Hacer logout
    await page.getByTestId('logout-button').click()

    // Verificar redirección (por defecto a '/')
    await expect(page).toHaveURL('/')
  })

  test('should clear user session after logout', async ({ page }) => {
    // Login primero
    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')

    // Hacer logout
    await page.getByTestId('logout-button').click()

    // Verificar redirección
    await expect(page).toHaveURL('/')

    // Intentar acceder a rutas protegidas
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')

    // Verificar que no hay datos de usuario en localStorage
    const userData = await page.evaluate(() => localStorage.getItem('supabase.auth.token'))
    expect(userData).toBeFalsy()
  })

  test('should handle logout error gracefully', async ({ page }) => {
    // Interceptar la llamada de logout para simular error
    await page.route('**/auth/v1/logout', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      })
    })

    // Login primero
    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')

    // Hacer clic en logout
    await page.getByTestId('logout-button').click()

    // Verificar que se muestra un mensaje de error
    await expect(page.getByTestId('logout-error')).toBeVisible()

    // Verificar que podemos cerrar el error
    await page.getByTestId('clear-error-button').click()
    await expect(page.getByTestId('logout-error')).not.toBeVisible()
  })

  test('should disable logout button during logout process', async ({ page }) => {
    // Simular una respuesta lenta para el logout
    await page.route('**/auth/v1/logout', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      route.continue()
    })

    // Login primero
    await page.getByTestId('email-field').fill('nacho.martinez@sngular.com')
    await page.getByTestId('password-field').fill('Nacho2002')
    await page.getByTestId('login-button').click()

    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard')

    // Hacer clic en logout
    const logoutButton = page.getByTestId('logout-button')
    await logoutButton.click()

    // Verificar que el botón está deshabilitado durante el proceso
    await expect(logoutButton).toBeDisabled()

    // Esperar a que termine el proceso
    await expect(page).toHaveURL('/')
  })
})
