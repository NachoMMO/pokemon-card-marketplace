<template>
  <div class="cyberpunk-home">
    <!-- Header -->
    <header class="cyberpunk-header">
      <h1 class="logo">Pokemon TCG</h1>
      <nav>
        <router-link to="/" class="cyberpunk-link">Home</router-link>
        <router-link to="/catalog" class="cyberpunk-link">Catalog</router-link>
        <router-link to="/login" class="cyberpunk-link">Login</router-link>
        <router-link to="/register" class="cyberpunk-link">Register</router-link>
        <span v-if="user" style="margin-left: 1.5rem;">
          <LogoutButton />
        </span>
      </nav>
    </header>

    <!-- Hero/Stats Section -->
    <section class="cyberpunk-hero" style="width:100%;max-width:1000px;">
      <h2 class="hero-title" style="font-size:2.2rem;">Your Trading Dashboard</h2>
      <div class="stats-cards-grid">
        <div class="stat-card">
          <div class="stat-icon">🃏</div>
          <div class="stat-info">
            <div class="stat-value">{{ userStats.collectionCount }}</div>
            <div class="stat-label">Cards in Collection</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛒</div>
          <div class="stat-info">
            <div class="stat-value">{{ userStats.cartCount }}</div>
            <div class="stat-label">Items in Cart</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value" v-if="user">${{ user.balance?.toFixed(2) || '0.00' }}</div>
            <div class="stat-value" v-else>$0.00</div>
            <div class="stat-label">Account Balance</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-value" v-if="user">{{ user.totalTrades || 0 }}</div>
            <div class="stat-value" v-else>0</div>
            <div class="stat-label">Total Trades</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="cyberpunk-features">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-cards-grid">
        <router-link to="/cards" class="action-card">
          <div class="action-icon">🔍</div>
          <div class="action-info">
            <div class="action-title">Browse Cards</div>
            <div class="action-desc">Discover and purchase cards from other traders</div>
          </div>
        </router-link>
        <router-link to="/collection" class="action-card">
          <div class="action-icon">📚</div>
          <div class="action-info">
            <div class="action-title">My Collection</div>
            <div class="action-desc">View and manage your card collection</div>
          </div>
        </router-link>
        <router-link to="/sell" class="action-card">
          <div class="action-icon">💰</div>
          <div class="action-info">
            <div class="action-title">Sell Cards</div>
            <div class="action-desc">List your cards for sale to other collectors</div>
          </div>
        </router-link>
        <router-link to="/cart" class="action-card">
          <div class="action-icon">🛒</div>
          <div class="action-info">
            <div class="action-title">Shopping Cart</div>
            <div class="action-desc">Review and purchase items in your cart</div>
          </div>
        </router-link>
        <router-link to="/messages" class="action-card">
          <div class="action-icon">💬</div>
          <div class="action-info">
            <div class="action-title">Messages</div>
            <div class="action-desc">Chat with other traders and sellers</div>
          </div>
        </router-link>
        <router-link to="/balance" class="action-card">
          <div class="action-icon">💳</div>
          <div class="action-info">
            <div class="action-title">Manage Balance</div>
            <div class="action-desc">Add funds or view transaction history</div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="cyberpunk-testimonials">
      <h3 class="section-title">Recent Activity</h3>
      <div class="activity-cards-grid">
        <div v-if="isLoadingActivity" class="activity-card activity-loading">
          <div class="activity-icon">⏳</div>
          <div class="activity-info">
            <div class="activity-title">Loading recent activity...</div>
          </div>
        </div>
        <div v-else-if="recentActivity.length === 0" class="activity-card activity-empty">
          <div class="activity-icon">📭</div>
          <div class="activity-info">
            <div class="activity-title">No recent activity</div>
            <div class="activity-desc">Start trading to see your activity here!</div>
          </div>
        </div>
        <div v-else class="activity-items" style="display:flex;gap:1.2rem;">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-card"
          >
            <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
            <div class="activity-info">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-desc">{{ activity.description }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="cyberpunk-footer">
      <span>© 2025 Pokemon TCG</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCurrentUser } from '@/presentation/composables/useCurrentUser'
import LogoutButton from '@/presentation/components/LogoutButton.vue'

