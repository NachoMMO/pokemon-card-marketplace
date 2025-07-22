<template>
  <div class="forgot-password-container">
    <div class="card">
      <div class="card-header">
        <h2>Recover Password</h2>
        <p>Enter your email address to receive a password reset link</p>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="email" class="label">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            :disabled="isLoading"
            class="input"
            :class="{ 'input-error': error }"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="isEmailSent" class="success-message">
          Password reset link has been sent to your email. Please check your inbox.
        </div>

        <button
          type="submit"
          :disabled="isLoading || !email.trim()"
          class="button button-primary"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
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
import { ref, watch } from 'vue'
import { usePasswordRecovery } from '../composables/usePasswordRecovery'

const email = ref('')
const { isLoading, error, isEmailSent, requestPasswordReset, clearError } = usePasswordRecovery()

// Clear error when user starts typing
watch(email, () => {
  if (error.value) {
    clearError()
  }
})

const handleSubmit = async () => {
  if (!email.value.trim()) return

  await requestPasswordReset(email.value.trim())
}
</script>

<style scoped>
.forgot-password-container {
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
