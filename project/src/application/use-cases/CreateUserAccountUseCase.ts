import { User } from '../../domain/entities/User'
import { UserProfile } from '../../domain/entities/UserProfile'
import { CompleteUser } from '../../domain/entities/CompleteUser'
import { CreateUserAccount } from '../../domain/use-cases/CreateUserAccount'
import type { ISupabaseAuthService } from '../ports/services/ISupabaseAuthService'
import type { IUserRepository } from '../ports/repositories/IUserRepository'
import type { IUserProfileRepository } from '../ports/repositories/IUserProfileRepository'
import { CreateUserAccountRequest } from '../dtos/CreateUserAccountRequest'

export interface CreateUserAccountResponse {
  isSuccess: boolean
  data?: User
  error?: string
}

export class CreateUserAccountUseCase {
  private domainUseCase: CreateUserAccount

  constructor(
    private authService: ISupabaseAuthService,
    private userRepository: IUserRepository,
    private userProfileRepository: IUserProfileRepository
  ) {
    this.domainUseCase = new CreateUserAccount()
  }

  async execute(request: CreateUserAccountRequest): Promise<CreateUserAccountResponse> {
    try {
      // Validate DTO first
      const validationErrors = request.validate()
      if (validationErrors.length > 0) {
        return {
          isSuccess: false,
          error: validationErrors.join(', ')
        }
      }

      // Execute domain logic first (creates the domain objects)
      const domainResult = await this.domainUseCase.execute({
        name: request.name,
        email: request.email,
        password: request.password,
        confirmPassword: request.confirmPassword
      })

      if (!domainResult.isSuccess) {
        return {
          isSuccess: false,
          error: domainResult.error
        }
      }

      // Use Supabase Auth to create the actual user account
      const authResult = await this.authService.signUp({
        email: request.email,
        password: request.password
      })

      if (authResult.error || !authResult.user) {
        return {
          isSuccess: false,
          error: authResult.error || 'Failed to create user account'
        }
      }

      // For now, we don't create the user profile during registration
      // The user needs to confirm their email first
      // Profile creation will happen during onboarding after first login

      // Return success with the authenticated user data
      return {
        isSuccess: true,
        data: authResult.user
      }

    } catch (error) {
      return {
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
