import type { ISupabaseAuthService } from '../../ports/services/ISupabaseAuthService';

export class ValidateResetTokenUseCase {
  constructor(private authService: ISupabaseAuthService) {}

  async execute(token: string): Promise<{ isValid: boolean; email?: string }> {
    return await this.authService.validateResetToken(token);
  }
}
