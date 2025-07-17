// UserProfile entity representing extended user information
// This entity contains all additional user data stored in user_profiles table
export class UserProfile {
  constructor(
    public readonly id: string, // UUID primary key
    public readonly userId: string, // References auth.users.id
    public firstName: string,
    public lastName: string,
    public displayName: string,
    public balance: number = 0,
    public role: UserRole = UserRole.BUYER,
    public tradingReputation: number = 0,
    public totalTrades: number = 0,
    public successfulTrades: number = 0,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public dateOfBirth?: Date,
    public address?: string,
    public city?: string,
    public postalCode?: string,
    public country?: string,
    public bio?: string,
    public avatarUrl?: string,
    public location?: string,
    public website?: string,
    public socialMediaLinks: Record<string, string> = {},
    public privacySettings: PrivacySettings = new PrivacySettings(),
    public notificationPreferences: NotificationPreferences = new NotificationPreferences()
  ) {}

}

// Enums and value objects
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin'
}

export class PrivacySettings {
  constructor(
    public profilePublic: boolean = true,
    public collectionPublic: boolean = false,
    public tradeHistoryPublic: boolean = false
  ) {}
}

export class NotificationPreferences {
  constructor(
    public emailNotifications: boolean = true,
    public pushNotifications: boolean = true,
    public tradeUpdates: boolean = true
  ) {}
}
