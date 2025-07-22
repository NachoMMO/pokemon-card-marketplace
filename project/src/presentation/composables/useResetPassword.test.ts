import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useResetPassword } from './useResetPassword'
import type { IResetPasswordUseCase } from '../../application/ports/use-cases/IPasswordRecoveryUseCases'
import { PasswordRecoveryResult } from '../../application/dtos/PasswordRecoveryDTO'

// Mock del use case
const mockResetPasswordUseCase: IResetPasswordUseCase = {
  execute: vi.fn()
}

// Mock del router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock de la dependencia
vi.mock('../../infrastructure/di/container', () => ({
  container: {
    get: vi.fn((token: string) => {
      if (token === 'ResetPasswordUseCase') {
        return mockResetPasswordUseCase
      }
    })
  }
}))

describe('useResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { isLoading, error, isPasswordReset, resetPassword } = useResetPassword()

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(isPasswordReset.value).toBe(false)
    expect(typeof resetPassword).toBe('function')
  })

  it('should set loading state during password reset', async () => {
    const mockResponse = PasswordRecoveryResult.success('Password reset successfully')

    ;(mockResetPasswordUseCase.execute as ReturnType<typeof vi.fn>).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )

    const { isLoading, resetPassword } = useResetPassword()

    const resetPromise = resetPassword('newPassword123', 'newPassword123')

    expect(isLoading.value).toBe(true)

    await resetPromise

    expect(isLoading.value).toBe(false)
  })

  it('should handle successful password reset', async () => {
    const mockResponse = PasswordRecoveryResult.success('Password reset successfully')

    ;(mockResetPasswordUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const { isPasswordReset, error, resetPassword } = useResetPassword()

    await resetPassword('newPassword123', 'newPassword123')

    expect(isPasswordReset.value).toBe(true)
    expect(error.value).toBe(null)
  })

  it('should handle password reset errors', async () => {
    const mockResponse = PasswordRecoveryResult.failure('Invalid or expired token')

    ;(mockResetPasswordUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const { isPasswordReset, error, resetPassword } = useResetPassword()

    await resetPassword('newPassword123', 'newPassword123')

    expect(isPasswordReset.value).toBe(false)
    expect(error.value).toBe('Invalid or expired token')
  })

  it('should handle use case exceptions', async () => {
    ;(mockResetPasswordUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const { isPasswordReset, error, resetPassword } = useResetPassword()

    await resetPassword('newPassword123', 'newPassword123')

    expect(isPasswordReset.value).toBe(false)
    expect(error.value).toBe('Ha ocurrido un error inesperado. Inténtalo de nuevo.')
  })

  it('should clear error when clearing errors', () => {
    const { error, clearError } = useResetPassword()

    error.value = 'Some error'
    clearError()

    expect(error.value).toBe(null)
  })

  it('should reset loading state on error', async () => {
    ;(mockResetPasswordUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const { isLoading, resetPassword } = useResetPassword()

    await resetPassword('newPassword123', 'newPassword123')

    expect(isLoading.value).toBe(false)
  })

  it('should call use case with correct parameters', async () => {
    const mockResponse = PasswordRecoveryResult.success('Password reset successfully')

    ;(mockResetPasswordUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const { resetPassword } = useResetPassword()

    await resetPassword('newPassword123', 'newPassword123')

    expect(mockResetPasswordUseCase.execute).toHaveBeenCalledWith('newPassword123')
  })

  it('should reset all state when calling resetState', () => {
    const { isLoading, error, isPasswordReset, resetState } = useResetPassword()

    // Set some initial state
    isLoading.value = true
    error.value = 'Some error'
    isPasswordReset.value = true

    resetState()

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(isPasswordReset.value).toBe(false)
  })
})
