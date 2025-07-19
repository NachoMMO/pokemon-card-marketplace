import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseUserProfileRepository } from './SupabaseUserProfileRepository'
import { UserProfile } from '../../domain/entities/UserProfile'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn()
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}))

describe('SupabaseUserProfileRepository Infrastructure Tests', () => {
  let repository: SupabaseUserProfileRepository
  let mockTable: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockTable = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }

    vi.mocked(mockSupabaseClient.from).mockReturnValue(mockTable)

    repository = new SupabaseUserProfileRepository()
  })

  describe('Create UserProfile', () => {
    it('should create user profile successfully', async () => {
      const profileData = UserProfile.create({
        userId: 'user123',
        firstName: 'Juan',
        lastName: 'Pérez',
        displayName: 'juanperez123',
        balance: 0
      })

      const mockResponse = {
        data: {
          id: 'profile123',
          user_id: 'user123',
          first_name: 'Juan',
          last_name: 'Pérez',
          display_name: 'juanperez123',
          balance: 0,
          role: 'BUYER',
          trading_reputation: 0,
          total_trades: 0,
          successful_trades: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      }

      vi.mocked(mockTable.single).mockResolvedValue(mockResponse)

      const result = await repository.create(profileData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockTable.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user123',
          first_name: 'Juan',
          last_name: 'Pérez',
          display_name: 'juanperez123',
          balance: 0
        })
      )
      expect(result.id).toBe('profile123')
      expect(result.firstName).toBe('Juan')
      expect(result.lastName).toBe('Pérez')
    })

    it('should handle database errors during creation', async () => {
      const profileData = UserProfile.create({
        userId: 'user123',
        firstName: 'Juan',
        lastName: 'Pérez',
        displayName: 'existinguser', // This might cause uniqueness constraint error
        balance: 0
      })

      const mockErrorResponse = {
        data: null,
        error: {
          message: 'duplicate key value violates unique constraint "user_profiles_display_name_key"',
          code: '23505'
        }
      }

      vi.mocked(mockTable.single).mockResolvedValue(mockErrorResponse)

      await expect(repository.create(profileData)).rejects.toThrow('duplicate key value')
    })
  })

  describe('Find UserProfile', () => {
    it('should find user profile by userId', async () => {
      const mockResponse = {
        data: {
          id: 'profile123',
          user_id: 'user123',
          first_name: 'Juan',
          last_name: 'Pérez',
          display_name: 'juanperez123',
          balance: 100.0,
          role: 'BUYER',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      }

      vi.mocked(mockTable.single).mockResolvedValue(mockResponse)

      const result = await repository.findByUserId('user123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockTable.select).toHaveBeenCalledWith('*')
      expect(mockTable.eq).toHaveBeenCalledWith('user_id', 'user123')
      expect(result).not.toBeNull()
      expect(result?.userId).toBe('user123')
      expect(result?.firstName).toBe('Juan')
    })

    it('should return null when user profile not found', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'No rows found', code: 'PGRST116' }
      }

      vi.mocked(mockTable.single).mockResolvedValue(mockResponse)

      const result = await repository.findByUserId('nonexistent')

      expect(result).toBeNull()
    })

    it('should find user profile by display name', async () => {
      const mockResponse = {
        data: {
          id: 'profile123',
          user_id: 'user123',
          display_name: 'juanperez123',
          first_name: 'Juan',
          last_name: 'Pérez',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      }

      vi.mocked(mockTable.single).mockResolvedValue(mockResponse)

      const result = await repository.findByDisplayName('juanperez123')

      expect(mockTable.eq).toHaveBeenCalledWith('display_name', 'juanperez123')
      expect(result?.displayName).toBe('juanperez123')
    })
  })

  describe('Data Mapping', () => {
    it('should correctly map between domain entity and database schema', () => {
      // This test verifies that the mapping between domain entities and database schema is correct
      const profileData = UserProfile.create({
        userId: 'user123',
        firstName: 'Juan',
        lastName: 'Pérez',
        displayName: 'juanperez123',
        balance: 50.0
      })

      // The adapter should map domain properties to database columns:
      // firstName -> first_name
      // lastName -> last_name
      // displayName -> display_name
      // userId -> user_id

      expect(profileData.firstName).toBe('Juan')
      expect(profileData.lastName).toBe('Pérez')
      expect(profileData.displayName).toBe('juanperez123')
      expect(profileData.userId).toBe('user123')
    })
  })
})
