import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'

// Mock the useResetPassword composable
const mockResetPassword = vi.fn()
const mockClearError = vi.fn()

// Create reactive refs for testing
const mockIsLoading = ref(false)
const mockError = ref<string | null>(null)
const mockIsPasswordReset = ref(false)

// Mock the composable module
vi.mock('../composables/useResetPassword', () => ({
  useResetPassword: () => ({
    isLoading: mockIsLoading,
    error: mockError,
    isPasswordReset: mockIsPasswordReset,
    resetPassword: mockResetPassword,
    clearError: mockClearError
  })
}))

// Mock the DI container
vi.mock('../../infrastructure/di/container', () => ({
  container: {
    get: vi.fn(() => ({
      setSessionFromRecoveryToken: vi.fn().mockResolvedValue(true)
    }))
  },
  DEPENDENCIES: {
    SUPABASE_AUTH_SERVICE: 'SUPABASE_AUTH_SERVICE'
  }
}))

// Import the component after mocks are defined
import ResetPasswordView from './ResetPasswordView.vue'

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hash: '',
    href: 'http://localhost:5173/reset-password'
  },
  writable: true
})

const routes = [
  { path: '/reset-password', component: ResetPasswordView },
  { path: '/login', component: { template: '<div>Login</div>' } },
  { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

describe('ResetPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset reactive state
    mockIsLoading.value = false
    mockError.value = null
    mockIsPasswordReset.value = false

    // Clear location hash
    window.location.hash = ''
  })

  it('should render reset password form', async () => {
    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('h2').text()).toBe('Reset Password')
    expect(wrapper.find('#newPassword').exists()).toBe(true)
    expect(wrapper.find('#confirmPassword').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should validate password matching', async () => {
    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    // Set passwords that don't match
    const newPasswordInput = wrapper.find('#newPassword')
    const confirmPasswordInput = wrapper.find('#confirmPassword')

    await newPasswordInput.setValue('password123')
    await confirmPasswordInput.setValue('different456')
    await wrapper.vm.$nextTick()

    // Check if password mismatch message appears
    const mismatchMessage = wrapper.find('.field-error')
    expect(mismatchMessage.exists()).toBe(true)
    expect(mismatchMessage.text()).toBe('Passwords do not match')
  })

  it('should validate password length', async () => {
    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    const newPasswordInput = wrapper.find('#newPassword')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const submitButton = wrapper.find('button[type="submit"]')

    await newPasswordInput.setValue('short')
    await confirmPasswordInput.setValue('short')

    await wrapper.vm.$nextTick()

    // Button should be disabled for short passwords
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should call resetPassword on form submission with valid data', async () => {
    // Mock with recovery token in hash
    window.location.hash = '#access_token=token123&refresh_token=refresh123&type=recovery'

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    const newPasswordInput = wrapper.find('#newPassword')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const form = wrapper.find('form')

    await newPasswordInput.setValue('validPassword123')
    await confirmPasswordInput.setValue('validPassword123')

    await wrapper.vm.$nextTick()

    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(mockResetPassword).toHaveBeenCalledWith('validPassword123', 'validPassword123')
  })

  it('should show error message when present', async () => {
    mockError.value = 'Something went wrong'

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    const errorMessage = wrapper.find('.error-message')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('Something went wrong')
  })

  it('should show success message when password is reset', async () => {
    mockIsPasswordReset.value = true

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    const successMessage = wrapper.find('.success-message')
    expect(successMessage.exists()).toBe(true)
    expect(successMessage.text()).toBe('Password has been reset successfully! Redirecting to login...')
  })

  it('should clear errors when user starts typing', async () => {
    // Set initial error state
    mockError.value = 'Some error'

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    // Simulate typing in password field
    const newPasswordInput = wrapper.find('#newPassword')
    await newPasswordInput.setValue('newpassword')
    await wrapper.vm.$nextTick()

    // The clearError should be called when user types and there's an error
    expect(mockClearError).toHaveBeenCalled()
  })

  it('should show loading state during password reset', async () => {
    mockIsLoading.value = true

    const wrapper = mount(ResetPasswordView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Resetting...')
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})
