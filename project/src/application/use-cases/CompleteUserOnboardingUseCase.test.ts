import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompleteUserOnboardingUseCase } from './CompleteUserOnboardingUseCase'
import type { ISupabaseAuthService } from '../ports/services/ISupabaseAuthService'
import type { IUserProfileRepository } from '../ports/repositories/IUserProfileRepository'
import { User } from '../../domain/entities/User'
import { UserProfile } from '../../domain/entities/UserProfile'

describe('CompleteUserOnboardingUseCase', () => {
  let useCase: CompleteUserOnboardingUseCase
  let mockAuthService: ISupabaseAuthService
  let mockUserProfileRepository: IUserProfileRepository

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      getSession: vi.fn()
    } as any

    mockUserProfileRepository = {
      create: vi.fn(),
      getById: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      search: vi.fn()
    } as any

    useCase = new CompleteUserOnboardingUseCase(
      mockAuthService,
      mockUserProfileRepository
    )
  })

  describe('execute', () => {
    const mockUser: User = {
      id: 'user123',
      email: 'test@example.com',
      emailConfirmed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const mockProfile = UserProfile.create({
      userId: 'user123',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'testuser',
      bio: 'Test bio',
      location: 'Test City',
      balance: 0
    })

    it('should create user profile with onboarding data', async () => {
      const onboardingData = {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
        bio: 'Test bio',
        location: 'Test City',
        dateOfBirth: '1990-01-01'
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(mockUserProfileRepository.findByUserId).mockResolvedValue(null)
      vi.mocked(mockUserProfileRepository.create).mockResolvedValue(mockProfile)

      const result = await useCase.execute(onboardingData)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
      expect(mockUserProfileRepository.findByUserId).toHaveBeenCalledWith('user123')
      expect(mockUserProfileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          firstName: 'Test',
          lastName: 'User',
          displayName: 'testuser',
          bio: 'Test bio',
          location: 'Test City'
        })
      )
    })

    it('should handle missing current user', async () => {
      const onboardingData = {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
        bio: 'Test bio',
        location: 'Test City',
        dateOfBirth: '1990-01-01'
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(null)

      const result = await useCase.execute(onboardingData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('User must be authenticated to complete onboarding')
      expect(mockUserProfileRepository.create).not.toHaveBeenCalled()
    })

    it('should handle profile creation failure', async () => {
      const onboardingData = {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
        bio: 'Test bio',
        location: 'Test City',
        dateOfBirth: '1990-01-01'
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(mockUserProfileRepository.findByUserId).mockResolvedValue(null)
      vi.mocked(mockUserProfileRepository.create).mockRejectedValue(
        new Error('Profile creation failed')
      )

      const result = await useCase.execute(onboardingData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('Profile creation failed')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'User',
        displayName: 'testuser',
        bio: 'Test bio',
        location: 'Test City',
        dateOfBirth: '1990-01-01'
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)

      const result = await useCase.execute(invalidData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('First name, last name, and display name are required')
    })

    it('should validate displayName requirement', async () => {
      const onboardingData = {
        firstName: 'Test',
        lastName: 'User',
        displayName: '', // Empty
        bio: 'Test bio',
        location: 'Test City',
        dateOfBirth: '1990-01-01'
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)

      const result = await useCase.execute(onboardingData)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toBe('First name, last name, and display name are required')
    })

    it('should handle optional fields correctly', async () => {
      const minimalData = {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'testuser',
        bio: undefined,
        location: undefined,
        dateOfBirth: undefined
      }

      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(mockUserProfileRepository.findByUserId).mockResolvedValue(null)
      vi.mocked(mockUserProfileRepository.create).mockResolvedValue(mockProfile)

      const result = await useCase.execute(minimalData)

      expect(result.isSuccess).toBe(true)
      expect(mockUserProfileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          firstName: 'Test',
          lastName: 'User',
          displayName: 'testuser',
          balance: 0
        })
      )
    })
  })
})
