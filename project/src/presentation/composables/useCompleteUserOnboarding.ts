import { ref } from 'vue'
import { container, DEPENDENCIES } from '@/infrastructure/di/container'
import type { CompleteUserOnboardingUseCase, CompleteUserOnboardingRequest, CompleteUserOnboardingResponse } from '@/application/use-cases/CompleteUserOnboardingUseCase'

export function useCompleteUserOnboarding() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const completeUserOnboardingUseCase = container.get<CompleteUserOnboardingUseCase>(DEPENDENCIES.COMPLETE_USER_ONBOARDING_USE_CASE)

  const completeOnboarding = async (
    request: CompleteUserOnboardingRequest
  ): Promise<CompleteUserOnboardingResponse> => {
    try {
      isLoading.value = true
      error.value = null

      const result = await completeUserOnboardingUseCase.execute(request)

      if (!result.isSuccess) {
        error.value = result.error || 'Failed to complete onboarding'
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      error.value = errorMessage

      return {
        isSuccess: false,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    completeOnboarding,
    isLoading,
    error,
    clearError
  }
}
