import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { container, DEPENDENCIES } from '../../di/container'
import type { ISupabaseAuthService } from '../../../application/ports/services'

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  try {
    const authService = container.get<ISupabaseAuthService>(DEPENDENCIES.SUPABASE_AUTH_SERVICE)
    const user = await authService.getCurrentUser()

    if (!user) {
      // Usuario no autenticado, redirigir a login
      next('/login')
      return
    }

    // Usuario autenticado, permitir acceso
    next()
  } catch (error) {
    console.error('Error checking authentication:', error)
    next('/login')
  }
}

export const resetPasswordGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  try {
    // Check if there's a recovery token in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const tokenType = hashParams.get('type')

    // If this is a recovery flow, allow access regardless of session status
    if (tokenType === 'recovery') {
      next()
      return
    }

    // If no recovery token, check if there's a token in query params (fallback)
    const queryToken = to.query.token
    if (queryToken) {
      next()
      return
    }

    // No recovery token found, redirect to forgot password
    next('/forgot-password')
  } catch (error) {
    console.error('Error checking reset password access:', error)
    next('/forgot-password')
  }
}

export const guestGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  try {
    const authService = container.get<ISupabaseAuthService>(DEPENDENCIES.SUPABASE_AUTH_SERVICE)
    const user = await authService.getCurrentUser()

    if (user) {
      // Usuario autenticado, redirigir al dashboard
      next('/dashboard')
      return
    }

    // Usuario no autenticado, permitir acceso
    next()
  } catch (error) {
    console.error('Error checking authentication:', error)
    next()
  }
}

export const onboardingGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  try {
    const authService = container.get<ISupabaseAuthService>(DEPENDENCIES.SUPABASE_AUTH_SERVICE)
    const user = await authService.getCurrentUser()

    if (!user) {
      // Usuario no autenticado, redirigir a login
      next('/login')
      return
    }

    // Si el usuario está autenticado pero no tiene email confirmado,
    // es su primera vez y necesita completar el onboarding
    if (!user.emailConfirmed) {
      next()
      return
    }

    // Usuario autenticado con email confirmado ya ha completado onboarding,
    // redirigir al dashboard
    next('/dashboard')
  } catch (error) {
    console.error('Error checking authentication:', error)
    next('/login')
  }
}
