import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MockedFunction } from 'vitest'
import { ValidateResetTokenUseCase } from './ValidateResetTokenUseCase'
import type { ISupabaseAuthService } from '../../application/ports/services'

describe('ValidateResetTokenUseCase', () => {
  let useCase: ValidateResetTokenUseCase
  let mockAuthService: ISupabaseAuthService

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      validateResetToken: vi.fn(),
      onAuthStateChange: vi.fn(),
      getAccessToken: vi.fn()
    }

    useCase = new ValidateResetTokenUseCase(mockAuthService)
  })

  describe('execute', () => {
    it('should return valid token with email for valid token', async () => {
      // Arrange
      const token = 'valid-token-123'
      const expectedEmail = 'user@example.com'
      ;(mockAuthService.validateResetToken as MockedFunction<any>).mockResolvedValue({
        isValid: true,
        email: expectedEmail
      })

      // Act
      const result = await useCase.execute(token)

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.email).toBe(expectedEmail)
      expect(mockAuthService.validateResetToken).toHaveBeenCalledWith(token)
    })

    it('should return invalid for expired token', async () => {
      // Arrange
      const token = 'expired-token-123'
      ;(mockAuthService.validateResetToken as MockedFunction<any>).mockResolvedValue({
        isValid: false
      })

      // Act
      const result = await useCase.execute(token)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.email).toBeUndefined()
      expect(mockAuthService.validateResetToken).toHaveBeenCalledWith(token)
    })

    it('should return invalid for malformed token', async () => {
      // Arrange
      const token = 'invalid-token'
      ;(mockAuthService.validateResetToken as MockedFunction<any>).mockResolvedValue({
        isValid: false
      })

      // Act
      const result = await useCase.execute(token)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.email).toBeUndefined()
    })

    it('should return invalid for empty token', async () => {
      // Arrange
      const token = ''
      ;(mockAuthService.validateResetToken as MockedFunction<any>).mockResolvedValue({
        isValid: false
      })

      // Act
      const result = await useCase.execute(token)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.email).toBeUndefined()
    })

    it('should handle auth service errors gracefully', async () => {
      // Arrange
      const token = 'some-token'
      ;(mockAuthService.validateResetToken as MockedFunction<any>).mockRejectedValue(new Error('Network error'))

      // Act
      const result = await useCase.execute(token)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.email).toBeUndefined()
    })
  })
})
