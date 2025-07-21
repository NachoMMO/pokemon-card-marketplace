<template>
  <div class="onboarding-container">
    <div class="onboarding-card">
      <h1 class="onboarding-title">Complete Your Profile</h1>
      <p class="onboarding-subtitle">
        Welcome! Please complete your profile to start your Pokémon card trading journey.
      </p>

      <!-- Error Message -->
      <div
        v-if="error || serviceError"
        data-testid="error-message"
        class="error-message"
      >
        {{ error || (typeof serviceError === 'string' ? serviceError : 'An error occurred') }}
      </div>

      <form @submit.prevent="handleSubmit" class="onboarding-form" data-testid="onboarding-form">
        <!-- First Name Field -->
        <div class="form-group">
          <label for="firstName" class="form-label">First Name *</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            data-testid="first-name-field"
            type="text"
            class="form-input"
            :class="{ 'error': validationErrors.firstName }"
            :disabled="isLoading"
            aria-required="true"
            placeholder="Enter your first name"
          />
          <div
            v-if="validationErrors.firstName"
            data-testid="first-name-error"
            class="field-error"
          >
            {{ validationErrors.firstName }}
          </div>
        </div>

        <!-- Last Name Field -->
        <div class="form-group">
          <label for="lastName" class="form-label">Last Name *</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            data-testid="last-name-field"
            type="text"
            class="form-input"
            :class="{ 'error': validationErrors.lastName }"
            :disabled="isLoading"
            aria-required="true"
            placeholder="Enter your last name"
          />
          <div
            v-if="validationErrors.lastName"
            data-testid="last-name-error"
            class="field-error"
          >
            {{ validationErrors.lastName }}
          </div>
        </div>

        <!-- Display Name Field -->
        <div class="form-group">
          <label for="displayName" class="form-label">Username *</label>
          <input
            id="displayName"
            v-model="formData.displayName"
            data-testid="display-name-field"
            type="text"
            class="form-input"
            :class="{ 'error': validationErrors.displayName }"
            :disabled="isLoading"
            aria-required="true"
            placeholder="Choose a unique username"
          />
          <div
            v-if="validationErrors.displayName"
            data-testid="display-name-error"
            class="field-error"
          >
            {{ validationErrors.displayName }}
          </div>
          <div class="field-hint">
            This will be your public username visible to other traders.
          </div>
        </div>

        <!-- Date of Birth Field (Optional) -->
        <div class="form-group">
          <label for="dateOfBirth" class="form-label">Date of Birth</label>
          <input
            id="dateOfBirth"
            v-model="formData.dateOfBirth"
            data-testid="date-of-birth-field"
            type="date"
            class="form-input"
            :disabled="isLoading"
          />
          <div class="field-hint">
            Optional. This helps us provide age-appropriate content.
          </div>
        </div>

        <!-- Bio Field (Optional) -->
        <div class="form-group">
          <label for="bio" class="form-label">Bio</label>
          <textarea
            id="bio"
            v-model="formData.bio"
            data-testid="bio-field"
            class="form-textarea"
            :disabled="isLoading"
            rows="3"
            maxlength="500"
            placeholder="Tell other traders about yourself and your collecting interests..."
          ></textarea>
          <div class="field-hint">
            Optional. Max 500 characters. {{ formData.bio?.length || 0 }}/500
          </div>
        </div>

        <!-- Location Field (Optional) -->
        <div class="form-group">
          <label for="location" class="form-label">Location</label>
          <input
            id="location"
            v-model="formData.location"
            data-testid="location-field"
            type="text"
            class="form-input"
            :disabled="isLoading"
            placeholder="City, Country"
          />
          <div class="field-hint">
            Optional. Helps other traders find local trading partners.
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          data-testid="complete-profile-button"
          class="submit-button"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
        >
          <span v-if="isLoading" data-testid="loading-spinner" class="loading-spinner"></span>
          {{ isLoading ? 'Creating Profile...' : 'Complete Profile' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCompleteUserOnboarding } from '@/presentation/composables/useCompleteUserOnboarding'

const router = useRouter()
const { completeOnboarding, isLoading, error: serviceError, clearError } = useCompleteUserOnboarding()

// Local error state for validation messages
const error = ref<string | null>(null)

// Form data
const formData = reactive({
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: '',
  bio: '',
  location: ''
})

// Validation errors
const validationErrors = reactive({
  firstName: '',
  lastName: '',
  displayName: ''
})

// Client-side validation
const validateForm = () => {
  let hasErrors = false

  // Reset errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key as keyof typeof validationErrors] = ''
  })

  // First name validation
  if (!formData.firstName.trim()) {
    validationErrors.firstName = 'First name is required'
    hasErrors = true
  }

  // Last name validation
  if (!formData.lastName.trim()) {
    validationErrors.lastName = 'Last name is required'
    hasErrors = true
  }

  // Display name validation
  if (!formData.displayName.trim()) {
    validationErrors.displayName = 'Username is required'
    hasErrors = true
  } else if (formData.displayName.length < 3) {
    validationErrors.displayName = 'Username must be at least 3 characters long'
    hasErrors = true
  } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.displayName)) {
    validationErrors.displayName = 'Username can only contain letters, numbers, hyphens, and underscores'
    hasErrors = true
  }

  return !hasErrors
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    // Show validation errors in general error message
    const firstError = Object.values(validationErrors).find(err => err)
    if (firstError) {
      error.value = firstError
    }
    return
  }

  // Clear any previous errors
  error.value = null
  clearError()

  const result = await completeOnboarding({
    firstName: formData.firstName,
    lastName: formData.lastName,
    displayName: formData.displayName,
    dateOfBirth: formData.dateOfBirth || undefined,
    bio: formData.bio || undefined,
    location: formData.location || undefined
  })

  if (result.isSuccess) {
    // Redirect to dashboard
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.onboarding-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.onboarding-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.onboarding-subtitle {
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error, .form-textarea.error {
  border-color: #ef4444;
}

.form-input:disabled, .form-textarea:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-error {
  color: #ef4444;
  font-size: 0.75rem;
}

.field-hint {
  color: #6b7280;
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
</style>
