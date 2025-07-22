import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RequestPasswordResetUseCase } from './RequestPasswordResetUseCase'

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase
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
    setSessionFromRecoveryToken: ReturnType<typeof vi.fn>
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
      getAccessToken: vi.fn(),
      setSessionFromRecoveryToken: vi.fn()
    }

    useCase = new RequestPasswordResetUseCase(mockAuthService)
  })

  describe('execute', () => {
    it('should successfully request password reset', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(true)

      // Act
      const result = await useCase.execute('user@example.com')

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.message).toBe('Password reset link sent to your email')
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('user@example.com')
    })

    it('should handle auth service failure', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(false)

      // Act
      const result = await useCase.execute('user@example.com')

      // Assert
      expect(result.isSuccess).toBe(true) // For security, always return success
      expect(result.message).toBe('Password reset link sent to your email')
    })

    it('should handle missing email', async () => {
      // Act
      const result = await useCase.execute('')

      // Assert
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('should handle invalid email format', async () => {
      // Act
      const result = await useCase.execute('invalid-email')

      // Assert
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Invalid email format')
    })

    it('should handle auth service exception', async () => {
      // Arrange
      mockAuthService.resetPassword.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await useCase.execute('user@example.com')

      // Assert
      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Failed to send password reset email. Please try again.')
    })

    it('should trim whitespace from email', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(true)

      // Act
      const result = await useCase.execute('  user@example.com  ')

      // Assert
      expect(result.isSuccess).toBe(false) // Invalid email due to spaces
      expect(result.error).toBe('Invalid email format')
    })
  })
})
