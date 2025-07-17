import type { IDataService } from '@/application/ports/services/IDataService';
import type { UserProfile } from '@/domain/entities/UserProfile';
import { UserRole } from '@/domain/entities/UserProfile';

export interface ICreateUserProfileUseCase {
  execute(userId: string, profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile>;
}

export class CreateUserProfileUseCase implements ICreateUserProfileUseCase {
  constructor(private dataService: IDataService) {}

  async execute(
    userId: string,
    profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserProfile> {
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.displayName) {
      throw new Error('First name, last name, and display name are required');
    }

    // Check if user already has a profile
    const existingProfile = await this.dataService.getMany<UserProfile>('user_profiles', {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      limit: 1
    });

    if (existingProfile.data.length > 0) {
      throw new Error('User profile already exists');
    }

    // Check if display name is already taken
    const existingDisplayName = await this.dataService.getMany<UserProfile>('user_profiles', {
      filters: [{ column: 'display_name', operator: 'eq', value: profileData.displayName }],
      limit: 1
    });

    if (existingDisplayName.data.length > 0) {
      throw new Error('Display name already exists');
    }

    // Create user profile with default values
    const newProfileResult = await this.dataService.create<UserProfile>('user_profiles', {
      userId: userId,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      displayName: profileData.displayName,
      balance: profileData.balance || 0,
      role: profileData.role || UserRole.BUYER,
      tradingReputation: 0,
      totalTrades: 0,
      successfulTrades: 0,
      dateOfBirth: profileData.dateOfBirth,
      address: profileData.address,
      city: profileData.city,
      postalCode: profileData.postalCode,
      country: profileData.country,
      bio: profileData.bio,
      avatarUrl: profileData.avatarUrl,
      location: profileData.location,
      website: profileData.website
    });

    if (!newProfileResult.success || !newProfileResult.data) {
      throw new Error(newProfileResult.error || 'Failed to create user profile');
    }

    return newProfileResult.data;
  }
}
