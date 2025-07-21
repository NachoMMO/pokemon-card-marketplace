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

export const guestGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  try {
    const authService = container.get<ISupabaseAuthService>(DEPENDENCIES.SUPABASE_AUTH_SERVICE)
    const user = await authService.getCurrentUser()

    if (user) {
      // Usuario ya autenticado, redirigir al dashboard
      next('/dashboard')
      return
    }

    // Usuario no autenticado, permitir acceso a páginas de guest
    next()
  } catch (error) {
    console.error('Error checking authentication:', error)
    next()
  }
}
