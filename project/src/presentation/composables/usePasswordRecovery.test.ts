import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePasswordRecovery } from './usePasswordRecovery'
import type { IRequestPasswordResetUseCase } from '../../application/ports/use-cases/IPasswordRecoveryUseCases'
import { PasswordRecoveryResult } from '../../application/dtos/PasswordRecoveryDTO'

// Mock del use case
const mockRequestPasswordResetUseCase: IRequestPasswordResetUseCase = {
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
      if (token === 'RequestPasswordResetUseCase') {
        return mockRequestPasswordResetUseCase
      }
    })
  }
}))

describe('usePasswordRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { isLoading, error, isEmailSent, requestPasswordReset } = usePasswordRecovery()

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(isEmailSent.value).toBe(false)
    expect(typeof requestPasswordReset).toBe('function')
  })

  it('should set loading state during password reset request', async () => {
    const mockResponse: PasswordRecoveryResult = {
      isSuccess: true,
      message: 'Email sent successfully'
    }

    ;(mockRequestPasswordResetUseCase.execute as any).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    )

    const { isLoading, requestPasswordReset } = usePasswordRecovery()

    const requestPromise = requestPasswordReset('test@example.com')

    expect(isLoading.value).toBe(true)

    await requestPromise

    expect(isLoading.value).toBe(false)
  })

  it('should handle successful password reset request', async () => {
    const mockResponse: PasswordRecoveryResult = {
      isSuccess: true,
      message: 'Email sent successfully'
    }

    ;(mockRequestPasswordResetUseCase.execute as any).mockResolvedValue(mockResponse)

    const { isEmailSent, error, requestPasswordReset } = usePasswordRecovery()

    await requestPasswordReset('test@example.com')

    expect(isEmailSent.value).toBe(true)
    expect(error.value).toBe(null)
  })

  it('should handle password reset request errors', async () => {
    const mockResponse = PasswordRecoveryResult.failure('Email not found')

    ;(mockRequestPasswordResetUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const { isEmailSent, error, requestPasswordReset } = usePasswordRecovery()

    await requestPasswordReset('invalid@example.com')

    expect(isEmailSent.value).toBe(false)
    expect(error.value).toBe('Email not found')
  })

  it('should handle use case exceptions', async () => {
    ;(mockRequestPasswordResetUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const { isEmailSent, error, requestPasswordReset } = usePasswordRecovery()

    await requestPasswordReset('test@example.com')

    expect(isEmailSent.value).toBe(false)
    expect(error.value).toBe('Ha ocurrido un error inesperado. Inténtalo de nuevo.')
  })

  it('should clear error when clearing errors', () => {
    const { error, clearError } = usePasswordRecovery()

    error.value = 'Some error'
    clearError()

    expect(error.value).toBe(null)
  })

  it('should reset loading state on error', async () => {
    ;(mockRequestPasswordResetUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const { isLoading, requestPasswordReset } = usePasswordRecovery()

    await requestPasswordReset('test@example.com')

    expect(isLoading.value).toBe(false)
  })

  it('should call use case with correct email', async () => {
    const mockResponse = PasswordRecoveryResult.success('Email sent successfully')

    ;(mockRequestPasswordResetUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const { requestPasswordReset } = usePasswordRecovery()

    await requestPasswordReset('user@example.com')

    expect(mockRequestPasswordResetUseCase.execute).toHaveBeenCalledWith('user@example.com')
  })
})
