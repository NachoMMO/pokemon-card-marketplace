import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginUserUseCase } from '../../../../application/use-cases/auth/LoginUserUseCase';
import type { ISupabaseAuthService } from '../../../../application/ports/services/ISupabaseAuthService';
import type { IUserProfileRepository } from '../../../../application/ports/repositories/IUserProfileRepository';
import type { LoginDTO } from '../../../../application/dtos/AuthDTO';
import { UserProfile, UserRole, PrivacySettings, NotificationPreferences } from '../../../../domain/entities/UserProfile';
import { User } from '../../../../domain/entities/User';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockAuthService: ISupabaseAuthService;
  let mockUserProfileRepository: IUserProfileRepository;

  const mockUserProfile: UserProfile = new UserProfile(
    'profile-1',
    'user-1',
    'John',
    'Doe',
    'johndoe',
    100.00,
    UserRole.BUYER,
    0,
    0,
    0,
    new Date(),
    new Date(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'Test bio',
    'https://example.com/avatar.jpg',
    'Test City',
    undefined,
    {},
    new PrivacySettings(),
    new NotificationPreferences()
  );

  beforeEach(() => {
    mockAuthService = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      onAuthStateChange: vi.fn(),
      getAccessToken: vi.fn()
    };

    mockUserProfileRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByDisplayName: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    useCase = new LoginUserUseCase(mockAuthService, mockUserProfileRepository);
  });

  describe('execute', () => {
    const validLoginData: LoginDTO = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user successfully with confirmed email', async () => {
      // Arrange
      const mockUser = new User(
        'user-1',
        'test@example.com',
        true,
        new Date(),
        new Date()
      );

      const authResponse = {
        user: mockUser,
        error: null
      };

      (mockAuthService.signIn as any).mockResolvedValue(authResponse);
      (mockUserProfileRepository.findByUserId as any).mockResolvedValue(mockUserProfile);

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        emailConfirmed: true
      });
      expect(result.profile).toEqual({
        id: mockUserProfile.id,
        firstName: mockUserProfile.firstName,
        lastName: mockUserProfile.lastName,
        displayName: mockUserProfile.displayName,
        bio: mockUserProfile.bio,
        avatarUrl: mockUserProfile.avatarUrl,
        location: mockUserProfile.location,
        balance: mockUserProfile.balance
      });
      expect(result.error).toBeNull();

      expect(mockAuthService.signIn).toHaveBeenCalledWith({
        email: validLoginData.email,
        password: validLoginData.password
      });
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should return error when auth service returns error', async () => {
      // Arrange
      const authResponse = {
        user: null,
        error: 'Invalid credentials'
      };

      (mockAuthService.signIn as any).mockResolvedValue(authResponse);

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Invalid credentials');
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should return error when user is null', async () => {
      // Arrange
      const authResponse = {
        user: null,
        error: null
      };

      (mockAuthService.signIn as any).mockResolvedValue(authResponse);

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Error al iniciar sesión');
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should handle unconfirmed email', async () => {
      // Arrange
      const mockUser = new User(
        'user-1',
        'test@example.com',
        false,
        new Date(),
        new Date()
      );

      const authResponse = {
        user: mockUser,
        error: null
      };

      (mockAuthService.signIn as any).mockResolvedValue(authResponse);

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        emailConfirmed: false
      });
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Debes confirmar tu email antes de continuar');
      expect(result.requiresEmailConfirmation).toBe(true);
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should login successfully even if user profile is not found', async () => {
      // Arrange
      const mockUser = new User(
        'user-1',
        'test@example.com',
        true,
        new Date(),
        new Date()
      );

      const authResponse = {
        user: mockUser,
        error: null
      };

      (mockAuthService.signIn as any).mockResolvedValue(authResponse);
      (mockUserProfileRepository.findByUserId as any).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        emailConfirmed: true
      });
      expect(result.profile).toBeNull();
      expect(result.error).toBeNull();
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should handle auth service errors gracefully', async () => {
      // Arrange
      (mockAuthService.signIn as any).mockRejectedValue(new Error('Network error'));

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Network error');
      expect(mockUserProfileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should handle user profile repository errors gracefully', async () => {
      // Arrange
      const mockUser = new User(
        'user-1',
        'test@example.com',
        true,
        new Date(),
        new Date()
      );

      const authResponse = {
        user: mockUser,
        error: null
      };

      (mockAuthService.signIn as any).mockResolvedValue(authResponse);
      (mockUserProfileRepository.findByUserId as any).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      (mockAuthService.signIn as any).mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(validLoginData);

      // Assert
      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Error desconocido');
    });
  });
});
