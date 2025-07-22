import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authGuard, guestGuard, onboardingGuard } from './guards'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import type { ISupabaseAuthService } from '../../../application/ports/services'
import { User } from '../../../domain/entities/User'

// Mock del container y dependencias
vi.mock('../../di/container', () => {
  const mockContainer = {
    get: vi.fn()
  }
  const DEPENDENCIES = {
    SUPABASE_AUTH_SERVICE: 'SUPABASE_AUTH_SERVICE'
  }
  return { container: mockContainer, DEPENDENCIES }
})

import { container } from '../../di/container'

describe('Router Guards', () => {
  let mockAuthService: ISupabaseAuthService
  let mockTo: RouteLocationNormalized
  let mockFrom: RouteLocationNormalized
  let mockNext: NavigationGuardNext

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      onAuthStateChange: vi.fn(),
      getAccessToken: vi.fn()
    }

    mockTo = {} as RouteLocationNormalized
    mockFrom = {} as RouteLocationNormalized
    mockNext = vi.fn()

    vi.mocked(container.get).mockReturnValue(mockAuthService)
  })

  describe('authGuard', () => {
    it('debería permitir acceso cuando el usuario está autenticado', async () => {
      // Arrange
      const mockUser = new User('123', 'test@example.com', true, new Date(), new Date())
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)

      // Act
      await authGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debería redirigir a login cuando el usuario no está autenticado', async () => {
      // Arrange
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(null)

      // Act
      await authGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith('/login')
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debería redirigir a login cuando hay un error al verificar autenticación', async () => {
      // Arrange
      vi.mocked(mockAuthService.getCurrentUser).mockRejectedValue(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      await authGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith('/login')
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking authentication:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('guestGuard', () => {
    it('debería permitir acceso cuando el usuario no está autenticado', async () => {
      // Arrange
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(null)

      // Act
      await guestGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debería redirigir al dashboard cuando el usuario está autenticado', async () => {
      // Arrange
      const mockUser = new User('123', 'test@example.com', true, new Date(), new Date())
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)

      // Act
      await guestGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith('/dashboard')
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debería permitir acceso cuando hay un error al verificar autenticación', async () => {
      // Arrange
      vi.mocked(mockAuthService.getCurrentUser).mockRejectedValue(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      await guestGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking authentication:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('onboardingGuard', () => {
    it('debería permitir acceso cuando el usuario está autenticado pero no ha confirmado email', async () => {
      // Arrange
      const mockUser = new User('123', 'test@example.com', false, new Date(), new Date()) // emailConfirmed: false
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)

      // Act
      await onboardingGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debería redirigir al dashboard cuando el usuario está autenticado y ha confirmado email', async () => {
      // Arrange
      const mockUser = new User('123', 'test@example.com', true, new Date(), new Date()) // emailConfirmed: true
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)

      // Act
      await onboardingGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith('/dashboard')
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debería redirigir a login cuando el usuario no está autenticado', async () => {
      // Arrange
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(null)

      // Act
      await onboardingGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith('/login')
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('debería redirigir a login cuando hay un error al verificar autenticación', async () => {
      // Arrange
      vi.mocked(mockAuthService.getCurrentUser).mockRejectedValue(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      await onboardingGuard(mockTo, mockFrom, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith('/login')
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking authentication:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})
