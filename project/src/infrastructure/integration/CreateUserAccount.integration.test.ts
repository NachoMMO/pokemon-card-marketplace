import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateUserAccountUseCase } from '../../application/use-cases/CreateUserAccountUseCase'
import { SupabaseUserProfileRepository } from '../repositories/SupabaseUserProfileRepository'
import { CreateUserAccountRequest } from '../../application/dtos/CreateUserAccountRequest'

// Mock Supabase client for integration testing
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    getUser: vi.fn()
  },
  from: vi.fn()
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}))

describe('User Account Creation Integration Tests', () => {
  let useCase: CreateUserAccountUseCase
  let userProfileRepository: SupabaseUserProfileRepository
  let mockAuthService: any
  let mockUserRepository: any
  let mockTable: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup table mock
    mockTable = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }
    vi.mocked(mockSupabaseClient.from).mockReturnValue(mockTable)

    // Setup repositories
    userProfileRepository = new SupabaseUserProfileRepository()

    // Mock auth service
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

    // Mock user repository (read-only for auth users)
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      getCurrentUser: vi.fn(),
      onAuthStateChange: vi.fn()
    }

    useCase = new CreateUserAccountUseCase(
      mockAuthService,
      mockUserRepository,
      userProfileRepository
    )
  })

  describe('End-to-End User Creation Flow', () => {
    it('should create complete user account with Supabase integration', async () => {
      const request = new CreateUserAccountRequest(
        'Juan Pérez',
        'juan.perez@example.com',
        'MiPassword123!',
        'MiPassword123!'
      )

      // Mock successful auth signup
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: {
          id: 'auth-user-123',
          email: 'juan.perez@example.com',
          emailConfirmed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        error: null
      })

      // Mock successful profile creation in database
      vi.mocked(mockTable.single).mockResolvedValue({
        data: {
          id: 'profile-123',
          user_id: 'auth-user-123',
          first_name: 'Juan',
          last_name: 'Pérez',
          display_name: expect.any(String),
          balance: 0,
          role: 'BUYER',
          trading_reputation: 0,
          total_trades: 0,
          successful_trades: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          privacy_settings: {
            profilePublic: true,
            collectionPublic: false,
            tradeHistoryPublic: false
          },
          notification_preferences: {
            emailNotifications: true,
            pushNotifications: true,
            tradeUpdates: true
          }
        },
        error: null
      })

      const result = await useCase.execute(request)

      // Verify the complete flow - now only creates auth user
      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()

      // Verify auth service was called correctly
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        email: 'juan.perez@example.com',
        password: 'MiPassword123!'
      })

      // Verify profile repository was NOT called (profiles created during onboarding now)
      expect(mockSupabaseClient.from).not.toHaveBeenCalledWith('user_profiles')

      // Verify the returned auth user
      expect(result.data?.id).toBe('auth-user-123')
      expect(result.data?.email).toBe('juan.perez@example.com')
      expect(result.data?.emailConfirmed).toBe(false)
    })

    it('should handle auth service failures gracefully', async () => {
      const request = new CreateUserAccountRequest(
        'Jane Doe',
        'jane.doe@example.com',
        'Password123!',
        'Password123!'
      )

      // Mock auth service error
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: null,
        error: 'Email already registered'
      })

      const result = await useCase.execute(request)

      expect(result.isSuccess).toBe(false)
      expect(result.error).toContain('Email already registered')

      // Verify profile creation was not attempted
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should succeed since profile creation is no longer part of registration flow', async () => {
      const request = new CreateUserAccountRequest(
        'Bob Smith',
        'bob.smith@example.com',
        'SecurePass123!',
        'SecurePass123!'
      )

      // Mock successful auth signup
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: {
          id: 'auth-user-456',
          email: 'bob.smith@example.com',
          emailConfirmed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        error: null
      })

      const result = await useCase.execute(request)

      expect(result.isSuccess).toBe(true)
      expect(result.data).toBeDefined()

      // Verify auth was called and no profile repository calls were made
      expect(mockAuthService.signUp).toHaveBeenCalled()
      expect(mockSupabaseClient.from).not.toHaveBeenCalledWith('user_profiles')
    })
  })

  describe('Data Consistency', () => {
    it('should return consistent auth user data without profile creation', async () => {
      const request = new CreateUserAccountRequest(
        'Alice Johnson',
        'alice.johnson@example.com',
        'MyPassword123!',
        'MyPassword123!'
      )

      const authUserId = 'consistent-user-id-789'
      const authEmail = 'alice.johnson@example.com'

      // Mock auth response
      vi.mocked(mockAuthService.signUp).mockResolvedValue({
        user: {
          id: authUserId,
          email: authEmail,
          emailConfirmed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        error: null
      })

      const result = await useCase.execute(request)

      expect(result.isSuccess).toBe(true)

      // Verify auth user data consistency
      expect(result.data?.id).toBe(authUserId)
      expect(result.data?.email).toBe(authEmail)
      expect(result.data?.emailConfirmed).toBe(false)

      // Verify no profile repository calls were made
      expect(mockSupabaseClient.from).not.toHaveBeenCalledWith('user_profiles')
    })
  })
})
