<template>
  <div class="logout-container">
    <button
      data-testid="logout-button"
      class="logout-button"
      :disabled="isLoading"
      @click="handleLogout"
      type="button"
    >
      {{ isLoading ? 'Cerrando sesión...' : buttonText }}
    </button>

    <div
      v-if="error"
      data-testid="logout-error"
      class="logout-error"
    >
      {{ error }}
      <button
        data-testid="clear-error-button"
        class="clear-error-button"
        @click="clearError"
        type="button"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogout } from '../composables/useLogout';

interface Props {
  redirectPath?: string;
  buttonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  redirectPath: '/',
  buttonText: 'Cerrar Sesión'
});

const { isLoading, error, logout, clearError } = useLogout();

const handleLogout = async () => {
  await logout(props.redirectPath);
};
</script>

<style scoped>
.logout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.logout-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.logout-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.logout-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.clear-error-button {
  background: none;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  font-size: 1.125rem;
  font-weight: bold;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.clear-error-button:hover {
  color: #991b1b;
}
</style>
