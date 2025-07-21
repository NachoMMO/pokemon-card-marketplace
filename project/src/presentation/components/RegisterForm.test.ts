import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import RegisterForm from './RegisterForm.vue'
import { useCreateUserAccount } from '@/presentation/composables/useCreateUserAccount'

// Mock the composable
vi.mock('@/presentation/composables/useCreateUserAccount')

// Create test router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/register', name: 'Register', component: { template: '<div>Register</div>' } },
    { path: '/onboarding', name: 'Onboarding', component: { template: '<div>Onboarding</div>' } }
  ]
})

describe('RegisterForm Component', () => {
  let mockCreateUserAccount: any

  // Helper function to set form data directly in component
  const setFormData = (wrapper: any, data: Partial<{
    name: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
  }>) => {
    const componentInstance = wrapper.vm as any
    if (data.name !== undefined) componentInstance.formData.name = data.name
    if (data.email !== undefined) componentInstance.formData.email = data.email
    if (data.password !== undefined) componentInstance.formData.password = data.password
    if (data.confirmPassword !== undefined) componentInstance.formData.confirmPassword = data.confirmPassword
    if (data.acceptTerms !== undefined) componentInstance.formData.acceptTerms = data.acceptTerms
  }

  beforeEach(async () => {
    mockCreateUserAccount = {
      createAccount: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
      success: ref(false),
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

      expect(wrapper.find('[data-testid="name-field"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="email-field"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-field"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="confirm-password-field"]').exists()).toBe(true)
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

      expect(wrapper.find('[data-testid="email-field"]').attributes('type')).toBe('email')
      expect(wrapper.find('[data-testid="password-field"]').attributes('type')).toBe('password')
      expect(wrapper.find('[data-testid="confirm-password-field"]').attributes('type')).toBe('password')

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
      setFormData(wrapper, {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
        acceptTerms: true
      })

      await wrapper.vm.$nextTick()

      // Trigger validation by submitting the form
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Check if email error element exists and has correct text
      const emailError = wrapper.find('[data-testid="email-error"]')
      expect(emailError.exists()).toBe(true)
      expect(emailError.text()).toBe('Invalid email format')

    wrapper.unmount()
  })

    it('should validate password strength', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      // Fill all required fields with valid data EXCEPT the password which will be too short
      setFormData(wrapper, {
        name: 'John Doe',
        email: 'valid@example.com',
        password: 'short',
        confirmPassword: 'short',
        acceptTerms: true
      })

      await wrapper.vm.$nextTick()

      // Trigger validation by submitting the form
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Check if password error element exists and has correct text
      const passwordError = wrapper.find('[data-testid="password-error"]')
      expect(passwordError.exists()).toBe(true)
      expect(passwordError.text()).toBe('Password must be at least 8 characters long')

    wrapper.unmount()
  })

    it('should validate password confirmation', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      // Fill all required fields with valid data EXCEPT confirmation password which will be different
      setFormData(wrapper, {
        name: 'John Doe',
        email: 'valid@example.com',
        password: 'ValidPass123',
        confirmPassword: 'DifferentPass456',
        acceptTerms: true
      })

      await wrapper.vm.$nextTick()

      // Trigger validation by submitting the form
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Check if confirm password error element exists and has correct text
      const confirmPasswordError = wrapper.find('[data-testid="confirm-password-error"]')
      expect(confirmPasswordError.exists()).toBe(true)
      expect(confirmPasswordError.text()).toBe('Passwords do not match')

    wrapper.unmount()
  })

    it('should require terms acceptance', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      setFormData(wrapper, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: false  // Don't accept terms
      })

      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="terms-error"]').text()).toBe('You must accept the terms and conditions')

      wrapper.unmount()
    })
  })

  describe('Form Submission', () => {
    it('should call createAccount with correct data when form is valid', async () => {
      // Set up mock to return successful result
      mockCreateUserAccount.createAccount.mockResolvedValue({ isSuccess: true })

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      setFormData(wrapper, {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'MiPassword123!',
        confirmPassword: 'MiPassword123!',
        acceptTerms: true
      })

      await wrapper.vm.$nextTick()

      // Submit the form
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Allow time for async operation
      await new Promise(resolve => setTimeout(resolve, 10))

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

      await wrapper.find('[data-testid="name-field"]').setValue('') // Invalid
      await wrapper.find('[data-testid="email-field"]').setValue('test@example.com')
      await wrapper.find('[data-testid="password-field"]').setValue('Password123!')
      await wrapper.find('[data-testid="confirm-password-field"]').setValue('Password123!')

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

      expect(wrapper.find('[data-testid="name-field"]').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-testid="email-field"]').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-testid="password-field"]').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-testid="confirm-password-field"]').attributes('disabled')).toBeDefined()

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

    it('should redirect to onboarding page after successful creation', async () => {
      const pushSpy = vi.spyOn(router, 'push')

      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      // Simulate successful account creation by setting success to true
      mockCreateUserAccount.success.value = true
      await wrapper.vm.$nextTick()

      // Wait for the setTimeout delay (2 seconds + buffer)
      await new Promise(resolve => setTimeout(resolve, 2100))

      expect(pushSpy).toHaveBeenCalledWith('/onboarding')

      wrapper.unmount()
    })
  })

  describe('Error State', () => {
    it('should display error message when creation fails', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          plugins: [router]
        }
      })

      // Clear any local error first
      const componentInstance = wrapper.vm as any
      componentInstance.error = null

      // Set service error after mounting and clearing local error
      mockCreateUserAccount.error.value = 'This email is already registered'

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

      // Simulate user input by calling clearFieldError directly (like @input event would do)
      const componentInstance = wrapper.vm as any
      componentInstance.clearFieldError('name')
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

      expect(wrapper.find('[data-testid="name-field"]').attributes('aria-required')).toBe('true')
      expect(wrapper.find('[data-testid="email-field"]').attributes('aria-required')).toBe('true')
      expect(wrapper.find('[data-testid="password-field"]').attributes('aria-required')).toBe('true')

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

      const nameInput = wrapper.find('[data-testid="name-field"]')
      expect(nameInput.attributes('aria-describedby')).toBe('name-error')

      wrapper.unmount()
    })
  })
})
