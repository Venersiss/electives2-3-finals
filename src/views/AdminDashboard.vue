<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
    <!-- Header -->
    <div class="m-4 p-4 bg-slate-800 rounded-md">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 class="text-4xl font-bold text-pixel-gold mb-2">ADMIN DASHBOARD</h1>
          <p class="text-slate-300">Welcome, {{ adminUsername }}!</p>
        </div>
        <button 
          @click="handleLogout"
          class="pixel-btn-secondary px-6 py-2 whitespace-nowrap"
        >
          LOGOUT
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 m-4">
      <div class="p-4 bg-slate-800 rounded-md stat-card">
        <p class="text-slate-400 text-sm font-bold">TOTAL BOSSES</p>
        <p class="text-3xl font-bold text-pixel-gold mt-2 stat-value">{{ stats.totalBosses }}</p>
      </div>
      <div class="p-4 bg-slate-800 rounded-md stat-card">
        <p class="text-slate-400 text-sm font-bold">TOTAL PLAYERS</p>
        <p class="text-3xl font-bold text-pixel-gold mt-2 stat-value">{{ stats.totalPlayers }}</p>
      </div>
      <div class="p-4 bg-slate-800 rounded-md stat-card">
        <p class="text-slate-400 text-sm font-bold">CHALLENGES COMPLETED</p>
        <p class="text-3xl font-bold text-pixel-gold mt-2 stat-value">{{ stats.totalCompleted }}</p>
      </div>
      <div class="p-4 bg-slate-800 rounded-md stat-card">
        <p class="text-slate-400 text-sm font-bold">AVERAGE ATTEMPTS</p>
        <p class="text-3xl font-bold text-pixel-gold mt-2 stat-value">{{ stats.avgAttempts }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 m-4">
      <router-link to="/bosses" class="p-4 bg-slate-800 rounded-md hover:bg-slate-700 transition cursor-pointer">
        <h3 class="text-xl font-bold text-pixel-gold mb-2">⚔️ MANAGE BOSSES</h3>
        <p class="text-slate-300">Create, edit, and delete boss challenges</p>
      </router-link>

      <router-link to="/items" class="p-4 bg-slate-800 rounded-md hover:bg-slate-700 transition cursor-pointer">
        <h3 class="text-xl font-bold text-pixel-gold mb-2">🛡️ MANAGE ITEMS</h3>
        <p class="text-slate-300">Manage gears, weapons, and equipment</p>
      </router-link>

      <router-link to="/players" class="p-4 bg-slate-800 rounded-md hover:bg-slate-700 transition cursor-pointer">
        <h3 class="text-xl font-bold text-pixel-gold mb-2">👥 TRACK PLAYERS</h3>
        <p class="text-slate-300">Monitor player progress and statistics</p>
      </router-link>

      <router-link to="/analytics" class="p-4 bg-slate-800 rounded-md hover:bg-slate-700 transition cursor-pointer">
        <h3 class="text-xl font-bold text-pixel-gold mb-2">📊 ANALYTICS</h3>
        <p class="text-slate-300">View leaderboards and game statistics</p>
      </router-link>

      <router-link to="/invitations" class="p-4 bg-slate-800 rounded-md hover:bg-slate-700 transition cursor-pointer">
        <h3 class="text-xl font-bold text-pixel-gold mb-2">📧 MANAGE INVITATIONS</h3>
        <p class="text-slate-300">Send admin invitations and track usage</p>
      </router-link>
    </div>

    <!-- Recent Activity -->
    <div class="m-4 p-4 bg-slate-800 rounded-md">
      <h2 class="text-xl md:text-2xl font-bold text-pixel-gold mb-4">RECENT ACTIVITY</h2>
      <div class="space-y-2">
        <p class="text-slate-300">📍 Latest boss challenges available</p>
        <p class="text-slate-300">👤 Active players: {{ stats.activePlayers }}</p>
        <p class="text-slate-300">🎮 Total playtime tracking enabled</p>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      adminUsername: '',
      adminEmail: '',
      stats: {
        totalBosses: 0,
        totalPlayers: 0,
        totalCompleted: 0,
        avgAttempts: 0,
        activePlayers: 0
      },
      previousStats: {
        totalBosses: 0,
        totalPlayers: 0,
        totalCompleted: 0,
        avgAttempts: 0,
        activePlayers: 0
      },
      loadingStats: false,
      refreshIntervalMs: 5000,
      refreshTimer: null,
      isInitialRender: true
    }
  },
  mounted() {
    this.loadAdminInfo()
    this.loadStats()
    // start periodic refresh
    this.refreshTimer = setInterval(() => this.loadStats(), this.refreshIntervalMs)
  },
  beforeUnmount() {
    if (this.refreshTimer) clearInterval(this.refreshTimer)
  },
  methods: {
    async loadAdminInfo() {
      try {
        const adminId = localStorage.getItem('adminId')
        if (!adminId) {
          console.error('No admin ID found in session')
          return
        }

        const { data, error } = await supabase
          .from('adminCredentials')
          .select('username, email')
          .eq('id', adminId)
          .single()

        if (error) throw error

        if (data) {
          this.adminUsername = data.username
          this.adminEmail = data.email
          console.log('✅ Admin info loaded:', data.username)
        }
      } catch (err) {
        console.error('Error loading admin info:', err)
        this.adminUsername = 'Admin'
      }
    },
    async loadStats() {
      this.loadingStats = true
      try {
        // load bosses, players, and progress
        const [ { data: bosses }, { data: users }, { data: progress } ] = await Promise.all([
          supabase.from('bosses').select('*'),
          supabase.from('userInfo').select('*'),
          supabase.from('userProgress').select('*')
        ])

        const totalBosses = (bosses || []).length
        const totalPlayers = (users || []).length
        const totalCompleted = (progress || []).filter(p => p.isDefeated).length
        const avgAttempts = (progress || []).length ? ((progress || []).reduce((s, r) => s + (Number(r.attemptCount) || 0), 0) / (progress || []).length) : 0
        const activePlayers = (users || []).filter(u => u.isActive).length

        this.stats = {
          totalBosses,
          totalPlayers,
          totalCompleted,
          avgAttempts: Number(avgAttempts.toFixed(2)),
          activePlayers
        }
        
        // trigger animation only on initial render
        if (this.isInitialRender) {
          this.triggerStatsAnimation()
          this.isInitialRender = false
          console.log('🎬 Initial stats animation triggered')
        }
        
        // save for next comparison
        this.previousStats = { ...this.stats }
      } catch (err) {
        console.error('Error loading dashboard stats:', err)
      } finally {
        this.loadingStats = false
      }
    },
    triggerStatsAnimation() {
      const cards = document.querySelectorAll('.stat-card')
      cards.forEach(card => {
        const value = card.querySelector('.stat-value')
        if (value) {
          value.classList.remove('stat-updating')
          void value.offsetWidth // force reflow
          value.classList.add('stat-updating')
          
          setTimeout(() => {
            value.classList.remove('stat-updating')
          }, 600)
        }
      })
    },
    handleLogout() {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminId')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Stat card value animation */
.stat-value {
  transition: color 0.3s ease-out;
}

.stat-updating {
  animation: statPulse 0.6s ease-out;
}

@keyframes statPulse {
  0% {
    transform: scale(1.1);
    color: #fbbf24;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    color: #fcd34d;
  }
}
</style>
