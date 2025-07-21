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
.welcome-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 1rem;
}

.welcome-container {
  width: 100%;
  max-width: 600px;
}

.welcome-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-content h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.confirmation-notice {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.confirmation-notice p {
  margin: 0.5rem 0;
  color: #155724;
}

.next-steps {
  text-align: left;
  margin-bottom: 2rem;
}

.next-steps h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.next-steps ul {
  padding-left: 1.5rem;
}

.next-steps li {
  margin-bottom: 0.5rem;
  color: #495057;
}

.actions {
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6b7280;
}

.btn-secondary:hover {
  background-color: #4b5563;
}
</style>
