import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ResetPasswordUseCase } from './ResetPasswordUseCase'

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase
  let mockAuthService: {
    resetPassword: ReturnType<typeof vi.fn>
    signUp: ReturnType<typeof vi.fn>
    signIn: ReturnType<typeof vi.fn>
    signOut: ReturnType<typeof vi.fn>
    getCurrentUser: ReturnType<typeof vi.fn>
    updatePassword: ReturnType<typeof vi.fn>
    validateResetToken: ReturnType<typeof vi.fn>
    onAuthStateChange: ReturnType<typeof vi.fn>
    getAccessToken: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockAuthService = {
      resetPassword: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn(),
      updatePassword: vi.fn(),
      validateResetToken: vi.fn(),
      onAuthStateChange: vi.fn(),
      getAccessToken: vi.fn()
    }

    useCase = new ResetPasswordUseCase(mockAuthService)
  })

  describe('execute', () => {
    it('should successfully reset password', async () => {
      // Arrange
      mockAuthService.updatePassword.mockResolvedValue(true)

      // Act
      const result = await useCase.execute('newPassword123')

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.message).toBe('Password successfully reset')
      expect(mockAuthService.updatePassword).toHaveBeenCalledWith('newPassword123')
    })

    it('should handle auth service failure', async () => {
      // Arrange
      mockAuthService.updatePassword.mockResolvedValue(false)

      // Act
      const result = await useCase.execute('newPassword123')

      // Assert
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Failed to reset password. Please try again.')
    })

    it('should handle missing password', async () => {
      // Act
      const result = await useCase.execute('')

      // Assert
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Password is required')
    })

    it('should handle short password', async () => {
      // Act
      const result = await useCase.execute('123')

      // Assert
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Password must be at least 8 characters long')
    })

    it('should handle auth service exception', async () => {
      // Arrange
      mockAuthService.updatePassword.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await useCase.execute('newPassword123')

      // Assert
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Failed to reset password. Please try again.')
    })
  })
})
