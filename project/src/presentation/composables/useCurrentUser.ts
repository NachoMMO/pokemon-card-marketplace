import { ref, computed } from 'vue'
import { container, DEPENDENCIES } from '@/infrastructure/di/container'
import type { GetCurrentUserUseCase } from '@/application/use-cases/auth/GetCurrentUserUseCase'
import type { AuthResponseDTO } from '@/application/dtos/AuthDTO'

export function useCurrentUser() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authData = ref<AuthResponseDTO | null>(null)

  const getCurrentUserUseCase = container.get<GetCurrentUserUseCase>(DEPENDENCIES.GET_CURRENT_USER_USE_CASE)

  const getCurrentUser = async () => {
    try {
      isLoading.value = true
      error.value = null

      const result = await getCurrentUserUseCase.execute()
      authData.value = result

      if (result.error) {
        error.value = result.error
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current user'
      error.value = errorMessage
      authData.value = {
        user: null,
        profile: null,
        error: errorMessage
      }
      return authData.value
    } finally {
      isLoading.value = false
    }
  }

  const user = computed(() => authData.value?.user || null)
  const profile = computed(() => authData.value?.profile || null)
  const isAuthenticated = computed(() => !!authData.value?.user && !authData.value?.error)

  const clearError = () => {
    error.value = null
  }

  const logout = () => {
    authData.value = null
    error.value = null
  }

  return {
    getCurrentUser,
    user: computed(() => ({
      ...authData.value?.user,
      profile: authData.value?.profile
    })),
    profile,
    isLoading,
    error,
    isAuthenticated,
    clearError,
    logout
  }
}
