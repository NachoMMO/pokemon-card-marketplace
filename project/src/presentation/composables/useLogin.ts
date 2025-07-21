import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ILoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import type { LoginDTO } from '../../application/dtos/AuthDTO';
import { container } from '../../infrastructure/di/container';

export function useLogin() {
  const router = useRouter();
  const loginUserUseCase = container.get<ILoginUserUseCase>('LoginUserUseCase');

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loginUser = async (credentials: LoginDTO): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await loginUserUseCase.execute(credentials);

      if (response.error) {
        error.value = response.error;
        return false;
      }

      if (!response.user) {
        error.value = 'Login failed';
        return false;
      }

      // Si el usuario tiene perfil completo, va al dashboard
      // Si no tiene perfil, va al onboarding
      if (response.profile) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
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
    loginUser,
    clearError
  };
}
