import type { ISupabaseAuthService } from '../../ports/services/ISupabaseAuthService';
import type { IUserProfileRepository } from '../../ports/repositories/IUserProfileRepository';
import type { AuthResponseDTO } from '../../dtos/AuthDTO';

export interface IGetCurrentUserUseCase {
  execute(): Promise<AuthResponseDTO>;
}

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(
    private readonly authService: ISupabaseAuthService,
    private readonly userProfileRepository: IUserProfileRepository
  ) {}

  async execute(): Promise<AuthResponseDTO> {
    try {
      // Obtener el usuario autenticado
      const user = await this.authService.getCurrentUser();

      if (!user) {
        return {
          user: null,
          profile: null,
          error: null
        };
      }

      // Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findByUserId(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          emailConfirmed: user.emailConfirmed
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
        error: error instanceof Error ? error.message : 'Error al obtener usuario actual'
      };
    }
  }
}
