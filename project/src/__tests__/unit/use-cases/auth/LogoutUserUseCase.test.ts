import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogoutUserUseCase } from '../../../../application/use-cases/auth/LogoutUserUseCase';
import type { ISupabaseAuthService } from '../../../../application/ports/services/ISupabaseAuthService';

// Mock del servicio de autenticación
const mockAuthService: ISupabaseAuthService = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  onAuthStateChange: vi.fn(),
  getAccessToken: vi.fn()
};

describe('LogoutUserUseCase', () => {
  let logoutUserUseCase: LogoutUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    logoutUserUseCase = new LogoutUserUseCase(mockAuthService);
  });

  it('should successfully logout user', async () => {
    // Given: Mock successful signOut
    (mockAuthService.signOut as any).mockResolvedValue(true);

    // When: Execute logout
    const result = await logoutUserUseCase.execute();

    // Then: Should return success
    expect(result.success).toBe(true);
    expect(result.error).toBe(null);
    expect(mockAuthService.signOut).toHaveBeenCalledOnce();
  });

  it('should handle auth service logout failure', async () => {
    // Given: Mock failed signOut
    (mockAuthService.signOut as any).mockResolvedValue(false);

    // When: Execute logout
    const result = await logoutUserUseCase.execute();

    // Then: Should return error
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al cerrar sesión');
    expect(mockAuthService.signOut).toHaveBeenCalledOnce();
  });

  it('should handle auth service exceptions', async () => {
    // Given: Mock signOut throwing exception
    (mockAuthService.signOut as any).mockRejectedValue(new Error('Network error'));

    // When: Execute logout
    const result = await logoutUserUseCase.execute();

    // Then: Should return error
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
    expect(mockAuthService.signOut).toHaveBeenCalledOnce();
  });

  it('should handle unknown errors gracefully', async () => {
    // Given: Mock signOut throwing non-Error object
    (mockAuthService.signOut as any).mockRejectedValue('Unknown error');

    // When: Execute logout
    const result = await logoutUserUseCase.execute();

    // Then: Should return generic error message
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error desconocido al cerrar sesión');
    expect(mockAuthService.signOut).toHaveBeenCalledOnce();
  });
});
