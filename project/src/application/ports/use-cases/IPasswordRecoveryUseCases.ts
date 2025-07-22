import type { PasswordRecoveryResult, TokenValidationResult } from '../../dtos/PasswordRecoveryDTO'

/**
 * Use case interface for requesting password reset
 */
export interface IRequestPasswordResetUseCase {
  execute(email: string): Promise<PasswordRecoveryResult>
}

/**
 * Use case interface for resetting password with token
 */
export interface IResetPasswordUseCase {
  execute(newPassword: string): Promise<PasswordRecoveryResult>
}

/**
 * Use case interface for validating reset token
 */
export interface IValidateResetTokenUseCase {
  execute(token: string): Promise<TokenValidationResult>
}
