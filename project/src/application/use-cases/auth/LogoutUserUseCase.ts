import type { ISupabaseAuthService } from '../../ports/services/ISupabaseAuthService';

export interface LogoutResponseDTO {
  success: boolean;
  error: string | null;
}

export interface ILogoutUserUseCase {
  execute(): Promise<LogoutResponseDTO>;
}

export class LogoutUserUseCase implements ILogoutUserUseCase {
  constructor(private readonly authService: ISupabaseAuthService) {}

  async execute(): Promise<LogoutResponseDTO> {
    try {
      const success = await this.authService.signOut();

      if (!success) {
        return {
          success: false,
          error: 'Error al cerrar sesión'
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al cerrar sesión'
      };
    }
  }
}
