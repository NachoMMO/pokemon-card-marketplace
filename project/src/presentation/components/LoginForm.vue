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
import { ref, reactive } from 'vue'
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
@import '../styles/theme.css';

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.error-message {
  background-color: #7f1d1d;
  border: 1px solid #ef4444;
  color: #fecaca;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.form-footer {
  margin-top: 1rem;
  text-align: center;
}
</style>
