import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserProfile, UserRole, PrivacySettings, NotificationPreferences } from '../../../../domain/entities/UserProfile';

describe('UserProfile', () => {
  let mockUser: UserProfile;
  const mockDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock crypto.randomUUID globally
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn().mockReturnValue('mocked-uuid')
      },
      writable: true
    });

    mockUser = new UserProfile(
      'profile-123',
      'user-456',
      'John',
      'Doe',
      'johndoe',
      1000,
      UserRole.BUYER,
      95,
      20,
      18,
      mockDate,
      mockDate,
      new Date('1990-01-01'),
      '123 Main St',
      'New York',
      '10001',
      'USA',
      'I love Pokemon cards!',
      'https://example.com/avatar.jpg',
      'New York, NY',
      'https://johndoe.com',
      { twitter: '@johndoe', instagram: 'johndoe' },
      new PrivacySettings(true, false, true),
      new NotificationPreferences(true, false, true)
    );
  });

  describe('constructor', () => {
    it('should create a UserProfile with all properties', () => {
      expect(mockUser.id).toBe('profile-123');
      expect(mockUser.userId).toBe('user-456');
      expect(mockUser.firstName).toBe('John');
      expect(mockUser.lastName).toBe('Doe');
      expect(mockUser.displayName).toBe('johndoe');
      expect(mockUser.balance).toBe(1000);
      expect(mockUser.role).toBe(UserRole.BUYER);
      expect(mockUser.tradingReputation).toBe(95);
      expect(mockUser.totalTrades).toBe(20);
      expect(mockUser.successfulTrades).toBe(18);
      expect(mockUser.createdAt).toEqual(mockDate);
      expect(mockUser.updatedAt).toEqual(mockDate);
      expect(mockUser.dateOfBirth).toEqual(new Date('1990-01-01'));
      expect(mockUser.address).toBe('123 Main St');
      expect(mockUser.city).toBe('New York');
      expect(mockUser.postalCode).toBe('10001');
      expect(mockUser.country).toBe('USA');
      expect(mockUser.bio).toBe('I love Pokemon cards!');
      expect(mockUser.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(mockUser.location).toBe('New York, NY');
      expect(mockUser.website).toBe('https://johndoe.com');
      expect(mockUser.socialMediaLinks).toEqual({ twitter: '@johndoe', instagram: 'johndoe' });
      expect(mockUser.privacySettings).toBeInstanceOf(PrivacySettings);
      expect(mockUser.notificationPreferences).toBeInstanceOf(NotificationPreferences);
    });

    it('should create a UserProfile with default values', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'First',
        'Last',
        'display',
        0,
        UserRole.BUYER,
        0,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(profile.balance).toBe(0);
      expect(profile.role).toBe(UserRole.BUYER);
      expect(profile.tradingReputation).toBe(0);
      expect(profile.totalTrades).toBe(0);
      expect(profile.successfulTrades).toBe(0);
      expect(profile.socialMediaLinks).toEqual({});
      expect(profile.privacySettings).toBeInstanceOf(PrivacySettings);
      expect(profile.notificationPreferences).toBeInstanceOf(NotificationPreferences);
    });
  });

  describe('create factory method', () => {
    it('should create a new UserProfile with minimal data', () => {
      const data = {
        userId: 'user-123',
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'janesmith'
      };

      const profile = UserProfile.create(data);

      expect(profile.id).toBe('mocked-uuid');
      expect(profile.userId).toBe('user-123');
      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
      expect(profile.displayName).toBe('janesmith');
      expect(profile.balance).toBe(0);
      expect(profile.role).toBe(UserRole.BUYER);
      expect(profile.tradingReputation).toBe(0);
      expect(profile.totalTrades).toBe(0);
      expect(profile.successfulTrades).toBe(0);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
      expect(profile.dateOfBirth).toBeUndefined();
      expect(profile.address).toBeUndefined();
      expect(profile.city).toBeUndefined();
      expect(profile.postalCode).toBeUndefined();
      expect(profile.country).toBeUndefined();
      expect(profile.bio).toBeUndefined();
      expect(profile.avatarUrl).toBeUndefined();
      expect(profile.location).toBeUndefined();
      expect(profile.website).toBeUndefined();
      expect(profile.socialMediaLinks).toEqual({});
      expect(profile.privacySettings).toBeInstanceOf(PrivacySettings);
      expect(profile.notificationPreferences).toBeInstanceOf(NotificationPreferences);
    });

    it('should create a new UserProfile with all optional data', () => {
      const data = {
        userId: 'user-123',
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'janesmith',
        balance: 500,
        bio: 'Card collector',
        avatarUrl: 'https://example.com/jane.jpg',
        location: 'Los Angeles, CA'
      };

      const profile = UserProfile.create(data);

      expect(profile.balance).toBe(500);
      expect(profile.bio).toBe('Card collector');
      expect(profile.avatarUrl).toBe('https://example.com/jane.jpg');
      expect(profile.location).toBe('Los Angeles, CA');
    });

    it('should create UserProfile with default balance when not provided', () => {
      const data = {
        userId: 'user-123',
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'janesmith'
      };

      const profile = UserProfile.create(data);
      expect(profile.balance).toBe(0);
    });
  });

  describe('update method', () => {
    it('should update profile with all fields', () => {
      const updates = {
        firstName: 'Johnny',
        lastName: 'Doe-Smith',
        displayName: 'johnnysmith',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/new-avatar.jpg',
        location: 'Boston, MA',
        website: 'https://newwebsite.com',
        address: '456 Oak St',
        city: 'Boston',
        postalCode: '02101',
        country: 'USA',
        socialMediaLinks: { linkedin: 'johndoe' },
        privacySettings: new PrivacySettings(false, true, false),
        notificationPreferences: new NotificationPreferences(false, true, false)
      };

      const updatedProfile = mockUser.update(updates);

      expect(updatedProfile.firstName).toBe('Johnny');
      expect(updatedProfile.lastName).toBe('Doe-Smith');
      expect(updatedProfile.displayName).toBe('johnnysmith');
      expect(updatedProfile.bio).toBe('Updated bio');
      expect(updatedProfile.avatarUrl).toBe('https://example.com/new-avatar.jpg');
      expect(updatedProfile.location).toBe('Boston, MA');
      expect(updatedProfile.website).toBe('https://newwebsite.com');
      expect(updatedProfile.address).toBe('456 Oak St');
      expect(updatedProfile.city).toBe('Boston');
      expect(updatedProfile.postalCode).toBe('02101');
      expect(updatedProfile.country).toBe('USA');
      expect(updatedProfile.socialMediaLinks).toEqual({ linkedin: 'johndoe' });
      expect(updatedProfile.privacySettings.profilePublic).toBe(false);
      expect(updatedProfile.privacySettings.collectionPublic).toBe(true);
      expect(updatedProfile.privacySettings.tradeHistoryPublic).toBe(false);
      expect(updatedProfile.notificationPreferences.emailNotifications).toBe(false);
      expect(updatedProfile.notificationPreferences.pushNotifications).toBe(true);
      expect(updatedProfile.notificationPreferences.tradeUpdates).toBe(false);

      // Should preserve unchanged fields
      expect(updatedProfile.id).toBe(mockUser.id);
      expect(updatedProfile.userId).toBe(mockUser.userId);
      expect(updatedProfile.balance).toBe(mockUser.balance);
      expect(updatedProfile.role).toBe(mockUser.role);
      expect(updatedProfile.tradingReputation).toBe(mockUser.tradingReputation);
      expect(updatedProfile.totalTrades).toBe(mockUser.totalTrades);
      expect(updatedProfile.successfulTrades).toBe(mockUser.successfulTrades);
      expect(updatedProfile.createdAt).toEqual(mockUser.createdAt);

      // Should update timestamp
      expect(updatedProfile.updatedAt).not.toEqual(mockUser.updatedAt);
      expect(updatedProfile.updatedAt).toBeInstanceOf(Date);
    });

    it('should update profile with partial data', () => {
      const updates = {
        firstName: 'Johnny',
        bio: 'New bio'
      };

      const updatedProfile = mockUser.update(updates);

      expect(updatedProfile.firstName).toBe('Johnny');
      expect(updatedProfile.bio).toBe('New bio');

      // Should preserve unchanged fields
      expect(updatedProfile.lastName).toBe(mockUser.lastName);
      expect(updatedProfile.displayName).toBe(mockUser.displayName);
      expect(updatedProfile.avatarUrl).toBe(mockUser.avatarUrl);
      expect(updatedProfile.location).toBe(mockUser.location);
      expect(updatedProfile.website).toBe(mockUser.website);
      expect(updatedProfile.address).toBe(mockUser.address);
      expect(updatedProfile.city).toBe(mockUser.city);
      expect(updatedProfile.postalCode).toBe(mockUser.postalCode);
      expect(updatedProfile.country).toBe(mockUser.country);
      expect(updatedProfile.socialMediaLinks).toEqual(mockUser.socialMediaLinks);
      expect(updatedProfile.privacySettings).toEqual(mockUser.privacySettings);
      expect(updatedProfile.notificationPreferences).toEqual(mockUser.notificationPreferences);
    });

    it('should update profile with empty updates object', () => {
      const updatedProfile = mockUser.update({});

      // All fields should remain the same except updatedAt
      expect(updatedProfile.firstName).toBe(mockUser.firstName);
      expect(updatedProfile.lastName).toBe(mockUser.lastName);
      expect(updatedProfile.displayName).toBe(mockUser.displayName);
      expect(updatedProfile.bio).toBe(mockUser.bio);
      expect(updatedProfile.avatarUrl).toBe(mockUser.avatarUrl);
      expect(updatedProfile.location).toBe(mockUser.location);
      expect(updatedProfile.website).toBe(mockUser.website);
      expect(updatedProfile.address).toBe(mockUser.address);
      expect(updatedProfile.city).toBe(mockUser.city);
      expect(updatedProfile.postalCode).toBe(mockUser.postalCode);
      expect(updatedProfile.country).toBe(mockUser.country);
      expect(updatedProfile.socialMediaLinks).toEqual(mockUser.socialMediaLinks);
      expect(updatedProfile.privacySettings).toEqual(mockUser.privacySettings);
      expect(updatedProfile.notificationPreferences).toEqual(mockUser.notificationPreferences);

      // Should update timestamp
      expect(updatedProfile.updatedAt).not.toEqual(mockUser.updatedAt);
    });
  });

  describe('fullName getter', () => {
    it('should return full name', () => {
      expect(mockUser.fullName).toBe('John Doe');
    });

    it('should return full name with single character names', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'J',
        'D',
        'jd',
        0,
        UserRole.BUYER,
        0,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(profile.fullName).toBe('J D');
    });
  });

  describe('isProfileComplete method', () => {
    it('should return true for complete profile', () => {
      expect(mockUser.isProfileComplete()).toBe(true);
    });

    it('should return false when firstName is missing', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        '',
        'Last',
        'display',
        0,
        UserRole.BUYER,
        0,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(profile.isProfileComplete()).toBe(false);
    });

    it('should return false when lastName is missing', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'First',
        '',
        'display',
        0,
        UserRole.BUYER,
        0,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(profile.isProfileComplete()).toBe(false);
    });

    it('should return false when displayName is missing', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'First',
        'Last',
        '',
        0,
        UserRole.BUYER,
        0,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(profile.isProfileComplete()).toBe(false);
    });

    it('should return false when all required fields are missing', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        '',
        '',
        '',
        0,
        UserRole.BUYER,
        0,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(profile.isProfileComplete()).toBe(false);
    });
  });

  describe('tradingSuccessRate getter', () => {
    it('should calculate trading success rate correctly', () => {
      expect(mockUser.tradingSuccessRate).toBe(90); // 18/20 * 100 = 90%
    });

    it('should return 0 when totalTrades is 0', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'First',
        'Last',
        'display',
        0,
        UserRole.BUYER,
        0,
        0, // totalTrades
        0,
        mockDate,
        mockDate
      );

      expect(profile.tradingSuccessRate).toBe(0);
    });

    it('should return 100 when all trades are successful', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'First',
        'Last',
        'display',
        0,
        UserRole.BUYER,
        0,
        10, // totalTrades
        10, // successfulTrades
        mockDate,
        mockDate
      );

      expect(profile.tradingSuccessRate).toBe(100);
    });

    it('should return 0 when no trades are successful', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'First',
        'Last',
        'display',
        0,
        UserRole.BUYER,
        0,
        10, // totalTrades
        0, // successfulTrades
        mockDate,
        mockDate
      );

      expect(profile.tradingSuccessRate).toBe(0);
    });

    it('should handle fractional success rates', () => {
      const profile = new UserProfile(
        'id',
        'userId',
        'First',
        'Last',
        'display',
        0,
        UserRole.BUYER,
        0,
        3, // totalTrades
        1, // successfulTrades
        mockDate,
        mockDate
      );

      expect(profile.tradingSuccessRate).toBeCloseTo(33.33, 1);
    });
  });
});

