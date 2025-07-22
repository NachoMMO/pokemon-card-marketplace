<template>
  <div class="reset-password-container">
    <div class="card">
      <div class="card-header">
        <h2>Reset Password</h2>
        <p>Enter your new password below</p>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="newPassword" class="label">New Password</label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
            required
            :disabled="isLoading"
            class="input"
            :class="{ 'input-error': error }"
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            :disabled="isLoading"
            class="input"
            :class="{ 'input-error': error || passwordMismatch }"
            minlength="8"
          />
          <div v-if="passwordMismatch" class="field-error">
            Passwords do not match
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="isPasswordReset" class="success-message">
          Password has been reset successfully! Redirecting to login...
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="button button-primary"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <div class="form-footer">
        <router-link to="/login" class="link">
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResetPassword } from '../composables/useResetPassword'
import { container, DEPENDENCIES } from '../../infrastructure/di/container'
import type { ISupabaseAuthService } from '../../application/ports/services/ISupabaseAuthService'

const route = useRoute()
const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const token = ref('')

const { isLoading, error, isPasswordReset, resetPassword, clearError } = useResetPassword()

const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value
})

const isFormValid = computed(() => {
  return (
    newPassword.value.length >= 8 &&
    confirmPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value &&
    token.value.length > 0
  )
})

// Clear error when user starts typing
watch([newPassword, confirmPassword], () => {
  if (error.value) {
    clearError()
  }
})

// Redirect to dashboard on successful password reset
watch(isPasswordReset, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }
})

onMounted(async () => {
  // Supabase sends reset tokens in the URL hash, not query params
  // URL format: http://localhost:5173/reset-password#access_token=...&expires_in=...&refresh_token=...&token_type=bearer&type=recovery

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const tokenType = hashParams.get('type');

  // Check if this is a password recovery flow
  if (accessToken && refreshToken && tokenType === 'recovery') {
    token.value = accessToken;

    // Set the session with the recovery token
    const authService = container.get<ISupabaseAuthService>(DEPENDENCIES.SUPABASE_AUTH_SERVICE);
    const sessionSet = await authService.setSessionFromRecoveryToken?.(accessToken, refreshToken);

    if (sessionSet) {
      console.log('Password recovery session established successfully');
    } else {
      console.error('Failed to establish recovery session');
      router.push('/forgot-password');
    }
  } else {
    // Check query params as fallback
    token.value = route.query.token as string || '';

    // If no token, redirect to forgot password page
    if (!token.value) {
      console.log('No recovery token found, redirecting to forgot password');
      router.push('/forgot-password');
    }
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  await resetPassword(newPassword.value, confirmPassword.value)
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-header h2 {
  color: #2d3748;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.card-header p {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  color: #2d3748;
  font-weight: 500;
  font-size: 0.875rem;
}

.input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.input-error {
  border-color: #e53e3e;
}

.input-error:focus {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.field-error {
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid #feb2b2;
}

.success-message {
  background-color: #c6f6d5;
  color: #22543d;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid #9ae6b4;
}

.button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.button-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
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
  text-align: center;
  margin-top: 1.5rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
