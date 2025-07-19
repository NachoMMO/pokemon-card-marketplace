<template>
  <div class="register-page">
    <div class="register-container">
      <RegisterForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/presentation/components/RegisterForm.vue'
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 1rem;
}

.register-container {
  width: 100%;
  max-width: 500px;
}
</style>