describe('UserRole enum', () => {
  it('should have correct values', () => {
    expect(UserRole.BUYER).toBe('buyer');
    expect(UserRole.SELLER).toBe('seller');
    expect(UserRole.ADMIN).toBe('admin');
  });
});

describe('PrivacySettings', () => {
  it('should create with default values', () => {
    const settings = new PrivacySettings();

    expect(settings.profilePublic).toBe(true);
    expect(settings.collectionPublic).toBe(false);
    expect(settings.tradeHistoryPublic).toBe(false);
  });

  it('should create with custom values', () => {
    const settings = new PrivacySettings(false, true, true);

    expect(settings.profilePublic).toBe(false);
    expect(settings.collectionPublic).toBe(true);
    expect(settings.tradeHistoryPublic).toBe(true);
  });

  it('should allow partial initialization', () => {
    const settings = new PrivacySettings(false);

    expect(settings.profilePublic).toBe(false);
    expect(settings.collectionPublic).toBe(false); // default
    expect(settings.tradeHistoryPublic).toBe(false); // default
  });
});

describe('NotificationPreferences', () => {
  it('should create with default values', () => {
    const prefs = new NotificationPreferences();

    expect(prefs.emailNotifications).toBe(true);
    expect(prefs.pushNotifications).toBe(true);
    expect(prefs.tradeUpdates).toBe(true);
  });

  it('should create with custom values', () => {
    const prefs = new NotificationPreferences(false, false, false);

    expect(prefs.emailNotifications).toBe(false);
    expect(prefs.pushNotifications).toBe(false);
    expect(prefs.tradeUpdates).toBe(false);
  });

  it('should allow partial initialization', () => {
    const prefs = new NotificationPreferences(false);

    expect(prefs.emailNotifications).toBe(false);
    expect(prefs.pushNotifications).toBe(true); // default
    expect(prefs.tradeUpdates).toBe(true); // default
  });

  it('should handle mixed values', () => {
    const prefs = new NotificationPreferences(true, false, true);

    expect(prefs.emailNotifications).toBe(true);
    expect(prefs.pushNotifications).toBe(false);
    expect(prefs.tradeUpdates).toBe(true);
  });
});
