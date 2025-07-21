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
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/presentation/views/LoginView.vue')
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/presentation/views/OnboardingView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/presentation/views/DashboardView.vue')
    }
  ]
})

export default router
