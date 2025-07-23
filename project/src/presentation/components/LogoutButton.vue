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
@import '../styles/theme.css';
</style>
