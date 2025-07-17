import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { GetCurrentUserUseCase } from '../../../../application/use-cases/auth/GetCurrentUserUseCase';
import type { ISupabaseAuthService } from '../../../../application/ports/services/ISupabaseAuthService';
import type { IUserProfileRepository } from '../../../../application/ports/repositories/IUserProfileRepository';

// Tipos locales para el test
interface SupabaseUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let mockAuthService: any;
  let mockUserProfileRepository: any;

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      onAuthStateChange: vi.fn(),
      getAccessToken: vi.fn()
    };

    mockUserProfileRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByEmail: vi.fn(),
      findByDisplayName: vi.fn()
    };

    useCase = new GetCurrentUserUseCase(mockAuthService as any, mockUserProfileRepository as any);
  });

  it('should return current user with profile when both exist', async () => {
    // Arrange
    const mockUser: SupabaseUser = {
      id: 'user-123',
      email: 'test@example.com',
      emailConfirmed: true
    };

    const mockProfile: UserProfile = {
      id: 'profile-123',
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'JohnDoe',
      bio: 'Test bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      location: 'Test City',
      balance: 250.75,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockUserProfileRepository.findByUserId.mockResolvedValue(mockProfile);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        emailConfirmed: true
      },
      profile: {
        id: 'profile-123',
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'JohnDoe',
        bio: 'Test bio',
        avatarUrl: 'https://example.com/avatar.jpg',
        location: 'Test City',
        balance: 250.75
      },
      error: null
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
    expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-123');
  });

  it('should return current user without profile when profile does not exist', async () => {
    // Arrange
    const mockUser: SupabaseUser = {
      id: 'user-456',
      email: 'newuser@example.com',
      emailConfirmed: false
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockUserProfileRepository.findByUserId.mockResolvedValue(null);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      user: {
        id: 'user-456',
        email: 'newuser@example.com',
        emailConfirmed: false
      },
      profile: null,
      error: null
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
    expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-456');
  });

  it('should return null user and profile when no user is authenticated', async () => {
    // Arrange
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      user: null,
      profile: null,
      error: null
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
    expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('should handle auth service error gracefully', async () => {
    // Arrange
    const error = new Error('Authentication service error');
    mockAuthService.getCurrentUser.mockRejectedValue(error);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      user: null,
      profile: null,
      error: 'Authentication service error'
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
    expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('should handle user profile repository error gracefully', async () => {
    // Arrange
    const mockUser: SupabaseUser = {
      id: 'user-789',
      email: 'erroruser@example.com',
      emailConfirmed: true
    };

    const profileError = new Error('Profile repository error');

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockUserProfileRepository.findByUserId.mockRejectedValue(profileError);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      user: null,
      profile: null,
      error: 'Profile repository error'
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
    expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-789');
  });

  it('should handle non-Error exceptions gracefully', async () => {
    // Arrange
    mockAuthService.getCurrentUser.mockRejectedValue('String error');

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      user: null,
      profile: null,
      error: 'Error al obtener usuario actual'
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
  });

  it('should handle user with partial profile information', async () => {
    // Arrange
    const mockUser: SupabaseUser = {
      id: 'user-partial',
      email: 'partial@example.com',
      emailConfirmed: true
    };

    const partialProfile: UserProfile = {
      id: 'profile-partial',
      userId: 'user-partial',
      firstName: 'Jane',
      lastName: '',
      displayName: 'Jane',
      bio: null,
      avatarUrl: null,
      location: null,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockUserProfileRepository.findByUserId.mockResolvedValue(partialProfile);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual({
      user: {
        id: 'user-partial',
        email: 'partial@example.com',
        emailConfirmed: true
      },
      profile: {
        id: 'profile-partial',
        firstName: 'Jane',
        lastName: '',
        displayName: 'Jane',
        bio: null,
        avatarUrl: null,
        location: null,
        balance: 0
      },
      error: null
    });

    expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnce();
    expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-partial');
  });

  it('should handle user with zero balance correctly', async () => {
    // Arrange
    const mockUser: SupabaseUser = {
      id: 'user-zero-balance',
      email: 'zerobalance@example.com',
      emailConfirmed: true
    };

    const profileWithZeroBalance: UserProfile = {
      id: 'profile-zero',
      userId: 'user-zero-balance',
      firstName: 'Zero',
      lastName: 'Balance',
      displayName: 'ZeroBalance',
      bio: 'User with zero balance',
      avatarUrl: 'https://example.com/zero.jpg',
      location: 'Zero City',
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockUserProfileRepository.findByUserId.mockResolvedValue(profileWithZeroBalance);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.profile?.balance).toBe(0);
    expect(result.error).toBeNull();
    expect(result.user).toBeTruthy();
    expect(result.profile).toBeTruthy();
  });
});
