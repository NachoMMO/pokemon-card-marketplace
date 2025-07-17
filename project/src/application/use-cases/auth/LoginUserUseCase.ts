import type { ISupabaseAuthService } from '../../ports/services/ISupabaseAuthService';
import type { IUserProfileRepository } from '../../ports/repositories/IUserProfileRepository';
import type { LoginDTO, AuthResponseDTO } from '../../dtos/AuthDTO';

export interface ILoginUserUseCase {
  execute(loginData: LoginDTO): Promise<AuthResponseDTO>;
}

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly authService: ISupabaseAuthService,
    private readonly userProfileRepository: IUserProfileRepository
  ) {}

  async execute(loginData: LoginDTO): Promise<AuthResponseDTO> {
    try {
      // Intentar iniciar sesión
      const authResponse = await this.authService.signIn({
        email: loginData.email,
        password: loginData.password
      });

      if (authResponse.error || !authResponse.user) {
        return {
          user: null,
          profile: null,
          error: authResponse.error || 'Error al iniciar sesión'
        };
      }

      // Si el email no está confirmado
      if (!authResponse.user.emailConfirmed) {
        return {
          user: {
            id: authResponse.user.id,
            email: authResponse.user.email,
            emailConfirmed: false
          },
          profile: null,
          error: 'Debes confirmar tu email antes de continuar',
          requiresEmailConfirmation: true
        };
      }

      // Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findByUserId(authResponse.user.id);

      return {
        user: {
          id: authResponse.user.id,
          email: authResponse.user.email,
          emailConfirmed: authResponse.user.emailConfirmed
        },
        profile: userProfile ? {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          displayName: userProfile.displayName,
          bio: userProfile.bio,
          avatarUrl: userProfile.avatarUrl,
          location: userProfile.location,
          balance: userProfile.balance
        } : null,
        error: null
      };

    } catch (error) {
      return {
        user: null,
        profile: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}
