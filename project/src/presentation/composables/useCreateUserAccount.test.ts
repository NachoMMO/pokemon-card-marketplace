import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useCreateUserAccount } from './useCreateUserAccount'

// Mock the DI container
const mockCreateUserAccountUseCase = {
  execute: vi.fn()
}

vi.mock('@/infrastructure/di/container', () => ({
  container: {
    get: vi.fn(() => mockCreateUserAccountUseCase)
  },
  DEPENDENCIES: {
    CREATE_USER_ACCOUNT_USE_CASE: 'CREATE_USER_ACCOUNT_USE_CASE'
  }
}))

// Mock CreateUserAccountRequest
vi.mock('@/application/dtos/CreateUserAccountRequest', () => ({
  CreateUserAccountRequest: vi.fn().mockImplementation((name, email, password, confirmPassword) => ({
    name,
    email,
    password,
    confirmPassword
  }))
}))

describe('useCreateUserAccount Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default values', () => {
    const { isLoading, error, success } = useCreateUserAccount()

    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(success.value).toBe(false)
  })

  it('should handle successful account creation', async () => {
    const mockResult = {
      isSuccess: true,
      data: {
        user: { id: '123', email: 'juan.perez@example.com' },
        profile: { name: 'Juan Pérez' }
      }
    }

    mockCreateUserAccountUseCase.execute.mockResolvedValue(mockResult)

    const { createAccount, isLoading, error, success } = useCreateUserAccount()

    const accountData = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'MiPassword123!',
      confirmPassword: 'MiPassword123!'
    }

    const result = await createAccount(accountData)

    expect(mockCreateUserAccountUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'MiPassword123!',
        confirmPassword: 'MiPassword123!'
      })
    )
    expect(result.isSuccess).toBe(true)
    expect(success.value).toBe(true)
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('should handle account creation errors', async () => {
    const mockResult = {
      isSuccess: false,
      error: 'This email is already registered'
    }

    mockCreateUserAccountUseCase.execute.mockResolvedValue(mockResult)

    const { createAccount, error, success } = useCreateUserAccount()

    const accountData = {
      name: 'Juan Pérez',
      email: 'existing@example.com',
      password: 'MiPassword123!',
      confirmPassword: 'MiPassword123!'
    }

    const result = await createAccount(accountData)

    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe('This email is already registered')
    expect(error.value).toBe('This email is already registered')
    expect(success.value).toBe(false)
  })

  it('should handle unexpected exceptions', async () => {
    mockCreateUserAccountUseCase.execute.mockRejectedValue(new Error('Network error'))

    const { createAccount, error, success } = useCreateUserAccount()

    const accountData = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'MiPassword123!',
      confirmPassword: 'MiPassword123!'
    }

    const result = await createAccount(accountData)

    expect(result.isSuccess).toBe(false)
    expect(result.error).toBe('Network error')
    expect(error.value).toBe('Network error')
    expect(success.value).toBe(false)
  })

  it('should set loading state during execution', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })

    mockCreateUserAccountUseCase.execute.mockReturnValue(promise)

    const { createAccount, isLoading } = useCreateUserAccount()

    const accountData = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'MiPassword123!',
      confirmPassword: 'MiPassword123!'
    }

    // Start the creation process
    const resultPromise = createAccount(accountData)

    // Should be loading
    await nextTick()
    expect(isLoading.value).toBe(true)

    // Complete the process
    resolvePromise!({ isSuccess: true, data: {} })
    await resultPromise

    // Should no longer be loading
    expect(isLoading.value).toBe(false)
  })

  it('should clear error when clearError is called', async () => {
    const mockResult = {
      isSuccess: false,
      error: 'Some error'
    }

    mockCreateUserAccountUseCase.execute.mockResolvedValue(mockResult)

    const { createAccount, error, clearError } = useCreateUserAccount()

    await createAccount({
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password'
    })

    expect(error.value).toBe('Some error')

    clearError()
    expect(error.value).toBeNull()
  })
})
