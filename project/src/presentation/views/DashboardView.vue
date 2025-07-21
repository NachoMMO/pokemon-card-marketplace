<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="dashboard-title">Welcome to Pokémon Card Marketplace</h1>
          <p v-if="user" class="welcome-message">
            Hello, {{ user.firstName || user.displayName }}! Ready to trade some cards?
          </p>
        </div>
        <div class="header-actions">
          <button class="header-button" @click="refreshData">
            <span class="refresh-icon">↻</span>
            Refresh
          </button>
          <button class="header-button profile-button" @click="openProfile">
            <span class="profile-avatar">
              {{ user?.firstName?.charAt(0) || user?.displayName?.charAt(0) || '?' }}
            </span>
            Profile
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="dashboard-content">
        <!-- Quick Stats -->
        <section class="stats-section">
          <h2 class="section-title">Your Trading Dashboard</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon collection-icon">🃏</div>
              <div class="stat-content">
                <div class="stat-number">{{ userStats.collectionCount }}</div>
                <div class="stat-label">Cards in Collection</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon cart-icon">🛒</div>
              <div class="stat-content">
                <div class="stat-number">{{ userStats.cartCount }}</div>
                <div class="stat-label">Items in Cart</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon balance-icon">💰</div>
              <div class="stat-content">
                <div class="stat-number">${{ user?.balance.toFixed(2) || '0.00' }}</div>
                <div class="stat-label">Account Balance</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon trades-icon">📊</div>
              <div class="stat-content">
                <div class="stat-number">{{ user?.totalTrades || 0 }}</div>
                <div class="stat-label">Total Trades</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="actions-section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            <router-link to="/cards" class="action-card">
              <div class="action-icon">🔍</div>
              <div class="action-content">
                <h3>Browse Cards</h3>
                <p>Discover and purchase cards from other traders</p>
              </div>
            </router-link>
            <router-link to="/collection" class="action-card">
              <div class="action-icon">📚</div>
              <div class="action-content">
                <h3>My Collection</h3>
                <p>View and manage your card collection</p>
              </div>
            </router-link>
            <router-link to="/sell" class="action-card">
              <div class="action-icon">💰</div>
              <div class="action-content">
                <h3>Sell Cards</h3>
                <p>List your cards for sale to other collectors</p>
              </div>
            </router-link>
            <router-link to="/cart" class="action-card">
              <div class="action-icon">🛒</div>
              <div class="action-content">
                <h3>Shopping Cart</h3>
                <p>Review and purchase items in your cart</p>
              </div>
            </router-link>
            <router-link to="/messages" class="action-card">
              <div class="action-icon">💬</div>
              <div class="action-content">
                <h3>Messages</h3>
                <p>Chat with other traders and sellers</p>
              </div>
            </router-link>
            <router-link to="/balance" class="action-card">
              <div class="action-icon">💳</div>
              <div class="action-content">
                <h3>Manage Balance</h3>
                <p>Add funds or view transaction history</p>
              </div>
            </router-link>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="activity-section">
          <h2 class="section-title">Recent Activity</h2>
          <div class="activity-list">
            <div v-if="isLoadingActivity" class="activity-loading">
              <div class="loading-spinner"></div>
              Loading recent activity...
            </div>
            <div v-else-if="recentActivity.length === 0" class="empty-activity">
              <div class="empty-icon">📭</div>
              <h3>No recent activity</h3>
              <p>Start trading to see your activity here!</p>
            </div>
            <div v-else class="activity-items">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="activity.type">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from '@/presentation/composables/useCurrentUser'

const router = useRouter()
const { getCurrentUser, user: currentUser, isLoading } = useCurrentUser()

// Local state
const isLoadingActivity = ref(false)
const userStats = ref({
  collectionCount: 0,
  cartCount: 0
})

const recentActivity = ref([
  {
    id: '1',
    type: 'purchase',
    title: 'Card Purchase',
    description: 'You purchased Charizard EX for $45.00',
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: '2',
    type: 'sale',
    title: 'Card Listed',
    description: 'Your Pikachu card was listed for sale',
    timestamp: new Date(Date.now() - 7200000) // 2 hours ago
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    description: 'TrainerMaster99 sent you a message about a trade',
    timestamp: new Date(Date.now() - 86400000) // 1 day ago
  }
])

// Computed properties
const user = computed(() => {
  if (!currentUser.value) return null
  return {
    firstName: currentUser.value.profile?.firstName,
    displayName: currentUser.value.profile?.displayName,
    balance: currentUser.value.profile?.balance || 0,
    totalTrades: currentUser.value.profile ?
      (currentUser.value.profile as any).totalTrades || 0 : 0
  }
})

// Methods
const refreshData = async () => {
  await loadDashboardData()
}

const openProfile = () => {
  router.push('/profile')
}

const loadDashboardData = async () => {
  try {
    await getCurrentUser()
    // Here you would normally load additional dashboard data
    // like cart count, collection count, etc.
    // For now, we'll use mock data
    userStats.value = {
      collectionCount: 42,
      cartCount: 3
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'purchase': return '🛒'
    case 'sale': return '💰'
    case 'message': return '💬'
    case 'trade': return '🔄'
    default: return '📝'
  }
}

const formatTime = (timestamp: Date) => {
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

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.welcome-message {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.header-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.profile-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.profile-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.profile-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.refresh-icon {
  font-size: 1rem;
}

.dashboard-main {
  padding: 2rem 0;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin: 0 0 1.5rem 0;
}

.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.collection-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.cart-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.balance-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.trades-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.actions-section {
  margin-bottom: 3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.action-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.action-content p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.activity-section {
  margin-bottom: 2rem;
}

.activity-list {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.activity-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #6b7280;
}

.empty-activity {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-activity h3 {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.activity-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.activity-icon.purchase { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.activity-icon.sale { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.activity-icon.message { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.activity-icon.trade { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.activity-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #6b7280;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    padding: 0 1rem;
  }
}
</style>
