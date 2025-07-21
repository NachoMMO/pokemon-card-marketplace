import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useLogin } from './useLogin';
import type { ILoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import type { AuthResponseDTO } from '../../application/dtos/AuthDTO';

// Mock del use case
const mockLoginUserUseCase: ILoginUserUseCase = {
  execute: vi.fn()
};

// Mock del router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock de la dependencia
vi.mock('../../infrastructure/di/container', () => ({
  container: {
    get: vi.fn((token: string) => {
      if (token === 'LoginUserUseCase') {
        return mockLoginUserUseCase;
      }
    })
  }
}));

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { isLoading, error, loginUser } = useLogin();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(null);
    expect(typeof loginUser).toBe('function');
  });

  it('should set loading state during login attempt', async () => {
    const mockResponse: AuthResponseDTO = {
      user: {
        id: '123',
        email: 'test@example.com',
        emailConfirmed: true
      },
      profile: {
        id: 'profile-123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        bio: undefined,
        avatarUrl: undefined,
        location: undefined,
        balance: 0
      },
      error: null
    };

    (mockLoginUserUseCase.execute as any).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    const { isLoading, loginUser } = useLogin();

    const loginPromise = loginUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(isLoading.value).toBe(true);

    await loginPromise;

    expect(isLoading.value).toBe(false);
  });

  it('should handle successful login with profile and redirect to dashboard', async () => {
    const mockResponse: AuthResponseDTO = {
      user: {
        id: '123',
        email: 'test@example.com',
        emailConfirmed: true
      },
      profile: {
        id: 'profile-123',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        bio: undefined,
        avatarUrl: undefined,
        location: undefined,
        balance: 0
      },
      error: null
    };

    (mockLoginUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { error, loginUser } = useLogin();

    const result = await loginUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(error.value).toBe(null);
    expect(result).toBe(true);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle successful login without profile and redirect to onboarding', async () => {
    const mockResponse: AuthResponseDTO = {
      user: {
        id: '123',
        email: 'test@example.com',
        emailConfirmed: true
      },
      profile: null,
      error: null
    };

    (mockLoginUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { error, loginUser } = useLogin();

    const result = await loginUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(error.value).toBe(null);
    expect(result).toBe(true);
    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  it('should handle email confirmation required', async () => {
    const mockResponse: AuthResponseDTO = {
      user: {
        id: '123',
        email: 'test@example.com',
        emailConfirmed: false
      },
      profile: null,
      error: 'Debes confirmar tu email antes de continuar',
      requiresEmailConfirmation: true
    };

    (mockLoginUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { error, loginUser } = useLogin();

    const result = await loginUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(error.value).toBe('Debes confirmar tu email antes de continuar');
    expect(result).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle login errors', async () => {
    const mockResponse: AuthResponseDTO = {
      user: null,
      profile: null,
      error: 'Invalid email or password'
    };

    (mockLoginUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { error, loginUser } = useLogin();

    const result = await loginUser({
      email: 'wrong@example.com',
      password: 'wrongpass'
    });

    expect(error.value).toBe('Invalid email or password');
    expect(result).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle use case exceptions', async () => {
    (mockLoginUserUseCase.execute as any).mockRejectedValue(new Error('Network error'));

    const { error, loginUser } = useLogin();

    const result = await loginUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(error.value).toBe('Network error');
    expect(result).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should clear error when clearing errors', () => {
    const { error, clearError } = useLogin();

    error.value = 'Some error';
    clearError();

    expect(error.value).toBe(null);
  });

  it('should reset loading state on error', async () => {
    (mockLoginUserUseCase.execute as any).mockRejectedValue(new Error('Test error'));

    const { isLoading, loginUser } = useLogin();

    await loginUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(isLoading.value).toBe(false);
  });

  it('should call use case with correct parameters', async () => {
    const mockResponse: AuthResponseDTO = {
      user: {
        id: '123',
        email: 'test@example.com',
        emailConfirmed: true
      },
      profile: null,
      error: null
    };

    (mockLoginUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { loginUser } = useLogin();

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await loginUser(credentials);

    expect(mockLoginUserUseCase.execute).toHaveBeenCalledWith(credentials);
  });
});
