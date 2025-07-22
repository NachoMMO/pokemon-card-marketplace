import { ref, type Ref } from 'vue'
import type { IResetPasswordUseCase } from '../../application/ports/use-cases/IPasswordRecoveryUseCases'
import { container } from '../../infrastructure/di/container'

/**
 * Presentation layer composable for password reset functionality
 * Manages UI state and business logic interaction for completing password reset
 */
export function useResetPassword() {
  const isLoading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const isPasswordReset: Ref<boolean> = ref(false)

  // Get use case from dependency injection container
  const resetPasswordUseCase = container.get<IResetPasswordUseCase>('ResetPasswordUseCase')

  /**
   * Resets the password using the new password
   * @param newPassword - The new password
   * @param confirmPassword - The confirmation of the new password
   */
  const resetPassword = async (newPassword: string, confirmPassword: string): Promise<void> => {
    // Reset state
    isLoading.value = true
    error.value = null
    isPasswordReset.value = false

    try {
      // Simple validation
      if (newPassword !== confirmPassword) {
        error.value = 'Las contraseñas no coinciden'
        return
      }

      if (newPassword.length < 8) {
        error.value = 'La contraseña debe tener al menos 8 caracteres'
        return
      }

      const result = await resetPasswordUseCase.execute(newPassword)

      if (result.isSuccess) {
        isPasswordReset.value = true
      } else {
        error.value = result.error || 'Failed to reset password'
      }
    } catch (err) {
      console.error('useResetPassword: Exception occurred:', err);
      error.value = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
    } finally {
      isLoading.value = false
    }
  }  /**
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
    isPasswordReset.value = false
  }

  return {
    // State
    isLoading,
    error,
    isPasswordReset,

    // Actions
    resetPassword,
    clearError,
    resetState
  }
}
