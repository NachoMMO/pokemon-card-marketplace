import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import RegisterForm from './RegisterForm.vue'
import { useCreateUserAccount } from '@/presentation/composables/useCreateUserAccount'

// Mock the composable
vi.mock('@/presentation/composables/useCreateUserAccount')

// Create test router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/register', name: 'Register', component: { template: '<div>Register</div>' } },
    { path: '/welcome', name: 'Welcome', component: { template: '<div>Welcome</div>' } }
  ]
})

describe('RegisterForm Component', () => {
  let mockCreateUserAccount: any

  beforeEach(async () => {
    mockCreateUserAccount = {
      createAccount: vi.fn(),
      isLoading: { value: false },
      error: { value: null },
      success: { value: false },
      clearError: vi.fn()
    }

    vi.mocked(useCreateUserAccount).mockReturnValue(mockCreateUserAccount)

    await router.push('/register')
    await router.isReady()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('[data-testid="name-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="confirm-password-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="terms-checkbox"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="create-account-button"]').exists()).toBe(true)

      wrapper.unmount()
    })

    it('should display form title', () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('h1').text()).toBe('Create Account')

      wrapper.unmount()
    })

    it('should have proper input types', () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('[data-testid="email-input"]').attributes('type')).toBe('email')
      expect(wrapper.find('[data-testid="password-input"]').attributes('type')).toBe('password')
      expect(wrapper.find('[data-testid="confirm-password-input"]').attributes('type')).toBe('password')

      wrapper.unmount()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      // Submit form - this should trigger client-side validation
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Check if error elements exist and have content
      const nameError = wrapper.find('[data-testid="name-error"]')
      const emailError = wrapper.find('[data-testid="email-error"]')
      const passwordError = wrapper.find('[data-testid="password-error"]')
      const termsError = wrapper.find('[data-testid="terms-error"]')

      expect(nameError.exists()).toBe(true)
      expect(nameError.text()).toBe('Name is required')
      expect(emailError.exists()).toBe(true)
      expect(emailError.text()).toBe('Email is required')
      expect(passwordError.exists()).toBe(true)
      expect(passwordError.text()).toBe('Password is required')
      expect(termsError.exists()).toBe(true)
      expect(termsError.text()).toBe('You must accept the terms and conditions')

      wrapper.unmount()
    })

    it('should validate email format', async () => {
    const wrapper = mount(RegisterForm, {
      global: {
        plugins: [router]
      }
    })

    // Fill all required fields with valid data EXCEPT the email which will be invalid
    await wrapper.find('[data-testid="name-input"]').setValue('John Doe')
    await wrapper.find('[data-testid="email-input"]').setValue('invalid-email')
    await wrapper.find('[data-testid="password-input"]').setValue('ValidPass123')
    await wrapper.find('[data-testid="confirm-password-input"]').setValue('ValidPass123')
    await wrapper.find('[data-testid="terms-checkbox"]').setValue(true)

    await wrapper.vm.$nextTick()

    // Trigger validation
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Should show email format error, not required error
    expect(wrapper.find('[data-testid="email-error"]').text()).toBe('Invalid email format')

    wrapper.unmount()
  })

    it('should validate password strength', async () => {
    const wrapper = mount(RegisterForm, {
      global: {
        plugins: [router]
      }
    })

    // Fill all required fields with valid data EXCEPT the password which will be too short
    await wrapper.find('[data-testid="name-input"]').setValue('John Doe')
    await wrapper.find('[data-testid="email-input"]').setValue('valid@example.com')
    await wrapper.find('[data-testid="password-input"]').setValue('short')
    await wrapper.find('[data-testid="confirm-password-input"]').setValue('short')
    await wrapper.find('[data-testid="terms-checkbox"]').setValue(true)

    await wrapper.vm.$nextTick()

    // Trigger validation
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Should show password strength error, not required error
    expect(wrapper.find('[data-testid="password-error"]').text()).toBe('Password must be at least 8 characters long')

    wrapper.unmount()
  })

  it('should validate password confirmation', async () => {
    const wrapper = mount(RegisterForm, {
      global: {
        plugins: [router]
      }
    })

    // Fill all required fields with valid data EXCEPT confirmation password which will be different
    await wrapper.find('[data-testid="name-input"]').setValue('John Doe')
    await wrapper.find('[data-testid="email-input"]').setValue('valid@example.com')
    await wrapper.find('[data-testid="password-input"]').setValue('ValidPass123')
    await wrapper.find('[data-testid="confirm-password-input"]').setValue('DifferentPass456')
    await wrapper.find('[data-testid="terms-checkbox"]').setValue(true)

    await wrapper.vm.$nextTick()

    // Trigger validation
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Should show password confirmation error
    expect(wrapper.find('[data-testid="confirm-password-error"]').text()).toBe('Passwords do not match')

    wrapper.unmount()
  })

  it('should require terms acceptance', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.find('[data-testid="name-input"]').setValue('Test User')
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com')
      await wrapper.find('[data-testid="password-input"]').setValue('Password123!')
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('Password123!')
      // Don't check terms

      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="terms-error"]').text()).toBe('You must accept the terms and conditions')

      wrapper.unmount()
    })
  })

  describe('Form Submission', () => {
    it('should call createAccount with correct data when form is valid', async () => {
      mockCreateUserAccount.createAccount.mockResolvedValue({ isSuccess: true })

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.find('[data-testid="name-input"]').setValue('Juan Pérez')
      await wrapper.find('[data-testid="email-input"]').setValue('juan.perez@example.com')
      await wrapper.find('[data-testid="password-input"]').setValue('MiPassword123!')
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('MiPassword123!')
      await wrapper.find('[data-testid="terms-checkbox"]').setValue(true)

      await wrapper.find('form').trigger('submit')

      expect(mockCreateUserAccount.createAccount).toHaveBeenCalledWith({
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'MiPassword123!',
        confirmPassword: 'MiPassword123!'
      })

      wrapper.unmount()
    })

    it('should not submit form when validation fails', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.find('[data-testid="name-input"]').setValue('') // Invalid
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com')
      await wrapper.find('[data-testid="password-input"]').setValue('Password123!')
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('Password123!')

      await wrapper.find('form').trigger('submit')

      expect(mockCreateUserAccount.createAccount).not.toHaveBeenCalled()

      wrapper.unmount()
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when creating account', async () => {
      mockCreateUserAccount.isLoading.value = true

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="create-account-button"]').attributes('disabled')).toBeDefined()

      wrapper.unmount()
    })

    it('should disable form fields during loading', async () => {
      mockCreateUserAccount.isLoading.value = true

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="name-input"]').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-testid="email-input"]').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-testid="password-input"]').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-testid="confirm-password-input"]').attributes('disabled')).toBeDefined()

      wrapper.unmount()
    })
  })

  describe('Success State', () => {
    it('should show success message when account is created', async () => {
      mockCreateUserAccount.success.value = true

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="success-message"]').text()).toContain('Account created successfully')

      wrapper.unmount()
    })

    it('should redirect to welcome page after successful creation', async () => {
      const pushSpy = vi.spyOn(router, 'push')
      mockCreateUserAccount.success.value = true

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.vm.$nextTick()

      // Wait for the setTimeout delay (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2100))

      expect(pushSpy).toHaveBeenCalledWith('/welcome')

      wrapper.unmount()
    })
  })

  describe('Error State', () => {
    it('should display error message when creation fails', async () => {
      mockCreateUserAccount.error.value = 'This email is already registered'

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="error-message"]').text()).toContain('This email is already registered')

      wrapper.unmount()
    })

    it('should clear error when user starts typing', async () => {
      mockCreateUserAccount.error.value = 'Some error'

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)

      await wrapper.find('[data-testid="name-input"]').setValue('New Name')
      await wrapper.vm.$nextTick()

      expect(mockCreateUserAccount.clearError).toHaveBeenCalled()

      wrapper.unmount()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('label[for="name"]').exists()).toBe(true)
      expect(wrapper.find('label[for="email"]').exists()).toBe(true)
      expect(wrapper.find('label[for="password"]').exists()).toBe(true)
      expect(wrapper.find('label[for="confirmPassword"]').exists()).toBe(true)

      wrapper.unmount()
    })

    it('should have proper ARIA attributes', () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('[data-testid="name-input"]').attributes('aria-required')).toBe('true')
      expect(wrapper.find('[data-testid="email-input"]').attributes('aria-required')).toBe('true')
      expect(wrapper.find('[data-testid="password-input"]').attributes('aria-required')).toBe('true')

      wrapper.unmount()
    })

    it('should associate error messages with form fields', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      const nameInput = wrapper.find('[data-testid="name-input"]')
      expect(nameInput.attributes('aria-describedby')).toBe('name-error')

      wrapper.unmount()
    })
  })
})
