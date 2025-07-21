import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useLogout } from './useLogout';
import type { ILogoutUserUseCase } from '../../application/use-cases/auth/LogoutUserUseCase';
import type { LogoutResponseDTO } from '../../application/use-cases/auth/LogoutUserUseCase';

// Mock del use case
const mockLogoutUserUseCase: ILogoutUserUseCase = {
  execute: vi.fn()
};

// Mock del router
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  })
}));

// Mock de la dependencia
vi.mock('../../infrastructure/di/container', () => ({
  container: {
    get: vi.fn((token: string) => {
      if (token === 'LogoutUserUseCase') {
        return mockLogoutUserUseCase;
      }
    })
  },
  DEPENDENCIES: {
    LOGOUT_USER_USE_CASE: 'LogoutUserUseCase'
  }
}));

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { isLoading, error, logout } = useLogout();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(null);
    expect(typeof logout).toBe('function');
  });

  it('should set loading state during logout', async () => {
    const mockResponse: LogoutResponseDTO = {
      success: true,
      error: null
    };

    (mockLogoutUserUseCase.execute as any).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    const { isLoading, logout } = useLogout();

    const logoutPromise = logout();

    expect(isLoading.value).toBe(true);

    await logoutPromise;

    expect(isLoading.value).toBe(false);
  });

  it('should handle successful logout and redirect to home', async () => {
    const mockResponse: LogoutResponseDTO = {
      success: true,
      error: null
    };

    (mockLogoutUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { error, logout } = useLogout();

    const result = await logout();

    expect(error.value).toBe(null);
    expect(result).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('should handle logout error', async () => {
    const mockResponse: LogoutResponseDTO = {
      success: false,
      error: 'Error al cerrar sesión'
    };

    (mockLogoutUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { error, logout } = useLogout();

    const result = await logout();

    expect(error.value).toBe('Error al cerrar sesión');
    expect(result).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should handle use case exceptions', async () => {
    (mockLogoutUserUseCase.execute as any).mockRejectedValue(new Error('Network error'));

    const { error, logout } = useLogout();

    const result = await logout();

    expect(error.value).toBe('Network error');
    expect(result).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should clear error when clearing errors', () => {
    const { error, clearError } = useLogout();

    error.value = 'Some error';
    clearError();

    expect(error.value).toBe(null);
  });

  it('should reset loading state on error', async () => {
    (mockLogoutUserUseCase.execute as any).mockRejectedValue(new Error('Test error'));

    const { isLoading, logout } = useLogout();

    await logout();

    expect(isLoading.value).toBe(false);
  });

  it('should call use case execute method', async () => {
    const mockResponse: LogoutResponseDTO = {
      success: true,
      error: null
    };

    (mockLogoutUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { logout } = useLogout();

    await logout();

    expect(mockLogoutUserUseCase.execute).toHaveBeenCalledOnce();
  });

  it('should allow custom redirect path', async () => {
    const mockResponse: LogoutResponseDTO = {
      success: true,
      error: null
    };

    (mockLogoutUserUseCase.execute as any).mockResolvedValue(mockResponse);

    const { logout } = useLogout();

    await logout('/login');

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
