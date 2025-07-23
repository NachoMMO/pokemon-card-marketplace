<template>
  <div class="welcome-page">
    <div class="welcome-container">
      <div class="welcome-content">
        <h1>¡Bienvenido!</h1>
        <div data-testid="email-confirmation-notice" class="confirmation-notice">
          <p>Your account has been created successfully. A confirmation email has been sent to your email address.</p>
          <p>Please check your inbox and follow the instructions to confirm your account.</p>
        </div>
        <div class="next-steps">
          <h2>Próximos pasos:</h2>
          <ul>
            <li>Confirma tu email haciendo clic en el enlace que te enviamos</li>
            <li>Regresa aquí e inicia sesión</li>
            <li>Completa tu perfil de usuario</li>
            <li>¡Comienza a coleccionar cartas Pokémon!</li>
          </ul>
        </div>
        <div class="actions">
          <router-link to="/login" class="btn btn-primary">Sign In</router-link>
          <router-link to="/" class="btn btn-secondary">Go to Homepage</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Welcome page after successful registration
</script>

<style scoped>
@import '../styles/theme.css';
</style>
