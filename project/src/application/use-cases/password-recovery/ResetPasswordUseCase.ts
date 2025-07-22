import type { ISupabaseAuthService } from '../../ports/services/ISupabaseAuthService';

export class ResetPasswordUseCase {
  constructor(private authService: ISupabaseAuthService) {}

  async execute(newPassword: string): Promise<boolean> {
    return await this.authService.updatePassword(newPassword);
  }
}
