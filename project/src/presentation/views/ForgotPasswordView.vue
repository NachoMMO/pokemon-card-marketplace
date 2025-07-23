<template>
  <div class="cyberpunk-home">
    <header class="cyberpunk-header">
      <h1 class="logo">Pokemon TCG</h1>
      <nav>
        <router-link to="/" class="cyberpunk-link">Home</router-link>
        <router-link to="/catalog" class="cyberpunk-link">Catalog</router-link>
        <router-link to="/login" class="cyberpunk-link">Login</router-link>
        <router-link to="/register" class="cyberpunk-link">Register</router-link>
      </nav>
    </header>
    <main class="cyberpunk-hero">
      <div class="login-card-dark">
        <h2 class="hero-title">Recover Password</h2>
        <p class="hero-subtitle">Enter your email address to receive a password reset link</p>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
              :disabled="isLoading"
              class="form-input"
              :class="{ error: error }"
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
            class="submit-button"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>
        <div class="signup-link-dark" style="margin-top: 2rem;">
          <router-link to="/login" class="cyberpunk-link">
            Back to Login
          </router-link>
        </div>
      </div>
    </main>
    <footer class="cyberpunk-footer">
      <span>© 2025 Pokemon TCG</span>
    </footer>
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
@import '../styles/theme.css';
</style>
