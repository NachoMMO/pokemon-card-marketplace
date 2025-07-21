import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateUserAccountUseCase } from './CreateUserAccountUseCase'
import type { ISupabaseAuthService } from '../ports/services/ISupabaseAuthService'
import type { IUserRepository } from '../ports/repositories/IUserRepository'
import type { IUserProfileRepository } from '../ports/repositories/IUserProfileRepository'
import { CreateUserAccountRequest } from '../dtos/CreateUserAccountRequest'

describe('CreateUserAccountUseCase Application Layer', () => {
  let useCase: CreateUserAccountUseCase
  let mockAuthService: ISupabaseAuthService
  let mockUserRepository: IUserRepository
  let mockUserProfileRepository: IUserProfileRepository

  beforeEach(() => {
    // Create mocks for the port interfaces
    mockAuthService = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      getCurrentUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      getAccessToken: vi.fn()
    }

    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      getCurrentUser: vi.fn(),
      onAuthStateChange: vi.fn()
    }

    mockUserProfileRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByDisplayName: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }

    useCase = new CreateUserAccountUseCase(
      mockAuthService,
      mockUserRepository,
      mockUserProfileRepository
    )
  })

  describe('Port Interface Contracts', () => {
    it('should use auth service to create user account', async () => {
      const request = new CreateUserAccountRequest(
        'Juan Pérez',
        'juan.perez@example.com',
        'MiPassword123!',
        'MiPassword123!'
      )

      // Mock successful auth signup
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: {
          id: 'user123',
          email: 'juan.perez@example.com',
          emailConfirmed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        error: null
      })

      // Mock successful repository operations
      vi.mocked(mockUserProfileRepository.create).mockResolvedValue({
        id: 'profile123',
        userId: 'user123',
        firstName: 'Juan',
        lastName: 'Pérez',
        displayName: 'juanperez123',
        balance: 0,
        role: 'BUYER',
        tradingReputation: 0,
        totalTrades: 0,
        successfulTrades: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)

      const result = await useCase.execute(request)

      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'juan.perez@example.com',
          password: 'MiPassword123!'
        })
      )
      expect(result.isSuccess).toBe(true)
    })

    it('should handle auth service errors', async () => {
      const request = new CreateUserAccountRequest(
        'Juan Pérez',
        'juan.perez@example.com',
        'MiPassword123!',
        'MiPassword123!'
      )

      // Mock auth service error
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: null,
        error: 'Email already exists'
      })

      const result = await useCase.execute(request)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain('Email already exists')
    })

    it('should return auth user after successful signup without creating profile', async () => {
      const request = new CreateUserAccountRequest(
        'Juan Pérez',
        'juan.perez@example.com',
        'MiPassword123!',
        'MiPassword123!'
      )

      // Mock successful auth signup
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: {
          id: 'user123',
          email: 'juan.perez@example.com',
          emailConfirmed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        error: null
      })

      const result = await useCase.execute(request)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockUserProfileRepository.create).not.toHaveBeenCalled()
    })

    it('should validate DTO before processing', async () => {
      const invalidRequest = new CreateUserAccountRequest(
        '', // empty name
        'invalid-email', // invalid email
        '123', // weak password
        '456' // mismatched password
      )

      const result = await useCase.execute(invalidRequest)

      expect(result.isSuccess).toBe(false)
      expect(mockAuthService.signUp).not.toHaveBeenCalled()
    })
  })
})
