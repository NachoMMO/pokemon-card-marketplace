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
        <h2 class="hero-title">Welcome Back</h2>
        <p class="hero-subtitle">Sign in to continue to your Pokémon Card Marketplace</p>
        <LoginForm />
        <div class="signup-link-dark">
          ¿No tienes cuenta?
          <router-link to="/register" class="cyberpunk-link">Regístrate</router-link>
        </div>
      </div>
    </main>
    <footer class="cyberpunk-footer">
      <span>© 2025 Pokemon TCG</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue'
</script>

<style scoped>
@import '../styles/theme.css';
</style>
