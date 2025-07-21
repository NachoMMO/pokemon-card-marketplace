<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Welcome Back</h1>
      <p class="login-subtitle">Sign in to continue to your Pokémon Card Marketplace</p>

      <LoginForm />

      <!-- Links -->
      <div class="login-links">
        <router-link to="/password-reset" class="link">Forgot your password?</router-link>
      </div>

      <div class="signup-link">
        Don't have an account?
        <router-link to="/register" class="link">Sign up</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue'
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.login-links {
  text-align: center;
  margin: 1.5rem 0;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.link {
  color: #667eea;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
