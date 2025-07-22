import { ref, computed } from 'vue'
import { CreateUserAccountUseCase } from '../../application/use-cases/CreateUserAccountUseCase'
import { CreateUserAccountRequest } from '../../application/dtos/CreateUserAccountRequest'
import { container, DEPENDENCIES } from '../../infrastructure/di/container'

export interface CreateAccountData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function useCreateUserAccount() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  // Get the use case from DI container
  const createUserAccountUseCase = container.get<CreateUserAccountUseCase>(
    DEPENDENCIES.CREATE_USER_ACCOUNT_USE_CASE
  )

  const createAccount = async (data: CreateAccountData) => {
    try {
      isLoading.value = true
      error.value = null
      success.value = false

      const request = new CreateUserAccountRequest(
        data.name,
        data.email,
        data.password,
        data.confirmPassword
      )

      const result = await createUserAccountUseCase.execute(request)

      if (result.isSuccess) {
        success.value = true
        return { isSuccess: true, data: result.data }
      } else {
        error.value = result.error || 'Unknown error occurred'
        return { isSuccess: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      return { isSuccess: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    isLoading.value = false
    error.value = null
    success.value = false
  }

  return {
    createAccount,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    success: computed(() => success.value),
    clearError,
    reset
  }
}
