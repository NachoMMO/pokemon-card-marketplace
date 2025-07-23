import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../../../presentation/views/HomeView.vue'
import DashboardView from '../../../presentation/views/DashboardView.vue'
import RegisterView from '../../../presentation/views/RegisterView.vue'
import WelcomeView from '../../../presentation/views/WelcomeView.vue'
import LoginView from '../../../presentation/views/LoginView.vue'
import OnboardingView from '../../../presentation/views/OnboardingView.vue'
import ForgotPasswordView from '../../../presentation/views/ForgotPasswordView.vue'
import ResetPasswordView from '../../../presentation/views/ResetPasswordView.vue'
import { authGuard, guestGuard, onboardingGuard, resetPasswordGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      beforeEnter: guestGuard,
      meta: { requiresGuest: true }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      beforeEnter: resetPasswordGuard,
      meta: { allowRecovery: true }
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

// Global navigation guard to handle Supabase recovery tokens
router.beforeEach((to, from, next) => {
  // Check if there's a recovery token in the URL hash
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const tokenType = hashParams.get('type')
  const accessToken = hashParams.get('access_token')

  // If we detect a recovery token and we're not already on the reset password page
  if (tokenType === 'recovery' && accessToken && to.path !== '/reset-password') {
    // Redirect to reset password page, preserving the hash
    next('/reset-password')
    return
  }

  next()
})

export default router
