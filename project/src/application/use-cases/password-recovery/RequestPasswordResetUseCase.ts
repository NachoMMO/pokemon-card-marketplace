import type { ISupabaseAuthService } from '../../ports/services/ISupabaseAuthService';
import { PasswordRecoveryResult } from '../../dtos/PasswordRecoveryDTO';

export class RequestPasswordResetUseCase {
  constructor(private authService: ISupabaseAuthService) {}

  async execute(email: string): Promise<PasswordRecoveryResult> {
    try {
      const success = await this.authService.resetPassword(email);

      return success
        ? PasswordRecoveryResult.success('Email de recuperación enviado correctamente')
        : PasswordRecoveryResult.failure('No se pudo enviar el email de recuperación. Verifica que el email sea correcto.');
    } catch (error) {
      return PasswordRecoveryResult.failure(
        error instanceof Error ? error.message : 'Error inesperado al procesar la solicitud'
      );
    }
  }
}