// Usuario actual reactivo
const { getCurrentUser, user: currentUser } = useCurrentUser()
const user = computed(() => {
  if (!currentUser.value) return null
  const profile = currentUser.value.profile
  return {
    firstName: profile?.firstName,
    displayName: profile?.displayName,
    balance: profile?.balance || 0,
    totalTrades: 0 // Puedes actualizar esto si tienes el dato real
  }
})

// Stats reactivas
const userStats = ref({
  collectionCount: 0,
  cartCount: 0
})

// Actividad reciente reactiva
const isLoadingActivity = ref(false)
const recentActivity = ref([
  {
    id: '1',
    type: 'purchase',
    title: 'Card Purchase',
    description: 'You purchased Charizard EX for $45.00',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    type: 'sale',
    title: 'Card Listed',
    description: 'Your Pikachu card was listed for sale',
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    description: 'TrainerMaster99 sent you a message about a trade',
    timestamp: new Date(Date.now() - 86400000)
  }
])

// Métodos auxiliares
function getActivityIcon(type: string) {
  switch (type) {
    case 'purchase': return '🛒'
    case 'sale': return '💰'
    case 'message': return '💬'

    case 'trade': return '🔄'
    default: return '📝'
  }
}

function formatTime(timestamp: Date) {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Cargar datos al montar
const loadDashboardData = async () => {
  try {
    await getCurrentUser()
    // Aquí puedes cargar datos reales si tienes API
    userStats.value = {
      collectionCount: 42,
      cartCount: 3
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
@import '../styles/theme.css';

/* Responsive grid para todas las secciones de tarjetas */

.actions-cards-grid,
.stats-cards-grid,
.activity-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 1100px;
  margin: 2rem auto 2.5rem auto;
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
  box-sizing: border-box;
  padding-left: 20px;
  padding-right: 20px;
}

@media (max-width: 900px) {
  .actions-cards-grid,
  .stats-cards-grid,
  .activity-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }
}
@media (max-width: 600px) {
  .actions-cards-grid,
  .stats-cards-grid,
  .activity-cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding-left: 8px;
    padding-right: 8px;
  }
}

.action-card {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 1rem;
  min-width: 270px;
  max-width: 340px;
  flex: 1 1 270px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 1.5rem;
  color: #e2e8f0;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  text-decoration: none;
}
.action-card:hover {
  border-color: #00d4ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.18);
}
.action-icon {
  font-size: 2.3rem;
  margin-right: 0.5rem;
  color: #00d4ff;
  flex-shrink: 0;
}
.action-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.action-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.2rem;
  letter-spacing: -0.5px;
}
.action-desc {
  font-size: 1.05rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: -0.2px;
}

/* ...eliminado, ahora está unificado arriba... */
 .activity-card {
  background: #1e293b;
  border: 1.5px solid #334155;
  border-radius: 1rem;
  min-width: 270px;
  max-width: 340px;
  flex: 1 1 270px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem 1.5rem;
  color: #e2e8f0;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.13);
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
}
.activity-card:hover {
  border-color: #00d4ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.13);
}
.activity-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
  color: #00d4ff;
  flex-shrink: 0;
  margin-top: 0.2rem;
}
.activity-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.activity-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.2rem;
  letter-spacing: -0.5px;
}
.activity-desc {
  font-size: 1.01rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: -0.2px;
  margin-bottom: 0.2rem;
}
.activity-time {
  font-size: 0.98rem;
  color: #38bdf8;
  font-weight: 500;
  margin-top: 0.1rem;
}
.activity-loading {
  opacity: 0.7;
  pointer-events: none;
}
.activity-empty {
  opacity: 0.7;
}

/* ...eliminado, ahora está unificado arriba... */
/* Eliminado: ahora la responsividad se maneja con minmax y media queries */
 .stat-card {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 1rem;
  min-width: 270px;
  max-width: 340px;
  flex: 1 1 270px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 1.5rem;
  color: #e2e8f0;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
}
.stat-card:hover {
  border-color: #00d4ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.18);
}
.stat-icon {
  font-size: 2.7rem;
  margin-right: 0.5rem;
  color: #00d4ff;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.stat-value {
  font-size: 2.1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.2rem;
  letter-spacing: -1px;
}
.stat-label {
  font-size: 1.05rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: -0.2px;
}

section {
  margin: 0 auto;
  padding: 2rem 1.5rem;
  max-width: 1200px;
}
</style>
