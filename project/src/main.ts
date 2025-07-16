import { createApp } from 'vue'
import App from './App.vue'
import router from './infrastructure/driving/router'

const app = createApp(App)

app.use(router)

app.mount('#app')
