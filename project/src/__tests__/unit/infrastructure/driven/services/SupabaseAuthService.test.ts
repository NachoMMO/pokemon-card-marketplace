import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseAuthService } from '../../../../../infrastructure/driven/services/SupabaseAuthService';
import { User } from '../../../../../domain/entities/User';

// Mock window object for Node.js environment
Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://localhost:3000'
    }
  },
  writable: true
});

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn()
  }
};

// Helper function to create mock user data
function createMockSupabaseUser() {
  return {
    id: 'user-123',
    email: 'test@example.com',
    email_confirmed_at: '2023-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
}

// Helper function to create mock session data
function createMockSession() {
  return {
    access_token: 'mock-access-token',
    user: createMockSupabaseUser()
  };
}

describe('SupabaseAuthService', () => {
  let service: SupabaseAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabaseAuthService(mockSupabaseClient as any);
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockUser = createMockSupabaseUser();

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.signUp(credentials);

      // Assert
      expect(result.user).toBeInstanceOf(User);
      expect(result.user?.email).toBe('test@example.com');
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password
      });
    });

    it('should handle sign up error', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email' }
      });

      // Act
      const result = await service.signUp(credentials);

      // Assert
      expect(result.user).toBeNull();
      expect(result.error).toBe('Email inválido');
    });

    it('should handle sign up with no user returned', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: null
      });

      // Act
      const result = await service.signUp(credentials);

      // Assert
      expect(result.user).toBeNull();
      expect(result.error).toBe('Error al crear la cuenta');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockSupabaseClient.auth.signUp.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.signUp(credentials);

      // Assert
      expect(result.user).toBeNull();
      expect(result.error).toBe('Network error');
    });

    it('should handle user with unconfirmed email', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockUser = {
        ...createMockSupabaseUser(),
        email_confirmed_at: null
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.signUp(credentials);

      // Assert
      expect(result.user).toBeInstanceOf(User);
      expect(result.user?.emailConfirmed).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockUser = createMockSupabaseUser();

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.signIn(credentials);

      // Assert
      expect(result.user).toBeInstanceOf(User);
      expect(result.user?.email).toBe('test@example.com');
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password
      });
    });

    it('should handle sign in error', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      });

      // Act
      const result = await service.signIn(credentials);

      // Assert
      expect(result.user).toBeNull();
      expect(result.error).toBe('Credenciales de inicio de sesión inválidas');
    });

    it('should handle sign in with no user returned', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: null
      });

      // Act
      const result = await service.signIn(credentials);

      // Assert
      expect(result.user).toBeNull();
      expect(result.error).toBe('Error al iniciar sesión');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.signIn(credentials);

      // Assert
      expect(result.user).toBeNull();
      expect(result.error).toBe('Network error');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      // Act
      const result = await service.signOut();

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: new Error('Sign out failed') });

      // Act
      const result = await service.signOut();

      // Assert
      expect(result).toBe(false);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.signOut();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      // Arrange
      const mockUser = createMockSupabaseUser();

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Act
      const result = await service.getCurrentUser();

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@example.com');
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should return null when no current user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      // Act
      const result = await service.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error')
      });

      // Act
      const result = await service.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      // Act
      const result = await service.resetPassword(email);

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
    });

    it('should handle reset password error', async () => {
      // Arrange
      const email = 'test@example.com';
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: new Error('Email not found')
      });

      // Act
      const result = await service.resetPassword(email);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const email = 'test@example.com';
      mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.resetPassword(email);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      // Arrange
      const newPassword = 'newpassword123';
      mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null });

      // Act
      const result = await service.updatePassword(newPassword);

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword
      });
    });

    it('should handle update password error', async () => {
      // Arrange
      const newPassword = 'newpassword123';
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: new Error('Password too weak')
      });

      // Act
      const result = await service.updatePassword(newPassword);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const newPassword = 'newpassword123';
      mockSupabaseClient.auth.updateUser.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.updatePassword(newPassword);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should get access token successfully', async () => {
      // Arrange
      const mockSession = createMockSession();

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      // Act
      const result = await service.getAccessToken();

      // Assert
      expect(result).toBe('mock-access-token');
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
    });

    it('should return null when no session', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      // Act
      const result = await service.getAccessToken();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session error')
      });

      // Act
      const result = await service.getAccessToken();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getAccessToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should call callback with user when session exists', () => {
      // Arrange
      const callback = vi.fn();
      const mockSession = createMockSession();

      // Setup onAuthStateChange to immediately call the callback
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((authCallback) => {
        authCallback('SIGNED_IN', mockSession);
      });

      // Act
      service.onAuthStateChange(callback);

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
      service.onAuthStateChange(callback);

      // Assert
      expect(callback).toHaveBeenCalledWith(null);
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  describe('translateAuthError', () => {
    it('should translate known error messages', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Test different error translations
      const errorTests = [
        {
          original: 'Invalid login credentials',
          expected: 'Credenciales de inicio de sesión inválidas'
        },
        {
          original: 'Email not confirmed',
          expected: 'Email no confirmado'
        },
        {
          original: 'Password should be at least 6 characters',
          expected: 'La contraseña debe tener al menos 6 caracteres'
        }
      ];

      for (const errorTest of errorTests) {
        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: null },
          error: { message: errorTest.original }
        });

        // Act
        const result = await service.signIn(credentials);

        // Assert
        expect(result.error).toBe(errorTest.expected);
      }
    });

    it('should return original error for unknown messages', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unknown error message' }
      });

      // Act
      const result = await service.signIn(credentials);

      // Assert
      expect(result.error).toBe('Unknown error message');
    });
  });
});
