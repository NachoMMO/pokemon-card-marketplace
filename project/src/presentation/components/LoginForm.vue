<template>
  <form @submit.prevent="handleSubmit" class="login-form" data-testid="login-form">
    <!-- Error Message -->
    <div
      v-if="error || validationError"
      data-testid="error-message"
      class="error-message"
    >
      {{ error || validationError }}
    </div>

    <!-- Email Field -->
    <div class="form-group">
      <label for="email" class="form-label">Email</label>
      <input
        id="email"
        v-model="formData.email"
        @input="handleEmailInput"
        data-testid="email-field"
        type="email"
        class="form-input"
        :class="{ 'error': validationErrors.email }"
        :disabled="isLoading"
        aria-required="true"
        placeholder="Enter your email address"
        autocomplete="email"
      />
      <div
        v-if="validationErrors.email"
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
        @input="handlePasswordInput"
        data-testid="password-field"
        type="password"
        class="form-input"
        :class="{ 'error': validationErrors.password }"
        :disabled="isLoading"
        aria-required="true"
        placeholder="Enter your password"
        autocomplete="current-password"
      />
      <div
        v-if="validationErrors.password"
        data-testid="password-error"
        class="field-error"
      >
        {{ validationErrors.password }}
      </div>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      data-testid="login-button"
      class="submit-button"
      :disabled="isLoading"
      :class="{ 'loading': isLoading }"
    >
      <span v-if="isLoading" data-testid="loading-spinner" class="loading-spinner"></span>
      {{ isLoading ? 'Signing In...' : 'Sign In' }}
    </button>

    <!-- Forgot Password Link -->
    <div class="form-footer">
      <router-link to="/forgot-password" class="forgot-password-link" data-testid="forgot-password-link">
        Forgot your password?
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useLogin } from '../composables/useLogin'

const { isLoading, error, loginUser, clearError } = useLogin()

// Form data
const formData = reactive({
  email: '',
  password: ''
})

// Validation errors
const validationErrors = reactive({
  email: '',
  password: ''
})

// Validation error for general display
const validationError = ref<string | null>(null)

// Client-side validation
const validateForm = () => {
  let hasErrors = false

  // Reset errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key as keyof typeof validationErrors] = ''
  })
  validationError.value = null

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
  }

  // Set general validation error for display if no service error
  if (hasErrors && !error.value) {
    const firstError = Object.values(validationErrors).find(err => err)
    if (firstError) {
      validationError.value = firstError
    }
  }

  return !hasErrors
}

// Handle form submission
const handleSubmit = async () => {
  if (isLoading.value) return // Prevent multiple submissions

  if (!validateForm()) {
    return
  }

  await loginUser({
    email: formData.email,
    password: formData.password
  })
}

// Clear validation errors when user types
const handleEmailInput = () => {
  if (validationErrors.email) {
    validationErrors.email = ''
    validationError.value = null
  }
  if (error.value) {
    clearError()
  }
}

const handlePasswordInput = () => {
  if (validationErrors.password) {
    validationErrors.password = ''
    validationError.value = null
  }
  if (error.value) {
    clearError()
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.field-error {
  color: #ef4444;
  font-size: 0.75rem;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
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

.form-footer {
  margin-top: 1rem;
  text-align: center;
}

.forgot-password-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-password-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}
</style>
