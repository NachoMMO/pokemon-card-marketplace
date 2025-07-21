import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../../../presentation/views/HomeView.vue'
import DashboardView from '../../../presentation/views/DashboardView.vue'
import RegisterView from '../../../presentation/views/RegisterView.vue'
import WelcomeView from '../../../presentation/views/WelcomeView.vue'
import LoginView from '../../../presentation/views/LoginView.vue'
import OnboardingView from '../../../presentation/views/OnboardingView.vue'
import { authGuard, guestGuard, onboardingGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: guestGuard,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      beforeEnter: guestGuard,
      meta: { requiresGuest: true }
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: WelcomeView,
      beforeEnter: guestGuard,
      meta: { requiresGuest: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: guestGuard,
      meta: { requiresGuest: true }
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
      beforeEnter: onboardingGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    }
  ]
})

export default router
