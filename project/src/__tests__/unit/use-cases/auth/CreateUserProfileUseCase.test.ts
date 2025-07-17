// Tests unitarios para CreateUserProfileUseCase
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateUserProfileUseCase } from '../../../../application/use-cases/auth/CreateUserProfileUseCase';
import type { IUserProfileRepository } from '../../../../application/ports/repositories/IUserProfileRepository';
import type { ISupabaseAuthService } from '../../../../application/ports/services/ISupabaseAuthService';
import type { RegisterDTO, AuthResponseDTO } from '../../../../application/dtos/AuthDTO';
import { UserProfile } from '../../../../domain/entities/UserProfile';

describe('CreateUserProfileUseCase', () => {
  let useCase: CreateUserProfileUseCase;
  let mockUserProfileRepository: Partial<IUserProfileRepository>;
  let mockAuthService: Partial<ISupabaseAuthService>;

  beforeEach(() => {
    mockUserProfileRepository = {
      findByDisplayName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };

    mockAuthService = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn(),
      updateUser: vi.fn(),
      resetPassword: vi.fn(),
      confirmEmail: vi.fn(),
      onAuthStateChange: vi.fn(),
    };

    useCase = new CreateUserProfileUseCase(
      mockAuthService as ISupabaseAuthService,
      mockUserProfileRepository as IUserProfileRepository
    );
  });

  describe('execute', () => {
    it('should create user and profile successfully', async () => {
      const registerData: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
      };

      const mockAuthUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailConfirmed: true,
      };

      const mockUserProfile = UserProfile.create({
        userId: 'user-123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
        balance: 0,
      });

      vi.mocked(mockUserProfileRepository.findByDisplayName).mockResolvedValue(null);
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: mockAuthUser,
        error: null
      });
      vi.mocked(mockUserProfileRepository.create).mockResolvedValue(mockUserProfile);

      const result = await useCase.execute(registerData);

      expect(result.user).toEqual(mockAuthUser);
      expect(result.profile).toEqual({
        id: mockUserProfile.id,
        firstName: mockUserProfile.firstName,
        lastName: mockUserProfile.lastName,
        displayName: mockUserProfile.displayName,
        bio: mockUserProfile.bio,
        avatarUrl: mockUserProfile.avatarUrl,
        location: mockUserProfile.location,
        balance: mockUserProfile.balance,
      });
      expect(result.error).toBeNull();
      expect(mockUserProfileRepository.findByDisplayName).toHaveBeenCalledWith('testuser');
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should fail if passwords do not match', async () => {
      const registerData: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
      };

      const result = await useCase.execute(registerData);

      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Las contraseñas no coinciden');
      expect(mockUserProfileRepository.findByDisplayName).not.toHaveBeenCalled();
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should fail if display name is already taken', async () => {
      const registerData: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'existinguser',
      };

      const existingProfile = UserProfile.create({
        userId: 'other-user-456',
        firstName: 'Other',
        lastName: 'User',
        displayName: 'existinguser',
        balance: 0,
      });

      vi.mocked(mockUserProfileRepository.findByDisplayName).mockResolvedValue(existingProfile);

      const result = await useCase.execute(registerData);

      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('El nombre de usuario ya está en uso');
      expect(mockUserProfileRepository.findByDisplayName).toHaveBeenCalledWith('existinguser');
      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('should fail if auth service returns error', async () => {
      const registerData: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
      };

      vi.mocked(mockUserProfileRepository.findByDisplayName).mockResolvedValue(null);
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: null,
        error: 'Email already exists'
      });

      const result = await useCase.execute(registerData);

      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Email already exists');
      expect(mockUserProfileRepository.create).not.toHaveBeenCalled();
    });

    it('should handle email confirmation required', async () => {
      const registerData: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
      };

      const mockAuthUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailConfirmed: false,
      };

      vi.mocked(mockUserProfileRepository.findByDisplayName).mockResolvedValue(null);
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: mockAuthUser,
        error: null
      });

      const result = await useCase.execute(registerData);

      expect(result.user).toEqual(mockAuthUser);
      expect(result.profile).toBeNull();
      expect(result.error).toBeNull();
      expect(result.requiresEmailConfirmation).toBe(true);
      expect(mockUserProfileRepository.create).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const registerData: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
      };

      vi.mocked(mockUserProfileRepository.findByDisplayName).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await useCase.execute(registerData);

      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });
  });
});
