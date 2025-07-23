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
      <div class="register-card-dark">
        <h2 class="hero-title">Crea tu cuenta</h2>
        <p class="hero-subtitle">Únete a la comunidad Pokémon TCG Marketplace</p>
        <RegisterForm />
        <div class="signup-link-dark">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="cyberpunk-link">Inicia sesión</router-link>
        </div>
      </div>
    </main>
    <footer class="cyberpunk-footer">
      <span>© 2025 Pokemon TCG</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/presentation/components/RegisterForm.vue'
</script>

<style lang="css" scoped>
@import '../styles/theme.css';
</style>
