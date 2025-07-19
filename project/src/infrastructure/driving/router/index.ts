import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/presentation/views/HomeView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/presentation/views/RegisterView.vue')
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/presentation/views/WelcomeView.vue')
    }
  ]
})

export default router
