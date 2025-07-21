import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ILogoutUserUseCase } from '../../application/use-cases/auth/LogoutUserUseCase';
import { container, DEPENDENCIES } from '../../infrastructure/di/container';

export function useLogout() {
  const router = useRouter();
  const logoutUserUseCase = container.get<ILogoutUserUseCase>(DEPENDENCIES.LOGOUT_USER_USE_CASE);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const logout = async (redirectPath: string = '/'): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await logoutUserUseCase.execute();

      if (!response.success) {
        error.value = response.error;
        return false;
      }

      // Dar tiempo para asegurar que el logout se propaga completamente
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirigir al usuario después del logout exitoso
      router.replace(redirectPath);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    isLoading,
    error,
    logout,
    clearError
  };
}
