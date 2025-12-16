<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
    <!-- Header -->
    <div class="m-4 p-4 bg-slate-800 rounded-md flex justify-between items-center flex-wrap gap-4">
      <h1 class="text-3xl md:text-4xl font-bold text-pixel-gold">ANALYTICS</h1>
      <router-link to="/dashboard" class="pixel-btn-secondary px-4 py-2 whitespace-nowrap">← BACK</router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="m-4 p-8 bg-slate-800 rounded-md text-center">
      <p class="text-pixel-gold text-xl">Loading analytics data...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 m-4">
        <div class="p-4 bg-slate-800 rounded-md metric-card">
          <p class="text-slate-400 text-sm font-bold">SUCCESS RATE</p>
          <p class="text-3xl font-bold text-pixel-gold mt-2">{{ overallSuccessRate }}%</p>
          <p class="text-xs text-slate-500 mt-1">Based on {{ totalPlays }} plays</p>
        </div>
        <div class="p-4 bg-slate-800 rounded-md metric-card">
          <p class="text-slate-400 text-sm font-bold">AVG ATTEMPTS</p>
          <p class="text-3xl font-bold text-pixel-gold mt-2">{{ formatNumber(avgAttempts, 1) }}</p>
          <p class="text-xs text-slate-500 mt-1">Average attempts per play</p>
        </div>
        <div class="p-4 bg-slate-800 rounded-md metric-card">
          <p class="text-slate-400 text-sm font-bold">TOTAL PLAYS</p>
          <p class="text-3xl font-bold text-pixel-gold mt-2">{{ totalPlays }}</p>
          <p class="text-xs text-slate-500 mt-1">Total recorded attempts</p>
        </div>
        <div class="p-4 bg-slate-800 rounded-md metric-card">
          <p class="text-slate-400 text-sm font-bold">AVG TIME</p>
          <p class="text-3xl font-bold text-pixel-gold mt-2">{{ formatDurationSeconds(avgTimeSeconds) }}</p>
          <p class="text-xs text-slate-500 mt-1">Average solve time (bestTime)</p>
        </div>
      </div>

      <!-- Outcomes Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 m-4">
        <div class="p-4 bg-slate-800 rounded-md metric-card">
          <p class="text-slate-400 text-sm font-bold">🏆 VICTORIES</p>
          <p class="text-3xl font-bold text-emerald-400 mt-2">{{ totalVictories }}</p>
          <p class="text-xs text-slate-500 mt-1">Bosses defeated</p>
        </div>
        <div class="p-4 bg-slate-800 rounded-md metric-card">
          <p class="text-slate-400 text-sm font-bold">❌ FAILURES</p>
          <p class="text-3xl font-bold text-red-400 mt-2">{{ totalFailures }}</p>
          <p class="text-xs text-slate-500 mt-1">Attempts failed</p>
        </div>
        <div class="p-4 bg-slate-800 rounded-md metric-card">
          <p class="text-slate-400 text-sm font-bold">⏸️ ABANDONED</p>
          <p class="text-3xl font-bold text-amber-400 mt-2">{{ totalAbandoned }}</p>
          <p class="text-xs text-slate-500 mt-1">Incomplete attempts</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
        <!-- Success Rate Chart -->
        <div class="p-4 bg-slate-800 rounded-md chart-reveal" ref="successChartContainer">
          <h2 class="text-2xl font-bold text-pixel-gold mb-4">BOSS SUCCESS RATES</h2>
          <div class="w-full h-40 mb-4">
            <canvas ref="successChart" class="w-full h-full"></canvas>
          </div>
          <div class="space-y-4">
            <div v-if="bossesData.length === 0" class="text-slate-400 text-center py-4">
              No boss data available
            </div>
            <div v-for="(b, idx) in bossesData" :key="b.id">
              <div class="flex justify-between mb-1 items-center">
                <span class="text-white font-bold truncate max-w-[70%]" :title="b.name">{{ b.name }}</span>
                <span class="text-pixel-gold ml-2">{{ successRatesByBoss[b.id] || 0 }}%</span>
              </div>
              <div class="w-full bg-slate-700 rounded h-4 overflow-hidden">
                <div 
                  class="h-full transition-all duration-300" 
                  :style="{ width: (successRatesByBoss[b.id] || 0) + '%', backgroundColor: bossColorMap[b.id] || paletteColors[0] }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Difficulty Distribution -->
        <div class="p-4 bg-slate-800 rounded-md chart-reveal" ref="difficultyChartContainer">
          <h2 class="text-2xl font-bold text-pixel-gold mb-4">DIFFICULTY DISTRIBUTION</h2>
          <div class="w-full h-96 mb-4">
            <canvas ref="difficultyChart" class="w-full h-full"></canvas>
          </div>
          <div class="flex justify-around items-center h-48">
            <div v-if="Object.keys(difficultyCounts).length === 0" class="text-slate-400 text-center w-full">
              No difficulty data
            </div>
            <div v-for="(count, diff) in difficultyCounts" :key="diff" class="text-center">
              <div class="text-4xl font-bold text-pixel-gold">{{ count }}</div>
              <p class="text-slate-400 mt-2 capitalize">{{ diff }}</p>
              <p class="text-xs text-slate-500">{{ difficultyPercent(count) }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
        <!-- Best Times -->
        <div class="p-4 bg-slate-800 rounded-md">
          <h2 class="text-2xl font-bold text-pixel-gold mb-4">🏆 FASTEST SOLVERS</h2>
          <div class="space-y-3">
            <div v-if="fastestSolvers.length === 0" class="text-slate-400 text-center py-8">
              No solved bosses yet
            </div>
            <div v-for="(player, index) in fastestSolvers" :key="index" class="flex justify-between items-center p-3 bg-slate-700 rounded hover:bg-slate-600 transition">
              <div class="flex items-center gap-3">
                <span class="text-2xl font-bold text-pixel-gold">{{ index + 1 }}</span>
                <div>
                  <p class="font-bold text-white">{{ player.name }}</p>
                  <p class="text-xs text-slate-400">{{ player.boss }}</p>
                </div>
              </div>
              <span class="text-pixel-gold font-bold">⏱ {{ player.time }}</span>
            </div>
          </div>
        </div>

        <!-- Most Defeats -->
        <div class="p-4 bg-slate-800 rounded-md">
          <h2 class="text-2xl font-bold text-pixel-gold mb-4">🎯 MOST DEFEATS</h2>
          <div class="space-y-3">
            <div v-if="mostDefeats.length === 0" class="text-slate-400 text-center py-8">
              No defeats recorded yet
            </div>
            <div v-for="(player, index) in mostDefeats" :key="index" class="flex justify-between items-center p-3 bg-slate-700 rounded hover:bg-slate-600 transition">
              <div class="flex items-center gap-3">
                <span class="text-2xl font-bold text-pixel-gold">{{ index + 1 }}</span>
                <div>
                  <p class="font-bold text-white">{{ player.name }}</p>
                  <p class="text-xs text-slate-400">{{ player.defeats }} bosses defeated</p>
                </div>
              </div>
              <span class="text-pixel-gold font-bold">🏅 LV {{ player.level }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Attempts Distribution -->
      <div class="m-4">
        <div class="p-4 bg-slate-800 rounded-md chart-reveal" ref="attemptsChartContainer">
          <h2 class="text-2xl font-bold text-pixel-gold mb-4">ATTEMPTS DISTRIBUTION</h2>
          <div class="w-full mb-4" style="height: 300px;">
            <canvas ref="attemptsChart"></canvas>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div v-for="key in ['1','2-3','4-5','6-10','11+']" :key="key" class="text-center p-3 bg-slate-700 rounded">
              <p class="text-2xl font-bold text-pixel-gold">{{ attemptsDistribution[key] || 0 }}</p>
              <p class="text-xs text-slate-400">{{ key === '1' ? '1st Try' : key + ' Tries' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase'
import Chart from 'chart.js/auto'

export default {
  name: 'Analytics',
  data() {
    return {
      loading: true,
      userProgressData: [],
      userInfoData: [],
      bossesData: [],
      credentialsMap: {},

      // computed metrics
      totalPlays: 0,
      avgAttempts: 0,
      avgTimeSeconds: 0,
      successRatesByBoss: {},
      difficultyCounts: {},
      fastestSolvers: [],
      mostDefeats: [],
      attemptsDistribution: {},
      overallSuccessRate: 0,

      // outcome breakdown
      totalVictories: 0,
      totalFailures: 0,
      totalAbandoned: 0,

      // chart instances
      charts: {
        success: null,
        difficulty: null,
        attempts: null
      },

      // shared palette for charts
      paletteColors: [
        '#34D399', '#60A5FA', '#F59E0B', '#F97316', '#EF4444', '#FB7185',
        '#A78BFA', '#FBBF24', '#06B6D4', '#10B981', '#84CC16', '#E879F9'
      ],

      // map of bossId -> color (computed in computeMetrics)
      bossColorMap: {},

      // track previous values to detect changes
      previousMetrics: {
        totalPlays: 0,
        overallSuccessRate: 0,
        totalVictories: 0,
        totalFailures: 0,
        totalAbandoned: 0,
        avgAttempts: 0,
        avgTimeSeconds: 0
      },

      // track attempts distribution for animation control
      previousAttemptsDistribution: {},
      attemptsDataChanged: false,
      isAttemptsInitialRender: true,

      refreshIntervalMs: 3000,
      refreshTimer: null,
      observer: null
    }
  },
  mounted() {
    this.loadAnalytics()
    this.refreshTimer = setInterval(() => this.loadAnalytics(), this.refreshIntervalMs)
    // setup intersection observer for scroll animations
    this.setupScrollAnimations()
  },
  beforeUnmount() {
    this.destroyCharts()
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    // cleanup observer
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    setupScrollAnimations() {
      console.log('🔍 Setting up scroll animations...')
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            console.log('✨ Chart revealed:', entry.target.ref)
          }
        })
      }, options)

      // observe chart containers
      this.$nextTick(() => {
        if (this.$refs.successChartContainer) this.observer.observe(this.$refs.successChartContainer)
        if (this.$refs.difficultyChartContainer) this.observer.observe(this.$refs.difficultyChartContainer)
        if (this.$refs.attemptsChartContainer) this.observer.observe(this.$refs.attemptsChartContainer)
      })
    },

    async loadAnalytics() {
      try {
        console.log('🔄 Loading analytics data from Supabase...')

        const [
          { data: upData, error: upErr },
          { data: uiData, error: uiErr },
          { data: bData, error: bErr }
        ] = await Promise.all([
          supabase.from('userProgress').select('*'),
          supabase.from('userInfo').select('*'),
          supabase.from('bosses').select('*')
        ])

        if (upErr) throw upErr
        if (uiErr) console.warn('⚠️ userInfo load warning:', uiErr)
        if (bErr) console.warn('⚠️ bosses load warning:', bErr)

        this.userProgressData = upData || []
        this.userInfoData = uiData || []
        this.bossesData = bData || []

        // fetch usernames - need to get Credentials IDs from userInfo.userId, not from userProgress.userId
        const userIds = Array.from(new Set(this.userProgressData.map(r => r.userId).filter(Boolean)))
        console.log('👥 [loadAnalytics] userIds from userProgress:', userIds)
        
        // Extract the actual Credentials IDs from userInfo records
        const credentialIds = Array.from(new Set(
          this.userInfoData
            .filter(u => userIds.includes(Number(u.id))) // Only userInfo for users in userProgress
            .map(u => u.userId) // Get their userId (which is the Credentials.id)
            .filter(Boolean)
        ))
        console.log('🔑 [loadAnalytics] credentialIds to fetch:', credentialIds)
        
        if (credentialIds.length) {
          const { data: creds } = await supabase
            .from('Credentials')
            .select('id, username')
            .in('id', credentialIds)
          
          console.log('📋 [loadAnalytics] Credentials fetched:', creds)
          
          this.credentialsMap = (creds || []).reduce((m, c) => {
            m[c.id] = c.username
            return m
          }, {})
          
          console.log('🗺️ [loadAnalytics] credentialsMap:', this.credentialsMap)
        }

        this.computeMetrics()
        console.log('✅ Analytics loaded successfully')
      } catch (err) {
        console.error('❌ Error loading analytics:', err)
      } finally {
        this.loading = false
        // trigger animation if metrics changed
        if (this.hasMetricsChanged()) {
          console.log('📊 Metrics changed, triggering animation...')
          this.triggerMetricAnimation()
        }
      }
    },

    computeMetrics() {
      console.log('⚙️ [computeMetrics] Starting...')
      const up = this.userProgressData || []
      const bosses = this.bossesData || []

      console.log('⚙️ [computeMetrics] Data check:', {
        userProgressCount: up.length,
        bossesCount: bosses.length
      })

      // totalPlays = total number of attempts (each row = one attempt)
      this.totalPlays = up.length
      console.log('⚙️ [computeMetrics] totalPlays:', this.totalPlays)

      // avg attempts = group by userId+bossId, count how many attempts per boss challenge
      // calculate total attempts by counting attempts per boss attempt
      const attemptsByBossChallenge = {}
      up.forEach(r => {
        const key = `${r.userId}|${r.bossId}`
        attemptsByBossChallenge[key] = (attemptsByBossChallenge[key] || 0) + 1
      })
      
      const uniqueBossChallenges = Object.keys(attemptsByBossChallenge).length
      if (uniqueBossChallenges > 0) {
        const totalAttemptsSum = Object.values(attemptsByBossChallenge).reduce((sum, count) => sum + count, 0)
        this.avgAttempts = totalAttemptsSum / uniqueBossChallenges
      } else {
        this.avgAttempts = 0
      }
      console.log('⚙️ [computeMetrics] avgAttempts:', this.avgAttempts, 'from', uniqueBossChallenges, 'challenges')

      // avg time (use bestTime when available)
      const times = up.map(r => r.bestTime).filter(t => t !== null && t !== undefined)
      if (times.length > 0) {
        const totalTime = times.reduce((sum, v) => sum + Number(v), 0)
        this.avgTimeSeconds = Math.round(totalTime / times.length)
      } else {
        this.avgTimeSeconds = 0
      }

      // overall success rate (count rows where isDefeated, all rows are attempts now)
      const totalCompleted = up.filter(r => r.isDefeated || r.isFailed).length
      const totalWins = up.filter(r => r.isDefeated).length
      this.overallSuccessRate = totalCompleted > 0 
        ? Math.round((totalWins / totalCompleted) * 1000) / 10 
        : 0
      console.log('⚙️ [computeMetrics] Overall success:', {
        wins: totalWins,
        completed: totalCompleted,
        rate: this.overallSuccessRate
      })

      // outcome breakdown
      this.totalVictories = up.filter(r => r.isDefeated).length
      this.totalFailures = up.filter(r => r.isFailed).length
      this.totalAbandoned = up.filter(r => r.isAbandoned).length
      console.log('⚙️ [computeMetrics] Outcomes:', {
        victories: this.totalVictories,
        failures: this.totalFailures,
        abandoned: this.totalAbandoned
      })

      // success rates per boss (count rows, not summing attemptCount)
      const byBoss = {}
      up.forEach(r => {
        const id = r.bossId || 'unknown'
        if (!byBoss[id]) {
          byBoss[id] = { total: 0, wins: 0 }
        }
        byBoss[id].total += 1  // each row is one attempt
        if (r.isDefeated) {
          byBoss[id].wins += 1
        }
      })

      this.successRatesByBoss = {}
      Object.keys(byBoss).forEach(id => {
        const stat = byBoss[id]
        this.successRatesByBoss[id] = stat.total > 0 
          ? Math.round((stat.wins / stat.total) * 100) 
          : 0
      })
      console.log('⚙️ [computeMetrics] Success rates per boss:', this.successRatesByBoss)

      // difficulty distribution from bosses table
      this.difficultyCounts = {}
      bosses.forEach(b => {
        const d = b.difficulty || 'unknown'
        this.difficultyCounts[d] = (this.difficultyCounts[d] || 0) + 1
      })

      // fastest solvers (use bestTime)
      const solved = up.filter(r => r.bestTime !== null && r.bestTime !== undefined)
      solved.sort((a, b) => Number(a.bestTime) - Number(b.bestTime))
      
      this.fastestSolvers = solved.slice(0, 5).map(r => {
        const boss = bosses.find(b => b.id === r.bossId)
        // userProgress.userId -> userInfo.id -> userInfo.userId -> Credentials.username
        const userInfo = this.userInfoData.find(u => Number(u.id) === Number(r.userId))
        const username = userInfo && userInfo.userId ? this.credentialsMap[userInfo.userId] : `User #${r.userId}`
        
        console.log(`👤 [fastestSolvers] userId: ${r.userId} -> userInfo.userId: ${userInfo?.userId} -> username: "${username}"`)
        
        return {
          name: username,
          boss: boss ? boss.name : `Boss #${r.bossId}`,
          time: this.formatDurationSeconds(Number(r.bestTime))
        }
      })

      // most defeats per user
      const defeatsByUser = {}
      up.forEach(r => {
        if (r.isDefeated) {
          defeatsByUser[r.userId] = (defeatsByUser[r.userId] || 0) + 1
        }
      })

      const defeatsArr = Object.keys(defeatsByUser).map(uid => ({
        userId: uid,
        defeats: defeatsByUser[uid]
      }))
      defeatsArr.sort((a, b) => b.defeats - a.defeats)

      this.mostDefeats = defeatsArr.slice(0, 5).map(d => {
        // userProgress.userId -> userInfo.id -> userInfo.userId -> Credentials.username
        const info = this.userInfoData.find(u => Number(u.id) === Number(d.userId)) || {}
        const username = info?.userId ? this.credentialsMap[info.userId] : `User #${d.userId}`
        
        console.log(`👤 [mostDefeats] userId: ${d.userId} -> userInfo.userId: ${info?.userId} -> username: "${username}"`)
        
        return {
          name: username,
          defeats: d.defeats,
          level: info.level || '—'
        }
      })

      // attempts distribution - group by userId+bossId, count total attempts per challenge
      // include all attempts regardless of outcome (defeated, failed, abandoned)
      const dist = { '1': 0, '2-3': 0, '4-5': 0, '6-10': 0, '11+': 0 }
      const bossChallenges = {}
      
      up.forEach(r => {
        const key = `${r.userId}|${r.bossId}`
        if (!bossChallenges[key]) {
          bossChallenges[key] = 0
        }
        bossChallenges[key] += 1  // count each row as one attempt
      })
      
      // categorize each boss challenge by total attempts
      Object.values(bossChallenges).forEach(attemptCount => {
        if (attemptCount === 1) dist['1']++
        else if (attemptCount <= 3) dist['2-3']++
        else if (attemptCount <= 5) dist['4-5']++
        else if (attemptCount <= 10) dist['6-10']++
        else dist['11+']++
      })
      this.attemptsDistribution = dist
      console.log('⚙️ [computeMetrics] Attempts distribution (all outcomes):', dist)
      
      // check if attempts distribution changed for animation control
      this.attemptsDataChanged = JSON.stringify(dist) !== JSON.stringify(this.previousAttemptsDistribution)
      console.log('🔄 [computeMetrics] Attempts distribution changed:', this.attemptsDataChanged)

      // assign colors to bosses for consistent UI (uses shared palette)
      this.bossColorMap = {}
      bosses.forEach((b, i) => {
        this.bossColorMap[b.id] = this.paletteColors[i % this.paletteColors.length]
      })

      // update charts after DOM is fully rendered (nested nextTick for safety)
      console.log('⚙️ [computeMetrics] Scheduling chart update via nested $nextTick...')
      this.$nextTick(() => {
        console.log('⚙️ [computeMetrics] First $nextTick complete, scheduling second...')
        this.$nextTick(() => {
          console.log('⚙️ [computeMetrics] Second $nextTick complete, calling updateCharts()')
          this.updateCharts()
          
          // store current metrics for change detection on next refresh
          this.previousMetrics = {
            totalPlays: this.totalPlays,
            overallSuccessRate: this.overallSuccessRate,
            totalVictories: this.totalVictories,
            totalFailures: this.totalFailures,
            totalAbandoned: this.totalAbandoned,
            avgAttempts: this.avgAttempts,
            avgTimeSeconds: this.avgTimeSeconds
          }
          this.previousAttemptsDistribution = JSON.parse(JSON.stringify(this.attemptsDistribution))
          console.log('⚙️ [computeMetrics] Metrics snapshot saved for change detection')
        })
      })
    },

    hasMetricsChanged() {
      return (
        this.totalPlays !== this.previousMetrics.totalPlays ||
        this.overallSuccessRate !== this.previousMetrics.overallSuccessRate ||
        this.totalVictories !== this.previousMetrics.totalVictories ||
        this.totalFailures !== this.previousMetrics.totalFailures ||
        this.totalAbandoned !== this.previousMetrics.totalAbandoned ||
        this.avgAttempts !== this.previousMetrics.avgAttempts ||
        this.avgTimeSeconds !== this.previousMetrics.avgTimeSeconds
      )
    },

    triggerMetricAnimation() {
      console.log('✨ [triggerMetricAnimation] Animating metric cards...')
      const cards = document.querySelectorAll('.metric-card')
      cards.forEach(card => {
        card.classList.remove('updating')
        // force reflow to restart animation
        void card.offsetWidth
        card.classList.add('updating')
        
        // remove animation class after it completes
        setTimeout(() => {
          card.classList.remove('updating')
        }, 600)
      })
    },

    updateCharts() {
      try {
        console.log('=' * 50)
        console.log('📊 [updateCharts] MAIN ENTRY POINT')
        console.log('=' * 50)
        
        const bosses = Array.isArray(this.bossesData) ? this.bossesData : []
        
        console.log('📊 [updateCharts] All refs status:')
        console.log('  - successChart:', !!this.$refs.successChart)
        console.log('  - difficultyChart:', !!this.$refs.difficultyChart)
        console.log('  - attemptsChart:', !!this.$refs.attemptsChart)
        console.log('  - bosses count:', bosses.length)
        console.log('  - charts state:', {
          success: !!this.charts.success,
          difficulty: !!this.charts.difficulty,
          attempts: !!this.charts.attempts
        })

        // Success chart (boss success rates)
        console.log('📊 [updateCharts] Calling updateSuccessChart...')
        this.updateSuccessChart(bosses)

        // Difficulty chart (doughnut)
        console.log('📊 [updateCharts] Calling updateDifficultyChart...')
        this.updateDifficultyChart()

        // Attempts chart (bar)
        console.log('📊 [updateCharts] Calling updateAttemptsChart...')
        this.updateAttemptsChart()

        console.log('✅ [updateCharts] All chart update calls completed')
      } catch (e) {
        console.error('❌ [updateCharts] Fatal error:', e.message)
        console.error('❌ [updateCharts] Stack:', e.stack)
      }
    },

    updateSuccessChart(bosses) {
      console.log('📈 [updateSuccessChart] Starting...')
      console.log('📈 [updateSuccessChart] Refs check:', {
        ref: !!this.$refs.successChart,
        refType: this.$refs.successChart ? this.$refs.successChart.constructor.name : 'null'
      })
      
      if (!this.$refs.successChart) {
        console.error('❌ [updateSuccessChart] ref not found!')
        return
      }

      console.log('📈 [updateSuccessChart] bosses:', bosses.length)
      const successLabels = bosses.map(b => b.name)
      const successData = bosses.map(b => this.successRatesByBoss[b.id] || 0)
      const successColors = bosses.map((b, i) => this.paletteColors[i % this.paletteColors.length])
      console.log('📈 [updateSuccessChart] Labels:', successLabels)
      console.log('📈 [updateSuccessChart] Data:', successData)
      console.log('📈 [updateSuccessChart] Colors:', successColors)

      // Always destroy and recreate the success chart to avoid canvas issues
      if (this.charts.success) {
        console.log('📈 [updateSuccessChart] Destroying old chart...')
        try {
          this.charts.success.destroy()
          this.charts.success = null
        } catch (e) {
          console.error('❌ [updateSuccessChart] Error destroying chart:', e.message)
        }
      }

      console.log('📈 [updateSuccessChart] Creating new chart...')
      try {
        const ctx = this.$refs.successChart.getContext('2d')
        console.log('📈 [updateSuccessChart] Context created:', !!ctx, ctx?.constructor.name)
        
        if (!ctx) {
          console.error('❌ [updateSuccessChart] Failed to get 2d context')
          return
        }
        
        console.log('📈 [updateSuccessChart] Instantiating Chart...')
        this.charts.success = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: successLabels,
            datasets: [{
              label: 'Success %',
              data: successData,
              backgroundColor: successColors
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            },
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#94a3b8' }
              },
              x: {
                ticks: { color: '#94a3b8' }
              }
            }
          }
        })
        console.log('✅ [updateSuccessChart] Chart created:', !!this.charts.success)
        
        // Force resize event to trigger animation
        this.$nextTick(() => {
          window.dispatchEvent(new Event('resize'))
          console.log('🔄 [updateSuccessChart] Resize event triggered for animation')
        })
      } catch (e) {
        console.error('❌ [updateSuccessChart] Creation error:', e.message)
        console.error('❌ [updateSuccessChart] Stack:', e.stack)
      }
    },

    updateDifficultyChart() {
      console.log('🥧 [updateDifficultyChart] Starting...')
      console.log('🥧 [updateDifficultyChart] Refs check:', {
        ref: !!this.$refs.difficultyChart,
        refType: this.$refs.difficultyChart ? this.$refs.difficultyChart.constructor.name : 'null'
      })
      
      if (!this.$refs.difficultyChart) {
        console.error('❌ [updateDifficultyChart] ref not found!')
        return
      }

      console.log('🥧 [updateDifficultyChart] difficultyCounts:', this.difficultyCounts)
      const diffLabels = Object.keys(this.difficultyCounts)
      const diffData = diffLabels.map(k => this.difficultyCounts[k])
      const diffColors = diffLabels.map((_, i) => this.paletteColors[i % this.paletteColors.length])
      console.log('🥧 [updateDifficultyChart] Labels:', diffLabels)
      console.log('🥧 [updateDifficultyChart] Data:', diffData)
      console.log('🥧 [updateDifficultyChart] Colors:', diffColors)

      // Always destroy and recreate the difficulty chart to avoid canvas issues
      if (this.charts.difficulty) {
        console.log('🥧 [updateDifficultyChart] Destroying old chart...')
        try {
          this.charts.difficulty.destroy()
          this.charts.difficulty = null
        } catch (e) {
          console.error('❌ [updateDifficultyChart] Error destroying chart:', e.message)
        }
      }

      console.log('🥧 [updateDifficultyChart] Creating new chart...')
      try {
        const ctx = this.$refs.difficultyChart.getContext('2d')
        console.log('🥧 [updateDifficultyChart] Context created:', !!ctx, ctx?.constructor.name)
        
        if (!ctx) {
          console.error('❌ [updateDifficultyChart] Failed to get 2d context')
          return
        }
        
        console.log('🥧 [updateDifficultyChart] Instantiating Chart...')
        this.charts.difficulty = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: diffLabels,
            datasets: [{
              data: diffData,
              backgroundColor: diffColors
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#94a3b8' }
              }
            }
          }
        })
        console.log('✅ [updateDifficultyChart] Chart created:', !!this.charts.difficulty)
        
        // Force resize event to trigger animation
        this.$nextTick(() => {
          window.dispatchEvent(new Event('resize'))
          console.log('🔄 [updateDifficultyChart] Resize event triggered for animation')
        })
      } catch (e) {
        console.error('❌ [updateDifficultyChart] Creation error:', e.message)
        console.error('❌ [updateDifficultyChart] Stack:', e.stack)
      }
    },

    updateAttemptsChart() {
      console.log('📊 [updateAttemptsChart] Starting...')
      
      // Check if data changed or first render
      const shouldAnimate = this.isAttemptsInitialRender || this.attemptsDataChanged
      console.log('📊 [updateAttemptsChart] shouldAnimate:', shouldAnimate, '(isInitial:', this.isAttemptsInitialRender, ', dataChanged:', this.attemptsDataChanged, ')')
      
      console.log('📊 [updateAttemptsChart] Refs check:', {
        ref: !!this.$refs.attemptsChart,
        refType: this.$refs.attemptsChart ? this.$refs.attemptsChart.constructor.name : 'null'
      })
      
      if (!this.$refs.attemptsChart) {
        console.error('❌ [updateAttemptsChart] ref not found!')
        return
      }

      console.log('📊 [updateAttemptsChart] attemptsDistribution:', this.attemptsDistribution)
      const attLabels = ['1', '2-3', '4-5', '6-10', '11+']
      const attData = attLabels.map(k => this.attemptsDistribution[k] || 0)
      const attColors = ['#60A5FA', '#34D399', '#F59E0B', '#F97316', '#EF4444']
      console.log('📊 [updateAttemptsChart] Labels:', attLabels)
      console.log('📊 [updateAttemptsChart] Data:', attData)
      console.log('📊 [updateAttemptsChart] Colors:', attColors)

      // Always destroy and recreate the attempts chart to avoid canvas issues
      if (this.charts.attempts) {
        console.log('📊 [updateAttemptsChart] Destroying old chart...')
        try {
          this.charts.attempts.destroy()
          this.charts.attempts = null
        } catch (e) {
          console.error('❌ [updateAttemptsChart] Error destroying chart:', e.message)
        }
      }

      console.log('📊 [updateAttemptsChart] Creating new chart...')
      try {
        const ctx = this.$refs.attemptsChart.getContext('2d')
        console.log('📊 [updateAttemptsChart] Context created:', !!ctx, ctx?.constructor.name)
        
        if (!ctx) {
          console.error('❌ [updateAttemptsChart] Failed to get 2d context')
          return
        }
        
        console.log('📊 [updateAttemptsChart] Instantiating Chart...')
        this.charts.attempts = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: attLabels,
            datasets: [{
              label: 'Attempts',
              data: attData,
              backgroundColor: attColors
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: shouldAnimate ? {
              duration: 2000,
              easing: 'easeInOutQuart'
            } : false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8' }
                },
                x: {
                  ticks: {
                    maxRotation: 0,
                    color: '#94a3b8'
                  },
                  grid: { display: false }
                }
              }
            }
          })
          console.log('✅ [updateAttemptsChart] Chart created:', !!this.charts.attempts)
          
          // Only trigger resize if animating
          if (shouldAnimate) {
            this.$nextTick(() => {
              window.dispatchEvent(new Event('resize'))
              console.log('🔄 [updateAttemptsChart] Resize event triggered for animation')
            })
          }
          
          // Mark initial render as complete
          if (this.isAttemptsInitialRender) {
            this.isAttemptsInitialRender = false
            console.log('📊 [updateAttemptsChart] Marked initial render complete')
          }
      } catch (e) {
        console.error('❌ [updateAttemptsChart] Creation error:', e.message)
        console.error('❌ [updateAttemptsChart] Stack:', e.stack)
      }
    },

    destroyCharts() {
      try {
        if (this.charts.success) {
          this.charts.success.destroy()
          this.charts.success = null
        }
        if (this.charts.difficulty) {
          this.charts.difficulty.destroy()
          this.charts.difficulty = null
        }
        if (this.charts.attempts) {
          this.charts.attempts.destroy()
          this.charts.attempts = null
        }
      } catch (e) {
        console.error('Error destroying charts:', e)
      }
    },

    formatDurationSeconds(sec) {
      if (sec === null || sec === undefined) return '—'
      const s = Math.round(Number(sec))
      if (s < 60) return `${s}s`
      const m = Math.floor(s / 60)
      const r = s % 60
      return `${m}m ${r}s`
    },

    difficultyPercent(count) {
      const total = this.bossesData.length || 1
      return Math.round((count / total) * 100)
    },

    formatNumber(value, digits = 1) {
      if (value === null || value === undefined || Number.isNaN(value)) return '—'
      return Number(value).toFixed(digits)
    }
  }
}
</script>

<style scoped>
/* Chart reveal animation on scroll */
.chart-reveal {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.chart-reveal.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Stagger animation for metrics cards */
.metric-card {
  animation: slideUp 0.5s ease-out backwards;
}

.metric-card:nth-child(1) { animation-delay: 0.1s; }
.metric-card:nth-child(2) { animation-delay: 0.2s; }
.metric-card:nth-child(3) { animation-delay: 0.3s; }
.metric-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse animation for loading */
.loading-pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes valueChange {
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

/* Animate metric card values when they change */
.metric-card p:nth-child(2) {
  transition: color 0.3s ease-out;
}

.metric-card.updating p:nth-child(2) {
  animation: valueChange 0.6s ease-out;
}
</style>