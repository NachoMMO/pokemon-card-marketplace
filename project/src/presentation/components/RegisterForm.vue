<template>
  <div class="register-form-container">
    <div class="register-form-card">
      <h1 class="register-title">Create Account</h1>

      <!-- Success Message -->
      <div
        v-if="success"
        data-testid="success-message"
        class="success-message"
      >
        Account created successfully
        <div data-testid="email-confirmation-notice" class="email-notice">
          A confirmation email has been sent to {{ formData.email }}
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="error || serviceError"
        data-testid="error-message"
        class="error-message"
      >
        {{ error || (typeof serviceError === 'string' ? serviceError : 'An error occurred') }}
      </div>

      <form @submit.prevent="handleSubmit" class="register-form">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name" class="form-label">Full Name</label>
          <input
            id="name"
            v-model="formData.name"
            data-testid="name-input"
            type="text"
            class="form-input"
            :class="{ 'error': validationErrors.name }"
            :disabled="isLoading"
            aria-required="true"
            :aria-describedby="validationErrors.name ? 'name-error' : undefined"
            @input="clearFieldError('name')"
            placeholder="Enter your full name"
          />
          <div
            v-if="validationErrors.name"
            id="name-error"
            data-testid="name-error"
            class="field-error"
          >
            {{ validationErrors.name }}
          </div>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="formData.email"
            data-testid="email-input"
            type="email"
            class="form-input"
            :class="{ 'error': validationErrors.email }"
            :disabled="isLoading"
            aria-required="true"
            :aria-describedby="validationErrors.email ? 'email-error' : undefined"
            @input="clearFieldError('email')"
            placeholder="Enter your email address"
          />
          <div
            v-if="validationErrors.email"
            id="email-error"
            data-testid="email-error"
            class="field-error"
          >
            {{ validationErrors.email }}
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="formData.password"
            data-testid="password-input"
            type="password"
            class="form-input"
            :class="{ 'error': validationErrors.password }"
            :disabled="isLoading"
            aria-required="true"
            :aria-describedby="validationErrors.password ? 'password-error' : undefined"
            @input="clearFieldError('password')"
            placeholder="Enter a secure password"
          />
          <div
            v-if="validationErrors.password"
            id="password-error"
            data-testid="password-error"
            class="field-error"
          >
            {{ validationErrors.password }}
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            data-testid="confirm-password-input"
            type="password"
            class="form-input"
            :class="{ 'error': validationErrors.confirmPassword }"
            :disabled="isLoading"
            aria-required="true"
            :aria-describedby="validationErrors.confirmPassword ? 'confirm-password-error' : undefined"
            @input="clearFieldError('confirmPassword')"
            placeholder="Confirm your password"
          />
          <div
            v-if="validationErrors.confirmPassword"
            id="confirm-password-error"
            data-testid="confirm-password-error"
            class="field-error"
          >
            {{ validationErrors.confirmPassword }}
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="formData.acceptTerms"
              data-testid="terms-checkbox"
              type="checkbox"
              class="checkbox-input"
              :disabled="isLoading"
              @change="clearFieldError('acceptTerms')"
            />
            <span class="checkbox-text">
              I accept the <a href="/terms" target="_blank" class="terms-link">Terms and Conditions</a>
            </span>
          </label>
          <div
            v-if="validationErrors.acceptTerms"
            data-testid="terms-error"
            class="field-error"
          >
            {{ validationErrors.acceptTerms }}
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          data-testid="create-account-button"
          class="submit-button"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
        >
          <span v-if="isLoading" data-testid="loading-spinner" class="loading-spinner"></span>
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <!-- Sign In Link -->
      <div class="signin-link">
        Already have an account?
        <router-link to="/login" class="link">Sign in</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateUserAccount } from '@/presentation/composables/useCreateUserAccount'

const router = useRouter()
const { createAccount, isLoading, error: serviceError, success, clearError } = useCreateUserAccount()

// Local error state for validation messages
const error = ref<string | null>(null)

// Form data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Validation errors
const validationErrors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

// Clear field-specific error
const clearFieldError = (field: keyof typeof validationErrors) => {
  validationErrors[field] = ''
  if (error.value) {
    error.value = null
  }
  if (serviceError.value) {
    clearError()
  }
}

// Client-side validation
const validateForm = () => {
  let hasErrors = false

  // Reset errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key as keyof typeof validationErrors] = ''
  })

  // Name validation
  if (!formData.name.trim()) {
    validationErrors.name = 'Name is required'
    hasErrors = true
  }

  // Email validation
  if (!formData.email.trim()) {
    validationErrors.email = 'Email is required'
    hasErrors = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    validationErrors.email = 'Invalid email format'
    hasErrors = true
  }

  // Password validation
  if (!formData.password) {
    validationErrors.password = 'Password is required'
    hasErrors = true
  } else if (formData.password.length < 8) {
    validationErrors.password = 'Password must be at least 8 characters long'
    hasErrors = true
  }

  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    validationErrors.confirmPassword = 'Passwords do not match'
    hasErrors = true
  }

  // Terms validation
  if (!formData.acceptTerms) {
    validationErrors.acceptTerms = 'You must accept the terms and conditions'
    hasErrors = true
  }

  return !hasErrors
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    // Show validation errors in general error message for E2E tests
    const firstError = Object.values(validationErrors).find(err => err)
    if (firstError) {
      error.value = firstError
    }
    return
  }

  const result = await createAccount({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword
  })

  if (result.isSuccess) {
    // The success state will trigger the success message display
    // After a short delay, redirect to welcome page
    setTimeout(() => {
      router.push('/welcome')
    }, 2000)
  }
}

// Watch for success state to redirect
watch(success, (newSuccess) => {
  if (newSuccess) {
    setTimeout(() => {
      router.push('/welcome')
    }, 2000)
  }
})
</script>

<style scoped>
.register-form-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 1rem;
}

.register-form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.register-title {
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.success-message {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.email-notice {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Form spacing handled by form-group margin-bottom */

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.checkbox-input {
  margin-right: 0.5rem;
  margin-top: 0.125rem;
}

.checkbox-text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

.terms-link {
  color: #3b82f6;
  text-decoration: underline;
}

.terms-link:hover {
  color: #2563eb;
}

.field-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.submit-button {
  width: 100%;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.signin-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.link {
  color: #3b82f6;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
