import type { IRequestPasswordResetUseCase } from '../../application/ports/use-cases/IPasswordRecoveryUseCases'
import type { ISupabaseAuthService } from '../../application/ports/services'
import { PasswordRecoveryResult } from '../../application/dtos/PasswordRecoveryDTO'

/**
 * Use case for requesting password reset
 * Implements business logic for password recovery initiation
 */
export class RequestPasswordResetUseCase implements IRequestPasswordResetUseCase {
  constructor(
    private readonly authService: ISupabaseAuthService
  ) {}

  async execute(email: string): Promise<PasswordRecoveryResult> {
    try {
      // Basic email validation
      if (!email?.trim()) {
        return PasswordRecoveryResult.failure('Email is required')
      }

      if (!this.isValidEmail(email)) {
        return PasswordRecoveryResult.failure('Invalid email format')
      }

      // Always return success message for security reasons
      // (don't reveal if email exists or not)
      await this.authService.resetPassword(email)

      return PasswordRecoveryResult.success('Password reset link sent to your email')
    } catch {
      return PasswordRecoveryResult.failure('Failed to send password reset email. Please try again.')
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
