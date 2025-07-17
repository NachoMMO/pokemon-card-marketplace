import type { ISupabaseAuthService } from '../../ports/services/ISupabaseAuthService';
import type { IUserProfileRepository } from '../../ports/repositories/IUserProfileRepository';
import type { RegisterDTO, AuthResponseDTO } from '../../dtos/AuthDTO';
import { UserProfile } from '../../../domain/entities/UserProfile';

export interface ICreateUserProfileUseCase {
  execute(registerData: RegisterDTO): Promise<AuthResponseDTO>;
}

export class CreateUserProfileUseCase implements ICreateUserProfileUseCase {
  constructor(
    private readonly authService: ISupabaseAuthService,
    private readonly userProfileRepository: IUserProfileRepository
  ) {}

  async execute(registerData: RegisterDTO): Promise<AuthResponseDTO> {
    try {
      // Validar que las contraseñas coincidan
      if (registerData.password !== registerData.confirmPassword) {
        return {
          user: null,
          profile: null,
          error: 'Las contraseñas no coinciden'
        };
      }

      // Verificar que el displayName no exista
      const existingProfile = await this.userProfileRepository.findByDisplayName(registerData.displayName);
      if (existingProfile) {
        return {
          user: null,
          profile: null,
          error: 'El nombre de usuario ya está en uso'
        };
      }

      // Crear usuario en Supabase Auth
      const authResponse = await this.authService.signUp({
        email: registerData.email,
        password: registerData.password
      });

      if (authResponse.error || !authResponse.user) {
        return {
          user: null,
          profile: null,
          error: authResponse.error || 'Error al crear la cuenta'
        };
      }

      // Si el email no está confirmado, retornar con indicador
      if (!authResponse.user.emailConfirmed) {
        return {
          user: {
            id: authResponse.user.id,
            email: authResponse.user.email,
            emailConfirmed: false
          },
          profile: null,
          error: null,
          requiresEmailConfirmation: true
        };
      }

      // Crear perfil de usuario
      const userProfile = UserProfile.create({
        userId: authResponse.user.id,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        displayName: registerData.displayName,
        balance: 0
      });

      const createdProfile = await this.userProfileRepository.create(userProfile);

      return {
        user: {
          id: authResponse.user.id,
          email: authResponse.user.email,
          emailConfirmed: authResponse.user.emailConfirmed
        },
        profile: {
          id: createdProfile.id,
          firstName: createdProfile.firstName,
          lastName: createdProfile.lastName,
          displayName: createdProfile.displayName,
          bio: createdProfile.bio,
          avatarUrl: createdProfile.avatarUrl,
          location: createdProfile.location,
          balance: createdProfile.balance
        },
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
