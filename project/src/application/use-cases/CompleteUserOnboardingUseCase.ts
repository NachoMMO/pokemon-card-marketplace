import { User } from '../../domain/entities/User'
import { UserProfile } from '../../domain/entities/UserProfile'
import { CompleteUser } from '../../domain/entities/CompleteUser'
import type { ISupabaseAuthService } from '../ports/services/ISupabaseAuthService'
import type { IUserProfileRepository } from '../ports/repositories/IUserProfileRepository'

export interface CompleteUserOnboardingRequest {
  firstName: string
  lastName: string
  displayName: string
  bio?: string
  location?: string
  dateOfBirth?: string
}

export interface CompleteUserOnboardingResponse {
  isSuccess: boolean
  data?: CompleteUser
  error?: string
}

export class CompleteUserOnboardingUseCase {
  constructor(
    private authService: ISupabaseAuthService,
    private userProfileRepository: IUserProfileRepository
  ) {}

  async execute(request: CompleteUserOnboardingRequest): Promise<CompleteUserOnboardingResponse> {
    try {
      // Get current authenticated user
      const currentUser = await this.authService.getCurrentUser()

      if (!currentUser) {
        return {
          isSuccess: false,
          error: 'User must be authenticated to complete onboarding'
        }
      }

      // Validate required fields
      if (!request.firstName?.trim() || !request.lastName?.trim() || !request.displayName?.trim()) {
        return {
          isSuccess: false,
          error: 'First name, last name, and display name are required'
        }
      }

      // Check if user already has a profile
      const existingProfile = await this.userProfileRepository.findByUserId(currentUser.id)
      if (existingProfile) {
        return {
          isSuccess: false,
          error: 'User already has a profile'
        }
      }

      // Create user profile
      const profileData = UserProfile.create({
        userId: currentUser.id,
        firstName: request.firstName.trim(),
        lastName: request.lastName.trim(),
        displayName: request.displayName.trim(),
        bio: request.bio?.trim(),
        location: request.location?.trim(),
        balance: 0
      })

      // Parse date of birth if provided
      if (request.dateOfBirth) {
        try {
          const birthDate = new Date(request.dateOfBirth)
          if (!isNaN(birthDate.getTime())) {
            profileData.dateOfBirth = birthDate
          }
        } catch (error) {
          // Invalid date format, ignore
        }
      }

      const createdProfile = await this.userProfileRepository.create(profileData)

      // Return the complete user
      const completeUser = CompleteUser.create(currentUser, createdProfile)

      return {
        isSuccess: true,
        data: completeUser
      }

    } catch (error) {
      return {
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during onboarding'
      }
    }
  }
}
