import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './infrastructure/driving/router'
import { configureDependencies } from './infrastructure/di/configuration'

// Configurar sistema de inyección de dependencias
configureDependencies()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
