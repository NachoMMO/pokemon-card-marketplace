import type { IResetPasswordUseCase } from '../../application/ports/use-cases/IPasswordRecoveryUseCases'
import type { ISupabaseAuthService } from '../../application/ports/services'
import { PasswordRecoveryResult } from '../../application/dtos/PasswordRecoveryDTO'

/**
 * Use case for resetting password with token
 * Implements business logic for password reset completion
 */
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly authService: ISupabaseAuthService
  ) {}

  async execute(newPassword: string): Promise<PasswordRecoveryResult> {
    try {
      // Basic password validation
      if (!newPassword?.trim()) {
        return PasswordRecoveryResult.failure('Password is required')
      }

      if (newPassword.length < 8) {
        return PasswordRecoveryResult.failure('Password must be at least 8 characters long')
      }

      // Attempt to update password
      const success = await this.authService.updatePassword(newPassword)

      if (!success) {
        return PasswordRecoveryResult.failure('Failed to reset password. Please try again.')
      }

      return PasswordRecoveryResult.success('Password successfully reset')
    } catch (error) {
      console.error('ResetPasswordUseCase: Exception occurred:', error);
      return PasswordRecoveryResult.failure('Failed to reset password. Please try again.')
    }
  }
}
