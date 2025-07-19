// UserProfile entity representing extended user information
// This entity contains all additional user data stored in user_profiles table
export class UserProfile {
  constructor(
    public readonly id: string, // UUID primary key
    public readonly userId: string, // References auth.users.id
    public firstName: string,
    public lastName: string,
    public displayName: string, // Unique display name (acts as username)
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

  // Factory method for creating a new UserProfile
  static create(data: {
    userId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    balance?: number;
    bio?: string;
    avatarUrl?: string;
    location?: string;
  }): UserProfile;

  // Overloaded version for user account creation with full name
  static create(data: {
    name: string;
    balance?: number;
    bio?: string;
    avatarUrl?: string;
    location?: string;
  }): UserProfile;

  static create(data: any): UserProfile {
    const now = new Date();

    // Handle full name input (user registration scenario)
    if (data.name && !data.firstName && !data.lastName) {
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const displayName = data.name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);

      return new UserProfile(
        crypto.randomUUID(), // Generate new ID
        '', // userId will be set when persisting
        firstName,
        lastName,
        displayName,
        data.balance || 0,
        UserRole.BUYER, // Default role
        0, // Default trading reputation
        0, // Default total trades
        0, // Default successful trades
        now, // Created at
        now, // Updated at
        undefined, // Date of birth
        undefined, // Address
        undefined, // City
        undefined, // Postal code
        undefined, // Country
        data.bio,
        data.avatarUrl,
        data.location,
        undefined, // Website
        {}, // Social media links
        new PrivacySettings(),
        new NotificationPreferences()
      );
    }

    // Handle existing format (firstName + lastName)
    return new UserProfile(
      crypto.randomUUID(), // Generate new ID
      data.userId,
      data.firstName,
      data.lastName,
      data.displayName,
      data.balance || 0,
      UserRole.BUYER, // Default role
      0, // Default trading reputation
      0, // Default total trades
      0, // Default successful trades
      now, // Created at
      now, // Updated at
      undefined, // Date of birth
      undefined, // Address
      undefined, // City
      undefined, // Postal code
      undefined, // Country
      data.bio,
      data.avatarUrl,
      data.location,
      undefined, // Website
      {}, // Social media links
      new PrivacySettings(),
      new NotificationPreferences()
    );
  }

  // Update method for modifying user profile
  update(updates: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    location: string;
    website: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    socialMediaLinks: Record<string, string>;
    privacySettings: PrivacySettings;
    notificationPreferences: NotificationPreferences;
  }>): UserProfile {
    const updatedProfile = new UserProfile(
      this.id,
      this.userId,
      updates.firstName ?? this.firstName,
      updates.lastName ?? this.lastName,
      updates.displayName ?? this.displayName,
      this.balance,
      this.role,
      this.tradingReputation,
      this.totalTrades,
      this.successfulTrades,
      this.createdAt,
      new Date(), // Update timestamp
      this.dateOfBirth,
      updates.address ?? this.address,
      updates.city ?? this.city,
      updates.postalCode ?? this.postalCode,
      updates.country ?? this.country,
      updates.bio ?? this.bio,
      updates.avatarUrl ?? this.avatarUrl,
      updates.location ?? this.location,
      updates.website ?? this.website,
      updates.socialMediaLinks ?? this.socialMediaLinks,
      updates.privacySettings ?? this.privacySettings,
      updates.notificationPreferences ?? this.notificationPreferences
    );

    return updatedProfile;
  }

  // Getter for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Method to check if profile is complete
  isProfileComplete(): boolean {
    return !!(this.firstName && this.lastName && this.displayName);
  }

  // Method to calculate trading success rate
  get tradingSuccessRate(): number {
    if (this.totalTrades === 0) return 0;
    return (this.successfulTrades / this.totalTrades) * 100;
  }
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
