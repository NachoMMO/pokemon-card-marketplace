import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseUserRepository } from '../../../../../infrastructure/driven/repositories/SupabaseUserRepository';
import { User } from '../../../../../domain/entities/User';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    admin: {
      getUserById: vi.fn()
    },
    getUser: vi.fn(),
    onAuthStateChange: vi.fn()
  }
};

// Helper function to create mock user data
function createMockUserData() {
  return {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  };
}

describe('SupabaseUserRepository', () => {
  let repository: SupabaseUserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseUserRepository(mockSupabaseClient as any);
  });

  describe('findById', () => {
    it('should find user by ID successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUserData = createMockUserData();

      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: mockUserData,
        error: null
      });

      // Act
      const result = await repository.findById(userId);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-123');
      expect(result?.email).toBe('test@example.com');
      expect(result?.emailConfirmed).toBe(true);
      expect(mockSupabaseClient.auth.admin.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'nonexistent';

      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
        error: null
      });

      // Act
      const result = await repository.findById(userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when database error occurs', async () => {
      // Arrange
      const userId = 'user-123';

      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      // Act
      const result = await repository.findById(userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle unconfirmed email', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUserData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          email_confirmed_at: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      };

      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: mockUserData,
        error: null
      });

      // Act
      const result = await repository.findById(userId);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.emailConfirmed).toBe(false);
    });
  });

  describe('findByEmail', () => {
    it('should return null as method is not available in Supabase', async () => {
      // Arrange
      const email = 'test@example.com';

      // Act
      const result = await repository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      // Arrange
      const mockUserData = createMockUserData();

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: mockUserData,
        error: null
      });

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-123');
      expect(result?.email).toBe('test@example.com');
      expect(result?.emailConfirmed).toBe(true);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should return null when no current user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when auth error occurs', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: null,
        error: new Error('Auth error')
      });

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle user without email', async () => {
      // Arrange
      const mockUserData = {
        user: {
          id: 'user-123',
          email: null,
          email_confirmed_at: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: mockUserData,
        error: null
      });

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('');
      expect(result?.emailConfirmed).toBe(false);
    });
  });

  describe('onAuthStateChange', () => {
    it('should call callback with user when session exists', () => {
      // Arrange
      const callback = vi.fn();
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          email_confirmed_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      };

      // Setup onAuthStateChange to immediately call the callback
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((authCallback) => {
        authCallback('SIGNED_IN', mockSession);
      });

      // Act
      repository.onAuthStateChange(callback);

      // Assert
      expect(callback).toHaveBeenCalledWith(expect.any(User));
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should call callback with null when no session', () => {
      // Arrange
      const callback = vi.fn();

      // Setup onAuthStateChange to immediately call the callback with null session
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((authCallback) => {
        authCallback('SIGNED_OUT', null);
      });

      // Act
      repository.onAuthStateChange(callback);

      // Assert
      expect(callback).toHaveBeenCalledWith(null);
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});
