import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseUserProfileRepository } from '../../../../../infrastructure/driven/repositories/SupabaseUserProfileRepository';
import { UserProfile, UserRole, PrivacySettings, NotificationPreferences } from '../../../../../domain/entities/UserProfile';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn()
};

// Mock query builder methods
const mockFrom = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  limit: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis()
};

// Helper function to create mock user profile row
function createMockUserProfileRow() {
  return {
    id: 'profile-123',
    user_id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    display_name: 'JohnDoe',
    balance: 100,
    role: 'BUYER',
    trading_reputation: 0,
    total_trades: 0,
    successful_trades: 0,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    date_of_birth: undefined,
    address: undefined,
    city: undefined,
    postal_code: undefined,
    country: undefined,
    bio: undefined,
    avatar_url: undefined,
    location: undefined,
    website: undefined,
    social_media_links: {},
    privacy_settings: {
      profile_public: true,
      collection_public: true,
      trade_history_public: true
    },
    notification_preferences: {
      email_notifications: true,
      push_notifications: true,
      trade_updates: true
    }
  };
}

describe('SupabaseUserProfileRepository', () => {
  let repository: SupabaseUserProfileRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockReturnValue(mockFrom);
    repository = new SupabaseUserProfileRepository(mockSupabaseClient as any);
  });

  describe('create', () => {
    it('should create user profile successfully', async () => {
      // Arrange
      const userProfile = new UserProfile(
        'profile-123',
        'user-1',
        'John',
        'Doe',
        'JohnDoe',
        100, // balance
        UserRole.BUYER,
        0, // tradingReputation
        0, // totalTrades
        0, // successfulTrades
        new Date('2023-01-01'), // createdAt
        new Date('2023-01-01'), // updatedAt
        undefined, // dateOfBirth
        undefined, // address
        undefined, // city
        undefined, // postalCode
        undefined, // country
        undefined, // bio
        undefined, // avatarUrl
        undefined, // location
        undefined, // website
        {}, // socialMediaLinks
        new PrivacySettings(true, true, true),
        new NotificationPreferences(true, true, true)
      );

      const mockCreatedRow = createMockUserProfileRow();
      mockFrom.single.mockResolvedValue({ data: mockCreatedRow, error: null });

      // Act
      const result = await repository.create(userProfile);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(result.id).toBe('profile-123');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const userProfile = new UserProfile(
        'profile-123',
        'user-1',
        'John',
        'Doe',
        'JohnDoe',
        100, // balance
        UserRole.BUYER,
        0, // tradingReputation
        0, // totalTrades
        0, // successfulTrades
        new Date('2023-01-01'), // createdAt
        new Date('2023-01-01'), // updatedAt
        undefined, // dateOfBirth
        undefined, // address
        undefined, // city
        undefined, // postalCode
        undefined, // country
        undefined, // bio
        undefined, // avatarUrl
        undefined, // location
        undefined, // website
        {}, // socialMediaLinks
        new PrivacySettings(true, true, true),
        new NotificationPreferences(true, true, true)
      );

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Creation failed') });

      // Act & Assert
      await expect(repository.create(userProfile)).rejects.toThrow('Error al crear perfil de usuario: Creation failed');
    });
  });

  describe('findById', () => {
    it('should find user profile by ID successfully', async () => {
      // Arrange
      const profileId = 'profile-123';
      const mockRow = createMockUserProfileRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findById(profileId);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(result?.id).toBe('profile-123');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', profileId);
    });

    it('should return null when profile not found', async () => {
      // Arrange
      const profileId = 'nonexistent';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findById(profileId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const profileId = 'profile-123';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findById(profileId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle unexpected errors and return null', async () => {
      // Arrange
      const profileId = 'profile-123';

      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.findById(profileId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find user profile by user ID successfully', async () => {
      // Arrange
      const userId = 'user-1';
      const mockRow = createMockUserProfileRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(result?.userId).toBe('user-1');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should return null when user profile not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const userId = 'user-1';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle unexpected errors and return null', async () => {
      // Arrange
      const userId = 'user-1';

      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByDisplayName', () => {
    it('should find user profile by display name successfully', async () => {
      // Arrange
      const displayName = 'JohnDoe';
      const mockRow = createMockUserProfileRow();

      mockFrom.single.mockResolvedValue({ data: mockRow, error: null });

      // Act
      const result = await repository.findByDisplayName(displayName);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(result?.displayName).toBe('JohnDoe');
      expect(mockFrom.eq).toHaveBeenCalledWith('display_name', displayName);
    });

    it('should return null when display name not found', async () => {
      // Arrange
      const displayName = 'NonexistentUser';

      mockFrom.single.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await repository.findByDisplayName(displayName);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const displayName = 'JohnDoe';

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Database error') });

      // Act
      const result = await repository.findByDisplayName(displayName);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle unexpected errors and return null', async () => {
      // Arrange
      const displayName = 'JohnDoe';

      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.findByDisplayName(displayName);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const profileId = 'profile-123';
      const updates = { firstName: 'UpdatedName' };
      const mockUpdatedRow = createMockUserProfileRow();
      mockUpdatedRow.first_name = 'UpdatedName';

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.update(profileId, updates);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(result.firstName).toBe('UpdatedName');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', profileId);
      expect(mockFrom.update).toHaveBeenCalledWith(expect.objectContaining({ first_name: 'UpdatedName' }));
    });

    it('should update multiple fields successfully', async () => {
      // Arrange
      const profileId = 'profile-123';
      const updates = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastName',
        balance: 200
      };
      const mockUpdatedRow = createMockUserProfileRow();
      mockUpdatedRow.first_name = 'UpdatedName';
      mockUpdatedRow.last_name = 'UpdatedLastName';
      mockUpdatedRow.balance = 200;

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.update(profileId, updates);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(result.firstName).toBe('UpdatedName');
      expect(result.lastName).toBe('UpdatedLastName');
      expect(result.balance).toBe(200);
      expect(mockFrom.update).toHaveBeenCalledWith(expect.objectContaining({
        first_name: 'UpdatedName',
        last_name: 'UpdatedLastName',
        balance: 200
      }));
    });

    it('should throw error when update fails', async () => {
      // Arrange
      const profileId = 'profile-123';
      const updates = { firstName: 'UpdatedName' };

      mockFrom.single.mockResolvedValue({ data: null, error: new Error('Update failed') });

      // Act & Assert
      await expect(repository.update(profileId, updates)).rejects.toThrow('Error al actualizar perfil de usuario: Update failed');
    });

    it('should update with privacy settings successfully', async () => {
      // Arrange
      const profileId = 'profile-123';
      const updates = {
        privacySettings: new PrivacySettings(false, true, false)
      };
      const mockUpdatedRow = createMockUserProfileRow();

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.update(profileId, updates);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(mockFrom.update).toHaveBeenCalledWith(expect.objectContaining({
        privacy_settings: {
          profile_public: false,
          collection_public: true,
          trade_history_public: false
        }
      }));
    });

    it('should update with notification preferences successfully', async () => {
      // Arrange
      const profileId = 'profile-123';
      const updates = {
        notificationPreferences: new NotificationPreferences(false, true, false)
      };
      const mockUpdatedRow = createMockUserProfileRow();

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.update(profileId, updates);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(mockFrom.update).toHaveBeenCalledWith(expect.objectContaining({
        notification_preferences: {
          email_notifications: false,
          push_notifications: true,
          trade_updates: false
        }
      }));
    });

    it('should update with social media links successfully', async () => {
      // Arrange
      const profileId = 'profile-123';
      const updates = {
        socialMediaLinks: { twitter: '@johndoe', instagram: 'johndoe' }
      };
      const mockUpdatedRow = createMockUserProfileRow();

      mockFrom.single.mockResolvedValue({ data: mockUpdatedRow, error: null });

      // Act
      const result = await repository.update(profileId, updates);

      // Assert
      expect(result).toBeInstanceOf(UserProfile);
      expect(mockFrom.update).toHaveBeenCalledWith(expect.objectContaining({
        social_media_links: { twitter: '@johndoe', instagram: 'johndoe' }
      }));
    });

    it('should handle unexpected errors during update', async () => {
      // Arrange
      const profileId = 'profile-123';
      const updates = { firstName: 'UpdatedName' };

      mockFrom.single.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(repository.update(profileId, updates)).rejects.toThrow('Network error');
    });
  });

  describe('delete', () => {
    it('should delete user profile successfully', async () => {
      // Arrange
      const profileId = 'profile-123';

      mockFrom.eq.mockResolvedValue({ error: null });

      // Act
      const result = await repository.delete(profileId);

      // Assert
      expect(result).toBe(true);
      expect(mockFrom.eq).toHaveBeenCalledWith('id', profileId);
      expect(mockFrom.delete).toHaveBeenCalled();
    });

    it('should return false when delete fails', async () => {
      // Arrange
      const profileId = 'profile-123';

      mockFrom.eq.mockResolvedValue({ error: new Error('Delete failed') });

      // Act
      const result = await repository.delete(profileId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle unexpected errors during delete', async () => {
      // Arrange
      const profileId = 'profile-123';

      mockFrom.eq.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await repository.delete(profileId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
