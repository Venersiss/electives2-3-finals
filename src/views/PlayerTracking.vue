<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
    <!-- Header -->
    <div class="pixel-card m-4 p-6 flex justify-between items-center flex-wrap gap-4">
      <h1 class="text-4xl font-bold text-pixel-gold">PLAYER TRACKING</h1>
      <router-link to="/dashboard" class="pixel-btn-secondary px-6 py-2 whitespace-nowrap">← BACK</router-link>
    </div>

    <!-- Search and Filter -->
    <div class="m-4">
      <div class="pixel-card p-6 flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search players..."
          class="pixel-input flex-1"
        />
        <select v-model="filterStatus" class="pixel-select">
          <option value="">All players</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>
    </div>

    <!-- Players Table -->
    <div class="m-4">
      <div class="pixel-card p-6">
        <h2 class="text-2xl font-bold text-pixel-gold mb-4">ACTIVE PLAYERS ({{ filteredPlayers.length }})</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-pixel-gold">
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">ID</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">USERNAME</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">LEVEL</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">XP</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">GOLD</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">HP</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">BOSSES DEFEATED</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">ACTIVE</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">LAST ACTIVE</th>
                <th class="text-left py-3 px-4 text-pixel-gold font-bold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="player in filteredPlayers"
                :key="player.id"
                class="player-row border-b border-slate-700 hover:bg-slate-700 transition-all duration-200"
              >
                <td class="py-3 px-4 text-white font-bold">{{ player.id }}</td>
                <td class="py-3 px-4 text-slate-300">{{ player.username || ('User #' + player.id) }}</td>
                <td class="py-3 px-4 text-pixel-gold">{{ player.level }}</td>
                <td class="py-3 px-4 text-slate-300">{{ player.xp }}</td>
                <td class="py-3 px-4 text-pixel-gold">💰 {{ player.gold }}</td>
                <td class="py-3 px-4">
                  <span :class="['px-2 py-1 rounded', (player.hp || 0) > 50 ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100']">
                    {{ player.hp || 0 }}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-300">{{ countDefeatedBosses(player.userProgress) }}/{{ totalBosses }}</td>
                <td class="py-3 px-4">
                  <span :class="player.isActive ? 'text-green-400 font-bold' : 'text-slate-400'">
                    <span :class="['inline-block mr-2 w-3 h-3 rounded-full', player.isActive ? 'bg-green-500' : 'bg-slate-600']"></span>
                    {{ player.isActive ? 'Active' : 'Offline' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-400 text-sm">{{ formatDate(player.lastActive) }}</td>
                <td class="py-3 px-4">
                  <button 
                    @click="viewPlayerDetail(player)"
                    class="pixel-btn-secondary px-3 py-1 text-sm"
                  >
                    VIEW
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Player Detail Modal -->
    <div v-if="selectedPlayer" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="pixel-card w-full max-w-2xl max-h-screen overflow-y-auto">
        <div class="p-6">
            <div class="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <h2 class="text-3xl font-bold text-pixel-gold">Player #{{ selectedPlayer.id }} ({{ selectedPlayer.username || 'Unknown' }})</h2>
            <div class="flex items-center gap-3">
              <div v-if="selectedPlayer.isActive" class="flex items-center gap-2">
                <span class="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-green-400 font-bold">Active</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <span class="inline-block w-3 h-3 rounded-full bg-slate-600"></span>
                <span class="text-slate-400">Offline</span>
              </div>
              <button 
                @click="selectedPlayer = null"
                class="text-2xl text-pixel-gold hover:text-yellow-300"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="border-2 border-pixel-gold p-4 rounded">
              <p class="text-slate-400 text-sm">LEVEL</p>
              <p class="text-2xl font-bold text-pixel-gold">{{ selectedPlayer.level }}</p>
            </div>
            <div class="border-2 border-pixel-gold p-4 rounded">
              <p class="text-slate-400 text-sm">TOTAL XP</p>
              <p class="text-2xl font-bold text-pixel-gold">{{ selectedPlayer.xp }}</p>
            </div>
            <div class="border-2 border-pixel-gold p-4 rounded">
              <p class="text-slate-400 text-sm">GOLD</p>
              <p class="text-2xl font-bold text-pixel-gold">💰 {{ selectedPlayer.gold }}</p>
            </div>
            <div class="border-2 border-pixel-gold p-4 rounded">
              <p class="text-slate-400 text-sm">HP</p>
              <p class="text-2xl font-bold text-pixel-gold">{{ selectedPlayer.hp }}</p>
            </div>
          </div>

          <!-- Player Stats: Win/Loss/Abandoned -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="border-2 border-emerald-500 bg-emerald-950 p-4 rounded">
              <p class="text-emerald-400 text-sm font-bold">🏆 VICTORIES</p>
              <p class="text-3xl font-bold text-emerald-300">{{ getPlayerVictories(selectedPlayer.userProgress) }}</p>
            </div>
            <div class="border-2 border-red-500 bg-red-950 p-4 rounded">
              <p class="text-red-400 text-sm font-bold">❌ FAILURES</p>
              <p class="text-3xl font-bold text-red-300">{{ getPlayerFailures(selectedPlayer.userProgress) }}</p>
            </div>
            <div class="border-2 border-amber-500 bg-amber-950 p-4 rounded">
              <p class="text-amber-400 text-sm font-bold">⏸️ ABANDONED</p>
              <p class="text-3xl font-bold text-amber-300">{{ getPlayerAbandoned(selectedPlayer.userProgress) }}</p>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-bold text-pixel-gold mb-3">BOSS PROGRESS</h3>
            <div class="space-y-2">
              <div v-if="selectedPlayer.userProgress && selectedPlayer.userProgress.length" v-for="progress in selectedPlayer.userProgress" :key="progress.id" class="flex justify-between items-center p-3 bg-slate-700 rounded">
                <div>
                  <p class="font-bold text-white">{{ getBossName(progress.bossId) }}</p>
                  <p class="text-sm text-slate-400">Attempts: {{ progress.attemptCount }} | Best Time: {{ progress.bestTime }}s</p>
                  <p class="text-sm text-slate-400">Start: {{ formatDate(progress.startChallenge) }} | Submit: {{ formatDate(progress.submitCode) }} | Duration: {{ formatDuration(computeDurationSeconds(progress.startChallenge, progress.submitCode)) }}</p>
                </div>
                <span v-if="progress.isDefeated" class="text-green-400 font-bold">✓ DEFEATED</span>
                <span v-else class="text-yellow-400 font-bold">IN PROGRESS</span>
              </div>
              <div v-else class="text-slate-400 text-center py-4">No boss progress data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase'

export default {
  name: 'PlayerTracking',
  data() {
    return {
      players: [],
      bosses: [],
      searchQuery: '',
      filterStatus: '',
      selectedPlayer: null,
      totalBosses: 0,
      loading: false
    }
  },
  computed: {
    filteredPlayers() {
      if (this.players.length > 0) {
        console.log('📊 First player structure:', this.players[0])
      }
      const q = this.searchQuery ? this.searchQuery.toLowerCase() : ''
      return this.players.filter(player => {
        const matchesSearch = (!q) || String(player.id).toLowerCase().includes(q) || (player.username && player.username.toLowerCase().includes(q)) || (player.class && player.class.toLowerCase().includes(q))
        // status filter: online/offline/all
        let matchesStatus = true
        if (this.filterStatus === 'online') matchesStatus = !!player.isActive
        else if (this.filterStatus === 'offline') matchesStatus = !player.isActive
        return matchesSearch && matchesStatus
      })
    }
  },
  mounted() {
    this.loadPlayers()
    this.loadBosses()
    // auto-refresh players and bosses periodically
    this.refreshIntervalMs = 5000
    this.refreshTimer = setInterval(() => { this.loadPlayers(); this.loadBosses() }, this.refreshIntervalMs)
  },
  beforeUnmount() {
    try { if (this.refreshTimer) clearInterval(this.refreshTimer) } catch (e) {}
  },
  methods: {
    async loadPlayers() {
      this.loading = true
      try {
        console.log('🔄 Loading players from userInfo...')
        const { data, error } = await supabase
          .from('userInfo')
          .select(`
            *,
            userProgress(*)
          `)

        if (error) {
          console.error('❌ Supabase error:', error)
          throw error
        }
        console.log('✅ Loaded players:', data)
        this.players = data || []

        // Fetch usernames from Credentials table when userId exists
        const userIds = Array.from(new Set(this.players.map(p => p.userId).filter(Boolean)))
        if (userIds.length) {
          const { data: creds, error: credErr } = await supabase
            .from('Credentials')
            .select('id, username')
            .in('id', userIds)

          if (credErr) console.error('❌ Error loading credentials:', credErr)
          const credMap = (creds || []).reduce((m, c) => { m[c.id] = c.username; return m }, {})
          this.players = this.players.map(p => ({ ...p, username: credMap[p.userId] || p.username }))
        }
      } catch (err) {
        console.error('❌ Error loading players:', err)
      } finally {
        this.loading = false
      }
    },
    async loadBosses() {
      try {
        console.log('🔄 Loading bosses...')
        const { data, error } = await supabase
          .from('bosses')
          .select('*')

        if (error) {
          console.error('❌ Supabase error:', error)
          throw error
        }
        console.log('✅ Loaded bosses:', data)
        this.bosses = data || []
        this.totalBosses = this.bosses.length
      } catch (err) {
        console.error('❌ Error loading bosses:', err)
      }
    },
    viewPlayerDetail(player) {
      this.selectedPlayer = player
    },
    countDefeatedBosses(userProgress) {
      if (!userProgress) return 0
      return userProgress.filter(p => p.isDefeated).length
    },
    getPlayerVictories(userProgress) {
      if (!userProgress) return 0
      return userProgress.filter(p => p.isDefeated).length
    },
    getPlayerFailures(userProgress) {
      if (!userProgress) return 0
      return userProgress.filter(p => p.isFailed).length
    },
    getPlayerAbandoned(userProgress) {
      if (!userProgress) return 0
      return userProgress.filter(p => p.isAbandoned).length
    },
    getBossName(bossId) {
      const boss = this.bosses.find(b => b.id === bossId)
      return boss ? boss.name : 'Unknown Boss'
    },
    computeDurationSeconds(start, end) {
      if (!start || !end) return null
      const s = new Date(start)
      const e = new Date(end)
      if (isNaN(s) || isNaN(e)) return null
      return Math.max(0, Math.floor((e - s) / 1000))
    },
    formatDuration(seconds) {
      if (seconds === null || seconds === undefined) return '—'
      if (seconds < 60) return seconds + 's'
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return mins + 'm ' + secs + 's'
    },
    formatDate(dateString) {
      if (!dateString) return 'Never'
      // relative time
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)

      let rel = 'Just now'
      if (hours > 0) rel = hours + 'h ago'
      else if (minutes > 0) rel = minutes + 'm ago'

      // show Manila local time (UTC+8)
      try {
        const manila = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }).format(date)
        return `${rel} (${manila})`
      } catch (e) {
        return rel
      }
    }
  }
}
</script>
<style scoped>
/* Player row animations */
.player-row {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal animations */
.fixed {
  animation: fadeInModal 0.3s ease-out;
}

@keyframes fadeInModal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Smooth transitions for stat values */
.stat-card-modal {
  animation: scaleIn 0.4s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>