import type { ISupabaseAuthService } from '../../application/ports/services'
import type { IValidateResetTokenUseCase } from '../../application/ports/use-cases/IPasswordRecoveryUseCases'
import type { TokenValidationResult } from '../../application/dtos'

export class ValidateResetTokenUseCase implements IValidateResetTokenUseCase {
  constructor(private readonly authService: ISupabaseAuthService) {}

  async execute(token: string): Promise<TokenValidationResult> {
    try {
      const result = await this.authService.validateResetToken(token)
      return result
    } catch {
      return {
        isValid: false
      }
    }
  }
}
