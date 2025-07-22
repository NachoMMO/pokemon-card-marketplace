import { ref, type Ref } from 'vue'
import type { IRequestPasswordResetUseCase } from '../../application/ports/use-cases/IPasswordRecoveryUseCases'
import { container } from '../../infrastructure/di/container'

/**
 * Presentation layer composable for password recovery functionality
 * Manages UI state and business logic interaction for password reset requests
 */
export function usePasswordRecovery() {
  const isLoading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const isEmailSent: Ref<boolean> = ref(false)

  // Get use case from dependency injection container
  const requestPasswordResetUseCase = container.get<IRequestPasswordResetUseCase>('RequestPasswordResetUseCase')

  /**
   * Requests a password reset for the given email address
   * @param email - The email address to send the reset link to
   */
  const requestPasswordReset = async (email: string): Promise<void> => {
    // Reset state
    isLoading.value = true
    error.value = null
    isEmailSent.value = false

    try {
      const result = await requestPasswordResetUseCase.execute(email)

      if (result.isSuccess) {
        isEmailSent.value = true
      } else {
        error.value = result.error || 'Failed to send password reset email'
      }
    } catch {
      error.value = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clears any existing error state
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Resets the composable state to initial values
   */
  const resetState = (): void => {
    isLoading.value = false
    error.value = null
    isEmailSent.value = false
  }

  return {
    // State
    isLoading,
    error,
    isEmailSent,

    // Actions
    requestPasswordReset,
    clearError,
    resetState
  }
}
