<template>
  <div class="quest-container">
    <!-- Dragon Ride Video Overlay (Skippable) -->
    <div v-if="showDragonVideo" class="dragon-video-overlay" @click="skipDragonVideo">
      <video 
        ref="dragonVideoRef"
        class="dragon-video"
        autoplay
        @ended="dragonVideoEnded">
        <source src="/Pixel_Art_Dragon_Ride_Video.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <p class="skip-text">PRESS TO SKIP</p>
    </div>

    <!-- Background video (Dynamic based on location) -->
    <video 
      ref="bossVideoRef"
      class="background-video"
      :class="{ 'fade-in-video': !showDragonVideo }"
      autoplay
      muted
      loop
      playsinline>
      <source :src="backgroundVideo" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <!-- Trainer Battle Music Audio -->
    <audio ref="trainerBattleAudio" loop>
      <source src="/Pokémon Ruby, Sapphire & Emerald - Trainer Battle Music (HQ).mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>

    <!-- Main UI -->
    <div v-if="!showDragonVideo" class="quest-content fade-in">
      <!-- Back Button -->
      <button class="back-button" @click="goBack">← BACK</button>

      <!-- Audio Mute Toggle (for non-capital locations) -->
      <button 
        v-if="locationKey !== 'capital'"
        class="audio-toggle" 
        @click.stop="toggleTrainerBattleAudio">
        {{ isTrainerAudioMuted ? '🔇' : '🔊' }}
      </button>

      <!-- Title (Dynamic based on location) -->
      <div class="title-overlay">
        <h1>{{ locations[locationKey].title }}</h1>
        <p>{{ locations[locationKey].description.split('.')[0] }}.</p>
      </div>

      <!-- Player Stats Panel -->
      <div class="player-stats">
        <div class="stat-item">
          <span class="stat-label">LVL</span>
          <span class="stat-value">{{ playerLevel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">EXP</span>
          <span class="stat-value">{{ playerExp }}/{{ expToNextLevel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">GOLD</span>
          <span class="stat-value">{{ playerGold }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">HP</span>
          <span class="stat-value">{{ playerHp }}/{{ playerHp }}</span>
        </div>
      </div>

      <!-- Content Placeholder -->
      <div class="content-placeholder">
        <h2>AVAILABLE CHALLENGES</h2>
        <div v-if="bosses.length === 0" class="no-bosses">
          <p>No challenges available yet</p>
        </div>
        <div v-else class="bosses-list">
          <div v-for="boss in bosses" :key="boss.id" class="boss-card">
            <h3>{{ boss.name }}</h3>
            <p>{{ boss.description }}</p>
            <div class="boss-stats">
              <span class="difficulty" :class="boss.difficulty">{{ boss.difficulty }}</span>
              <span class="rewards">⭐ +{{ boss.rewardXp }} XP | 💰 +{{ boss.rewardGold }} Gold</span>
            </div>
            <button class="challenge-button" @click="startChallenge(boss)">START CHALLENGE</button>
          </div>
        </div>
      </div>

      <!-- Challenge Modal Overlay -->
      <div v-if="showChallengeModal" class="challenge-modal-backdrop" @click="closeChallengeModal">
        <div class="challenge-modal" @click.stop>
          <!-- Close Button -->
          <button class="modal-close-button" @click="closeChallengeModal">✕</button>

          <!-- Challenge Header -->
          <div class="modal-challenge-header">
            <h1>⚔️ {{ selectedBoss.name }}</h1>
            <p class="modal-difficulty" :class="selectedBoss.difficulty">{{ selectedBoss.difficulty.toUpperCase() }}</p>
          </div>

          <!-- Two Column Layout: Problem & Code Editor -->
          <div class="modal-challenge-layout">
            <!-- LEFT: Problem Description -->
            <div class="modal-problem-panel">
              <h2>PROBLEM</h2>
              <div class="modal-problem-content">
                <p>{{ selectedBoss.description }}</p>
                <div class="modal-initial-code-box">
                  <h3>START WITH THIS CODE:</h3>
                  <pre><code>{{ formatCode(selectedBoss.initialCode) }}</code></pre>
                </div>
                
                <!-- Test Cases Preview -->
                <div v-if="selectedBoss.testCases && selectedBoss.testCases.length > 0" class="modal-test-cases">
                  <h3>TEST CASES:</h3>
                  <div class="modal-test-case-item" v-for="(test, idx) in selectedBoss.testCases" :key="idx">
                    <small>Input: <code>{{ test.input }}</code></small>
                    <small>Expected: <code>{{ test.expectedOutput }}</code></small>
                  </div>
                </div>

                <!-- Hints -->
                <div v-if="selectedBoss.hints && Array.isArray(selectedBoss.hints) && selectedBoss.hints.length > 0" class="modal-hints-section">
                  <h3>HINTS:</h3>
                  <div class="modal-hints-buttons">
                    <button 
                      v-for="(hint, i) in selectedBoss.hints" 
                      :key="'hint-btn-' + i"
                      class="modal-hint-button"
                      @click="toggleHint(i)">
                      {{ hintsRevealed[i] ? '✓ HINT ' + (i + 1) : '? HINT ' + (i + 1) }}
                    </button>
                  </div>
                  <template v-for="(hint, i) in selectedBoss.hints" :key="'hint-text-' + i">
                    <div v-if="hintsRevealed[i]" class="modal-hint-text">
                      💡 {{ hint }}
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- RIGHT: Code Editor -->
            <div class="modal-code-panel">
              <h2>YOUR SOLUTION</h2>
              
              <!-- HP Bar -->
              <div class="modal-hp-section">
                <div class="modal-hp-label">
                  <span>QUEST HP:</span>
                  <span class="modal-hp-text">{{ currentQuestHp }}/{{ questStartHp }}</span>
                </div>
                <div class="modal-hp-bar-container">
                  <div class="modal-hp-bar" :style="{ width: (currentQuestHp / questStartHp) * 100 + '%' }"></div>
                </div>
                <!-- Damage Message -->
                <div v-if="damageMessage" class="modal-damage-message" :class="{ 'damage-animation': damageAnimation }">
                  {{ damageMessage }}
                </div>
              </div>
              
              <textarea 
                v-model="userCode"
                class="modal-code-editor"
                placeholder="Write your code here..."></textarea>
              
              <!-- Action Buttons -->
              <div class="modal-action-buttons">
                <button class="modal-format-button" @click="formatUserCode">
                  ✨ FORMAT
                </button>
                <button class="modal-submit-button" @click="submitCode">
                  🎯 SUBMIT
                </button>
                <button class="modal-reset-button" @click="resetCode">
                  🔄 RESET
                </button>
              </div>

              <!-- Submission Result -->
              <div v-if="submissionResult" class="modal-submission-result" :class="submissionResult.status">
                <h3>{{ submissionResult.message }}</h3>
                <p v-if="submissionResult.details">{{ submissionResult.details }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Congratulations Modal -->
      <div v-if="showCongratulations" class="congratulations-modal-backdrop">
        <div class="congratulations-modal">
          <div class="congrats-content">
            <h1 class="congrats-title">🎉 CHALLENGE COMPLETE! 🎉</h1>
            <p class="congrats-boss">{{ selectedBoss.name }}</p>
            <div class="congrats-rewards">
              <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <span class="reward-text">+{{ congratsData.xpEarned }} XP</span>
              </div>
              <div class="reward-item">
                <span class="reward-icon">💰</span>
                <span class="reward-text">+{{ congratsData.goldEarned }} GOLD</span>
              </div>
            </div>
            <button class="congrats-button" @click="continueBattle">↳ CONTINUE</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../library/supabase'
import { isoWithOffset } from '../library/time'

export default {
  name: 'QuestModal',
  props: {
    locationKey: {
      type: String,
      required: true
    },
    locations: {
      type: Object,
      required: true
    },
    backgroundVideo: {
      type: String,
      default: '/Retro_RPG_Boss_Battle_Video_Generation.mp4'
    }
  },
  data() {
    return {
      playerLevel: 1,
      playerExp: 0,
      expToNextLevel: 100,
      playerGold: 0,
      playerHp: 100,
      maxHp: 100,
      currentUsername: null,
      bosses: [],
      showChallengeModal: false,
      showDragonVideo: true,
      selectedBoss: null,
      userCode: '',
      submissionResult: null,
      hintsRevealed: {},
      showCongratulations: false,
      congratsData: {
        xpEarned: 0,
        goldEarned: 0
      },
      questStartHp: 100,
      currentQuestHp: 100,
      damageMessage: null,
      damageAnimation: false,
      challengeStartTime: null,
      challengeSubmitTime: null,
      isTrainerAudioMuted: false
    }
  },
  mounted() {
    this.currentUsername = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'Guest'
    console.log('✓ Retrieved username from localStorage:', this.currentUsername)
    
    // Stop map background audio and fade it out
    const mapAudio = document.querySelector('audio')
    if (mapAudio) {
      console.log('🔊 Stopping map audio...')
      const fadeOutInterval = setInterval(() => {
        if (mapAudio.volume > 0) {
          mapAudio.volume = Math.max(0, mapAudio.volume - 0.05)
        } else {
          mapAudio.pause()
          clearInterval(fadeOutInterval)
          console.log('✓ Map audio stopped')
        }
      }, 50)
    }

    // Start dragon video audio fade in
    setTimeout(() => {
      const dragonVideo = this.$refs.dragonVideoRef
      if (dragonVideo) {
        dragonVideo.volume = 0
        dragonVideo.muted = false
        const fadeInInterval = setInterval(() => {
          if (dragonVideo.volume < 1) {
            dragonVideo.volume = Math.min(1, dragonVideo.volume + 0.05)
          } else {
            clearInterval(fadeInInterval)
            console.log('✓ Dragon video audio faded in')
          }
        }, 50)
      }
    }, 300)
    
    this.fetchPlayerStats()
    this.fetchLocationBosses()
  },
  methods: {
    skipDragonVideo() {
      console.log('⏭️ Skipping dragon video')
      this.dragonVideoEnded()
    },
    dragonVideoEnded() {
      console.log('🎬 Dragon video ended, fading out audio and showing boss battle')
      
      // Fade out dragon video audio
      const dragonVideo = this.$refs.dragonVideoRef
      if (dragonVideo) {
        const fadeOutInterval = setInterval(() => {
          if (dragonVideo.volume > 0) {
            dragonVideo.volume = Math.max(0, dragonVideo.volume - 0.05)
          } else {
            dragonVideo.muted = true
            this.showDragonVideo = false
            clearInterval(fadeOutInterval)
            console.log('✓ Dragon video hidden')
            
            // Unmute boss video and fade in its audio
            this.fadeInBossVideoAudio()
          }
        }, 50)
      } else {
        this.showDragonVideo = false
        // Unmute boss video and fade in its audio
        this.fadeInBossVideoAudio()
      }
    },
    fadeInBossVideoAudio() {
      console.log('🔊 Fading in boss video audio')
      const bossVideo = this.$refs.bossVideoRef
      if (bossVideo) {
        // Start with volume at 0
        bossVideo.volume = 0
        bossVideo.muted = false
        
        // Fade in the audio over 2 seconds (to 70% volume)
        const fadeInInterval = setInterval(() => {
          if (bossVideo.volume < 0.7) {
            bossVideo.volume = Math.min(0.7, bossVideo.volume + 0.035)
          } else {
            clearInterval(fadeInInterval)
            console.log('✓ Boss video audio fully faded in')
          }
        }, 50)
      }
      
      // For non-capital locations, also start the trainer battle music
      if (this.locationKey !== 'capital') {
        console.log('🎵 Starting trainer battle music for non-capital location')
        this.playTrainerBattleAudio()
      }
    },
    playTrainerBattleAudio() {
      const trainerAudio = this.$refs.trainerBattleAudio
      if (trainerAudio) {
        // Start with volume at 0
        trainerAudio.volume = 0
        trainerAudio.muted = false
        trainerAudio.play().catch(error => {
          console.log("Trainer battle audio play failed:", error)
        })
        
        // Fade in the audio over 2 seconds (to 70% volume)
        const fadeInInterval = setInterval(() => {
          if (trainerAudio.volume < 0.7) {
            trainerAudio.volume = Math.min(0.7, trainerAudio.volume + 0.035)
          } else {
            clearInterval(fadeInInterval)
            console.log('✓ Trainer battle audio fully faded in')
          }
        }, 50)
      }
    },
    toggleTrainerBattleAudio() {
      this.isTrainerAudioMuted = !this.isTrainerAudioMuted
      const trainerAudio = this.$refs.trainerBattleAudio
      if (trainerAudio) {
        trainerAudio.muted = this.isTrainerAudioMuted
        // If unmuting and audio is paused, try to play
        if (!this.isTrainerAudioMuted && trainerAudio.paused) {
          trainerAudio.play().catch(() => {})
        }
      }
      console.log('🔊 Trainer battle audio', this.isTrainerAudioMuted ? 'muted' : 'unmuted')
    },
    async fetchPlayerStats() {
      try {
        console.log('📊 Fetching player stats for:', this.currentUsername)
        
        const { data: credData, error: credError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .maybeSingle()
        
        if (credError) {
          console.error('❌ Error fetching from Credentials:', credError)
          return
        }

        if (!credData) {
          console.warn('⚠️ User not found in Credentials table:', this.currentUsername)
          return
        }

        const credentialsId = credData.id
        console.log('✓ Found Credentials ID:', credentialsId)

        const { data: userInfo, error: userInfoError } = await supabase
          .from('userInfo')
          .select('id, level, xp, gold, hp')
          .eq('userId', credentialsId)
          .single()
        
        if (userInfoError) {
          console.error('❌ Error fetching userInfo:', userInfoError)
          return
        }

        if (userInfo) {
          this.playerLevel = userInfo.level || 1
          this.playerExp = userInfo.xp || 0
          this.playerGold = userInfo.gold || 0
          this.playerHp = userInfo.hp || 100
          console.log('✓ Player stats loaded:', {level: this.playerLevel, xp: this.playerExp, gold: this.playerGold, hp: this.playerHp})
        }
      } catch (err) {
        console.error('❌ Error fetching player stats:', err)
      }
    },
    async fetchLocationBosses() {
      try {
        const dbLocation = this.locations[this.locationKey].dbLocation
        console.log('📍 Fetching bosses for location:', dbLocation)
        
        const { data, error } = await supabase
          .from('bosses')
          .select('*')
          .eq('location', dbLocation)
          .order('created_at', { ascending: true })
        
        if (error) throw error
        this.bosses = data || []
        console.log('Loaded bosses for', dbLocation, ':', this.bosses)
      } catch (err) {
        console.error('Error loading bosses:', err)
        this.bosses = []
      }
    },
    startChallenge(boss) {
      console.log('Starting challenge:', boss.name)
      this.selectedBoss = boss
      // Clean the initial code by converting escape sequences to actual characters
      const cleanedCode = (boss.initialCode || '')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
      this.userCode = cleanedCode
      this.submissionResult = null
      this.hintsRevealed = {}
      
      this.questStartHp = this.playerHp
      this.currentQuestHp = this.playerHp
      this.damageMessage = null
      this.challengeStartTime = isoWithOffset()
      this.challengeSubmitTime = null
      console.log('💾 Quest HP saved:', this.questStartHp)
      console.log('⏱️ Challenge started at:', this.challengeStartTime)
      
      if (boss.hints) {
        if (typeof boss.hints === 'string') {
          try {
            this.selectedBoss.hints = JSON.parse(boss.hints)
          } catch (e) {
            this.selectedBoss.hints = []
          }
        }
        
        if (Array.isArray(this.selectedBoss.hints)) {
          this.selectedBoss.hints.forEach((_, idx) => {
            this.hintsRevealed[idx] = false
          })
        }
      }
      
      if (boss.testCases && typeof boss.testCases === 'string') {
        try {
          this.selectedBoss.testCases = JSON.parse(boss.testCases)
        } catch (e) {
          this.selectedBoss.testCases = []
        }
      }
      
      this.showChallengeModal = true
    },
    async closeChallengeModal() {
      // User pressed X button - mark as abandoned
      console.log('❌ Challenge abandoned! Recording in database...')
      await this.recordChallengeOutcome('abandoned')
      
      this.showChallengeModal = false
      this.selectedBoss = null
      this.userCode = ''
      this.submissionResult = null
      this.hintsRevealed = {}
    },
    toggleHint(idx) {
      this.hintsRevealed = {
        ...this.hintsRevealed,
        [idx]: !this.hintsRevealed[idx]
      }
    },
    formatUserCode() {
      if (!this.userCode.trim()) {
        return
      }
      
      let code = this.userCode
      let formatted = ''
      let indentLevel = 0
      
      // Process character by character
      for (let i = 0; i < code.length; i++) {
        const char = code[i]
        const nextChar = code[i + 1] || ''
        
        if (char === '{' || char === '[') {
          formatted += char + '\n'
          indentLevel++
          // Add indent for next line
          for (let j = 0; j < indentLevel; j++) formatted += '  '
        } else if (char === '}' || char === ']') {
          // Remove last indent if at start of line
          if (formatted.slice(-2) === '  ') {
            formatted = formatted.slice(0, -2)
          }
          indentLevel = Math.max(0, indentLevel - 1)
          formatted += char + '\n'
          // Add indent for next line if not at end
          if (i < code.length - 1) {
            for (let j = 0; j < indentLevel; j++) formatted += '  '
          }
        } else if (char === ';') {
          formatted += char + '\n'
          // Add indent for next line
          for (let j = 0; j < indentLevel; j++) formatted += '  '
        } else if (char === '\n') {
          // Skip multiple newlines
          if (formatted.slice(-1) !== '\n') {
            formatted += '\n'
            for (let j = 0; j < indentLevel; j++) formatted += '  '
          }
        } else if (char === ' ' && formatted.slice(-1) === ' ') {
          // Skip multiple spaces
          continue
        } else {
          formatted += char
        }
      }
      
      this.userCode = formatted.trim()
      console.log('✨ Code formatted successfully')
    },
    resetCode() {
      if (this.selectedBoss) {
        // Clean the initial code by converting escape sequences to actual characters
        const cleanedCode = (this.selectedBoss.initialCode || '')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
        this.userCode = cleanedCode
        this.submissionResult = null
      }
    },
    async submitCode() {
      if (!this.userCode.trim()) {
        this.submissionResult = {
          status: 'error',
          message: 'ERROR: Code cannot be empty!'
        }
        return
      }

      try {
        this.submissionResult = {
          status: 'pending',
          message: 'TESTING CODE...',
          details: 'Running your code against test cases...'
        }

        const testResults = await this.validateCode()
        console.log('✓ Test results received:', testResults)

        if (testResults.allPassed) {
          console.log('✓ All tests passed! Showing success message and saving progress...')
          
          this.submissionResult = {
            status: 'success',
            message: 'ALL TESTS PASSED! ✓',
            details: 'Congratulations! You earned ' + this.selectedBoss.rewardXp + ' XP and ' + this.selectedBoss.rewardGold + ' Gold'
          }

          setTimeout(async () => {
            console.log('⏳ Calling saveProgress after delay...')
            await this.saveProgress()
          }, 1500)
        } else {
          console.log('✗ Tests failed:', testResults.failedTests, 'out of', testResults.totalTests)
          
          const difficultyMap = {
            'beginner': 10,
            'intermediate': 20,
            'advanced': 30,
            'medium': 25,
            'hard': 50,
            'extreme': 100
          }
          // Normalize difficulty to lowercase for comparison
          const normalizedDifficulty = (this.selectedBoss.difficulty || '').toLowerCase()
          const hpDeduction = difficultyMap[normalizedDifficulty] || 10
          
          console.log('Boss difficulty:', this.selectedBoss.difficulty, '| HP Deduction:', hpDeduction)
          
          this.currentQuestHp -= hpDeduction
          
          this.damageMessage = `-${hpDeduction} HP`
          this.damageAnimation = true
          setTimeout(() => {
            this.damageAnimation = false
          }, 500)
          
          console.log('💔 HP deducted:', hpDeduction, '| Remaining quest HP:', this.currentQuestHp)
          
          if (this.currentQuestHp <= 0) {
            console.log('💀 QUEST FAILED! HP dropped to 0')
            this.submissionResult = {
              status: 'error',
              message: 'QUEST FAILED! ✗',
              details: 'Your HP dropped to 0. Returning to map...'
            }
            
            setTimeout(async () => {
              await this.questFailed()
            }, 1500)
          } else {
            this.submissionResult = {
              status: 'error',
              message: 'TESTS FAILED ✗',
              details: 'Failed: ' + testResults.failedTests + ' out of ' + testResults.totalTests + ' tests. Keep trying! (Quest HP: ' + this.currentQuestHp + '/' + this.questStartHp + ')'
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in submitCode:', error)
        this.submissionResult = {
          status: 'error',
          message: 'SUBMISSION ERROR',
          details: error.message
        }
      }
    },
    validateCode() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.challengeSubmitTime = isoWithOffset()
          console.log('⏱️ Challenge submitted at:', this.challengeSubmitTime)
          try {
            const testCases = this.selectedBoss.testCases || []
            let passedTests = 0
            let failedTests = 0

            let userFunction = null
            
            try {
              // Extract JavaScript from HTML if needed
              let codeToTest = this.userCode
              
              if (this.userCode.includes('<script>') || this.userCode.includes('<!DOCTYPE')) {
                // Extract code between <script> tags
                const scriptMatch = this.userCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
                if (scriptMatch) {
                  codeToTest = scriptMatch[1]
                } else {
                  throw new Error('Could not find <script> tags in your HTML code.')
                }
              }
              
              let functionName = this.selectedBoss.functionName
              
              if (!functionName) {
                const functionMatch = codeToTest.match(/function\s+(\w+)\s*\(/) || 
                                     codeToTest.match(/const\s+(\w+)\s*=\s*\(/)
                functionName = functionMatch ? functionMatch[1] : null
              }

              if (!functionName) {
                throw new Error('Could not determine function name. Make sure your function is named correctly.')
              }

              console.log('Extracted function name:', functionName)

              const codeToExecute = `
                ${codeToTest}
                return ${functionName};
              `
              
              userFunction = new Function(codeToExecute)()

              if (typeof userFunction !== 'function') {
                throw new Error('Could not execute your code. Make sure it contains a valid function.')
              }

              console.log('Successfully extracted function:', functionName)

                // Helper to parse test case values more robustly.
                // Accepts valid JSON or JS-like literals (e.g., single-quoted strings, JS arrays/objects).
                const parseTestValue = (val) => {
                  if (val === null || val === undefined) return val
                  if (typeof val !== 'string') return val

                  // Try strict JSON first
                  try {
                    return JSON.parse(val)
                  } catch (e) {
                    // Fallthrough to more permissive evaluator
                  }

                  // If it looks like a JS literal (starts with [, {, ', " or digit/-, true/false/null), try evaluating safely.
                  try {
                    // Use Function to evaluate the literal in a restricted context.
                    // This is intentionally limited: we only evaluate the literal expression.
                    // Tests are trusted content (from DB); if you need stricter safety, avoid eval.
                    return new Function(`return (${val});`)()
                  } catch (e) {
                    // As a last resort, normalize single-quoted string arrays like ['a','b'] -> ["a","b"]
                    try {
                      const fixed = val.replace(/'/g, '"')
                      return JSON.parse(fixed)
                    } catch (e2) {
                      // Give back original string if nothing parses
                      return val
                    }
                  }
                }

                for (let test of testCases) {
                  try {
                    const input = parseTestValue(test.input)
                    const result = userFunction(input)

                    const expectedOutput = parseTestValue(test.expectedOutput)

                    if (String(result) === String(expectedOutput)) {
                      passedTests++
                    } else {
                      failedTests++
                    }
                  } catch (testError) {
                    console.error('Error running test case:', testError)
                    failedTests++
                  }
                }
            } catch (codeError) {
              console.error('Error executing user code:', codeError)
              failedTests = testCases.length
            }

            resolve({
              allPassed: failedTests === 0 && passedTests > 0,
              passedTests: passedTests,
              failedTests: failedTests,
              totalTests: testCases.length
            })
          } catch (err) {
            console.error('Validation error:', err)
            resolve({
              allPassed: false,
              passedTests: 0,
              failedTests: 1,
              totalTests: 1
            })
          }
        }, 1000)
      })
    },
    async saveProgress() {
      try {
        console.log('💾 Starting saveProgress...')
        
        let credData = null
        let credError = null
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries && !credData) {
          try {
            const result = await supabase
              .from('Credentials')
              .select('id')
              .eq('username', this.currentUsername)
              .maybeSingle()
            
            credData = result.data
            credError = result.error
            
            if (credError) {
              console.warn(`⚠️ Attempt ${retryCount + 1}/${maxRetries}: Error fetching from Credentials:`, credError.message)
              retryCount++
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            }
          } catch (e) {
            console.warn(`⚠️ Attempt ${retryCount + 1}/${maxRetries}: Network error:`, e.message)
            retryCount++
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
        }

        if (credError) {
          console.error('❌ Failed to fetch from Credentials after ' + maxRetries + ' attempts:', credError)
          return
        }

        if (!credData) {
          console.warn('❌ User not found in Credentials table. Username:', this.currentUsername)
          return
        }

        const credentialsId = credData.id
        console.log('✓ Found Credentials ID:', credentialsId)

        const { data: userInfoData, error: userInfoError } = await supabase
          .from('userInfo')
          .select('id, level, xp, gold, hp')
          .eq('userId', credentialsId)
          .single()

        if (userInfoError) {
          console.error('❌ Error fetching userInfo:', userInfoError)
          return
        }

        if (!userInfoData) {
          console.warn('❌ User not found in userInfo table for credentialsId:', credentialsId)
          return
        }

        console.log('✓ Found User in userInfo:', {id: userInfoData.id, credentialsId: credentialsId})
        const userId = userInfoData.id

        // Calculate elapsed time in seconds if we have start/submit timestamps
        let elapsedSeconds = null
        try {
          if (this.challengeStartTime && this.challengeSubmitTime) {
            const start = Date.parse(this.challengeStartTime)
            const submit = Date.parse(this.challengeSubmitTime)
            if (!isNaN(start) && !isNaN(submit) && submit >= start) {
              elapsedSeconds = Math.max(0, Math.round((submit - start) / 1000))
            }
          }
        } catch (e) {
          console.warn('⚠️ Could not calculate elapsed time:', e)
          elapsedSeconds = null
        }

        console.log('⏱️ Elapsed seconds for this attempt:', elapsedSeconds)

        // Always create a new progress record for each attempt (don't update existing ones)
        const newProgressRecord = {
          userId: userId,
          bossId: this.selectedBoss.id,
          isDefeated: true,
          isFailed: false,
          isAbandoned: false,
          attemptCount: 1,
          bestTime: elapsedSeconds !== null ? elapsedSeconds : 0,
          lastAttemptAt: this.challengeSubmitTime || isoWithOffset(),
          startChallenge: this.challengeStartTime || null,
          submitCode: this.challengeSubmitTime || null,
          hintsRevealed: Object.values(this.hintsRevealed).filter(v => v).length,
          createdAt: isoWithOffset(),
          updatedAt: isoWithOffset()
        }

        const { data: insertData, error: insertError } = await supabase
          .from('userProgress')
          .insert([newProgressRecord])
          .select()

        if (insertError) {
          console.error('❌ Error creating progress record:', insertError)
          throw insertError
        }
        console.log('✓ Progress record created successfully')

        let newExp = (userInfoData.xp || 0) + this.selectedBoss.rewardXp
        const newGold = (userInfoData.gold || 0) + this.selectedBoss.rewardGold
        
        let newLevel = userInfoData.level
        if (newLevel === null || newLevel === undefined) {
          newLevel = 1
        }
        
        let hpIncrease = 0
        if (newExp >= 100) {
          const levelUps = Math.floor(newExp / 100)
          newLevel = newLevel + levelUps
          newExp = newExp % 100
          hpIncrease = levelUps * 5
          console.log('⬆️ LEVEL UP! Levels gained: ' + levelUps + ', New level: ' + newLevel + ', HP increase: +' + hpIncrease)
        }

        const newHp = (userInfoData.hp || 100) + hpIncrease

        const { data: statsUpdateData, error: updateStatsError } = await supabase
          .from('userInfo')
          .update({
            level: newLevel,
            xp: newExp,
            gold: newGold,
            hp: newHp,
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .eq('id', userId)
          .select()

        if (updateStatsError) {
          console.error('❌ Error updating player stats:', updateStatsError)
          throw updateStatsError
        }

        this.playerLevel = newLevel
        this.playerExp = newExp
        this.playerGold = newGold

        this.congratsData = {
          xpEarned: this.selectedBoss.rewardXp,
          goldEarned: this.selectedBoss.rewardGold
        }
        
        console.log('🎉 Setting showCongratulations to true')
        this.showCongratulations = true

        console.log('✅ ALL OPERATIONS COMPLETED SUCCESSFULLY')
      } catch (err) {
        console.error('❌ CRITICAL ERROR in saveProgress:', err)
      }
    },
    continueBattle() {
      this.showCongratulations = false
      this.showChallengeModal = false
      this.$emit('quest-complete')
    },
    async questFailed() {
      try {
        console.log('💀 Quest failed! Recording failure in database...')
        
        // Record the failure outcome first
        await this.recordChallengeOutcome('failed')
        
        console.log('💀 Quest failed! Restoring HP to original value:', this.questStartHp)
        
        const { data: credData } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .single()
        
        if (!credData) {
          console.error('❌ Could not find user credentials')
          return
        }
        
        const { data: userInfoData } = await supabase
          .from('userInfo')
          .select('id')
          .eq('userId', credData.id)
          .single()
        
        if (!userInfoData) {
          console.error('❌ Could not find user info')
          return
        }
        
        const { error: updateError } = await supabase
          .from('userInfo')
          .update({
            hp: this.questStartHp,
            updatedAt: isoWithOffset()
          })
          .eq('id', userInfoData.id)
        
        if (updateError) {
          console.error('❌ Error restoring HP:', updateError)
          return
        }
        
        console.log('✅ HP restored to:', this.questStartHp)
        
        this.playerHp = this.questStartHp
        
        this.showChallengeModal = false
        this.submissionResult = null
        this.selectedBoss = null
        
        this.$emit('close')
      } catch (err) {
        console.error('❌ Exception in questFailed:', err)
      }
    },
    async recordChallengeOutcome(outcome) {
      try {
        console.log('📝 Recording challenge outcome:', outcome)
        
        const { data: credData } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .maybeSingle()
        
        if (!credData) {
          console.error('❌ Could not find user credentials')
          return
        }
        
        const { data: userInfoData } = await supabase
          .from('userInfo')
          .select('id')
          .eq('userId', credData.id)
          .single()
        
        if (!userInfoData) {
          console.error('❌ Could not find user info')
          return
        }
        
        const userId = userInfoData.id
        
        // Determine flags based on outcome
        let isFailed = false
        let isAbandoned = false
        let isDefeated = false
        
        if (outcome === 'failed') {
          isFailed = true
          isAbandoned = false
          isDefeated = false
          console.log('Setting: isFailed=true, isDefeated=false, isAbandoned=false')
        } else if (outcome === 'abandoned') {
          isFailed = false
          isAbandoned = true
          isDefeated = false
          console.log('Setting: isAbandoned=true, isFailed=false, isDefeated=false')
        } else if (outcome === 'defeated') {
          isFailed = false
          isAbandoned = false
          isDefeated = true
          console.log('Setting: isDefeated=true, isFailed=false, isAbandoned=false')
        }
        
        // Always create a new progress record for each attempt (don't update existing ones)
        const { error: insertError } = await supabase
          .from('userProgress')
          .insert([{
            userId: userId,
            bossId: this.selectedBoss.id,
            isFailed: isFailed,
            isAbandoned: isAbandoned,
            isDefeated: isDefeated,
            attemptCount: 1,
            lastAttemptAt: isoWithOffset(),
            startChallenge: this.challengeStartTime || null,
            submitCode: this.challengeSubmitTime || null,
            createdAt: isoWithOffset(),
            updatedAt: isoWithOffset()
          }])
        
        if (insertError) {
          console.error('❌ Error creating progress record:', insertError)
          return
        }
        console.log('✅ Progress record created for outcome:', outcome)
      } catch (err) {
        console.error('❌ Exception in recordChallengeOutcome:', err)
      }
    },
    goBack() {
      this.$emit('close')
    },
    formatCode(code) {
      if (!code) return ''
      return code
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.quest-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Press Start 2P', cursive;
  background: #000;
  z-index: 500;
}

/* Dragon Video Overlay Styles */
.dragon-video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: fadeIn 0.3s ease-in-out;
}

.dragon-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.skip-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffcc00;
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  text-shadow: 2px 2px #000;
  opacity: 0.8;
  animation: fadeInOut 2s ease-in-out infinite;
  text-align: center;
  pointer-events: none;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
}

.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.background-video.fade-in-video {
  opacity: 0.7;
}

.quest-content {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.4) 0%, rgba(22, 33, 62, 0.4) 50%, rgba(15, 52, 96, 0.4) 100%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
}

.quest-content.fade-in {
  opacity: 1;
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 50;
  
  padding: 10px 15px;
  border-radius: 8px;
  
  background-color: rgba(59, 45, 38, 0.9);
  border: 3px solid #eebb4d;
  color: #ffcc00;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  text-shadow: 2px 2px #000;
}

.back-button:hover {
  transform: scale(1.05);
  background-color: rgba(59, 45, 38, 1);
  box-shadow: 0 6px 12px rgba(0,0,0,0.7);
}

.back-button:active {
  transform: scale(0.95);
}

.title-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 50;
}

.title-overlay h1 {
  font-size: 24px;
  color: #ffcc00;
  text-shadow: 
    3px 3px 0px #8b5a00,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000;
  margin-bottom: 8px;
}

.title-overlay p {
  font-size: 10px;
  color: #4dcfff;
  text-shadow: 2px 2px #000;
}

.player-stats {
  position: absolute;
  top: 80px;
  right: 20px;
  display: flex;
  gap: 15px;
  z-index: 50;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 400px;
}

.stat-item {
  background: rgba(59, 45, 38, 0.95);
  border: 3px solid #eebb4d;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #ffcc00;
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
}

.stat-value {
  color: #4dcfff;
  font-size: 10px;
  font-weight: bold;
}

.content-placeholder {
  position: relative;
  text-align: center;
  color: #4dcfff;
  font-size: 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 800px;
  margin: 100px auto 0;
}

.content-placeholder h2 {
  color: #ffcc00;
  font-size: 16px;
  text-shadow: 2px 2px #000;
}

.no-bosses {
  padding: 40px 20px;
  color: #a0a0b0;
  font-size: 10px;
}

.bosses-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.boss-card {
  background: rgba(59, 45, 38, 0.95);
  border: 3px solid #eebb4d;
  border-radius: 8px;
  padding: 15px;
  text-align: left;
  transition: all 0.3s ease;
  cursor: pointer;
}

.boss-card:hover {
  transform: scale(1.05);
  border-color: #ffcc00;
  box-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
}

.boss-card h3 {
  color: #ffcc00;
  font-size: 10px;
  margin-bottom: 8px;
  text-transform: uppercase;
  text-shadow: 2px 2px #000;
}

.boss-card p {
  color: #a0a0b0;
  font-size: 8px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.boss-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.difficulty {
  font-size: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
}

.difficulty.easy,
.difficulty.Beginner {
  background: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.difficulty.medium,
.difficulty.Intermediate {
  background: rgba(234, 179, 8, 0.3);
  color: #facc15;
}

.difficulty.hard,
.difficulty.Advanced {
  background: rgba(249, 115, 22, 0.3);
  color: #fb923c;
}

.difficulty.extreme {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.rewards {
  color: #4dcfff;
  font-size: 7px;
  text-align: right;
}

.challenge-button {
  width: 100%;
  background: linear-gradient(145deg, #FFD700, #FFA500);
  border: 2px solid #000;
  color: #000;
  padding: 8px;
  font-family: 'Press Start 2P', cursive;
  font-size: 8px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.challenge-button:hover {
  background: linear-gradient(145deg, #FFED4E, #FFD700);
  transform: scale(1.05);
}

.challenge-button:active {
  transform: scale(0.95);
}

.challenge-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
}

.challenge-modal {
  background: rgba(59, 45, 38, 0.95);
  border: 4px solid #eebb4d;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  padding: 30px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9);
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(239, 68, 68, 0.8);
  border: 2px solid #fff;
  border-radius: 50%;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-close-button:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.modal-challenge-header {
  text-align: center;
  margin-bottom: 25px;
  color: #ffcc00;
  text-shadow: 3px 3px 0px #8b5a00, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
}

.modal-challenge-header h1 {
  font-size: 20px;
  margin-bottom: 10px;
}

.modal-difficulty {
  font-size: 12px;
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-block;
  font-weight: bold;
  text-transform: uppercase;
}

.modal-difficulty.Beginner {
  background: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.modal-difficulty.Intermediate {
  background: rgba(234, 179, 8, 0.3);
  color: #facc15;
}

.modal-difficulty.Advanced {
  background: rgba(249, 115, 22, 0.3);
  color: #fb923c;
}

.modal-challenge-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal-problem-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #4dcfff;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
  max-height: 500px;
}

.modal-problem-panel h2 {
  color: #4dcfff;
  font-size: 12px;
  margin-bottom: 12px;
  text-shadow: 2px 2px #000;
  text-transform: uppercase;
  border-bottom: 2px solid #4dcfff;
  padding-bottom: 8px;
}

.modal-problem-content {
  color: #a0a0b0;
  font-size: 9px;
  line-height: 1.5;
}

.modal-problem-content p {
  margin-bottom: 12px;
}

.modal-initial-code-box {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #4dcfff;
  border-radius: 6px;
  padding: 10px;
  margin: 12px 0;
  font-family: 'Courier Prime', monospace;
}

.modal-initial-code-box h3 {
  color: #4dcfff;
  font-size: 8px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.modal-initial-code-box code {
  color: #86efac;
  font-size: 8px;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-test-cases {
  margin: 15px 0;
  border-top: 1px solid #4dcfff;
  padding-top: 12px;
}

.modal-test-cases h3 {
  color: #ffcc00;
  font-size: 9px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.modal-test-case-item {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #facc15;
  padding: 6px 10px;
  margin-bottom: 6px;
  border-radius: 4px;
}

.modal-test-case-item small {
  display: block;
  color: #a0a0b0;
  font-size: 7px;
  margin: 3px 0;
}

.modal-test-case-item code {
  background: rgba(0, 0, 0, 0.5);
  color: #4dcfff;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: 'Courier Prime', monospace;
}

.modal-hints-section {
  margin-top: 15px;
  border-top: 1px solid #4dcfff;
  padding-top: 12px;
}

.modal-hints-section h3 {
  color: #ffcc00;
  font-size: 9px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.modal-hint-button {
  background: rgba(139, 92, 246, 0.3);
  border: 2px solid #a78bfa;
  color: #c4b5fd;
  padding: 6px 10px;
  margin: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Press Start 2P', cursive;
  font-size: 7px;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.modal-hint-button:hover {
  background: rgba(139, 92, 246, 0.6);
  transform: scale(1.05);
}

.modal-hint-text {
  background: rgba(139, 92, 246, 0.2);
  border-left: 3px solid #c4b5fd;
  padding: 8px 10px;
  margin-top: 6px;
  border-radius: 4px;
  color: #ddd6fe;
  font-size: 8px;
  line-height: 1.4;
}

.modal-code-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #eebb4d;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.modal-code-panel h2 {
  color: #ffcc00;
  font-size: 12px;
  margin-bottom: 12px;
  text-shadow: 2px 2px #000;
  text-transform: uppercase;
  border-bottom: 2px solid #eebb4d;
  padding-bottom: 8px;
}

.modal-code-editor {
  flex: 1;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #4dcfff;
  color: #86efac;
  font-family: 'Courier Prime', monospace;
  font-size: 10px;
  padding: 12px;
  border-radius: 6px;
  resize: none;
  min-height: 250px;
  line-height: 1.5;
  outline: none;
}

.modal-code-editor::placeholder {
  color: #4a5568;
}

.modal-code-editor:focus {
  border-color: #86efac;
  box-shadow: 0 0 10px rgba(134, 239, 172, 0.3);
}

.modal-action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.modal-submit-button,
.modal-reset-button {
  flex: 1;
  padding: 10px 16px;
  font-family: 'Press Start 2P', cursive;
  font-size: 9px;
  font-weight: bold;
  border: 2px solid #000;
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.modal-format-button {
  background: linear-gradient(145deg, #a78bfa, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
  border: 1px solid rgba(196, 181, 253, 0.5);
}

.modal-format-button:hover {
  background: linear-gradient(145deg, #c4b5fd, #a78bfa);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.5);
}

.modal-submit-button {
  background: linear-gradient(145deg, #FFD700, #FFA500);
  color: #000;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.modal-submit-button:hover {
  background: linear-gradient(145deg, #FFED4E, #FFD700);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.5);
}

.modal-reset-button {
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border-color: #eebb4d;
}

.modal-reset-button:hover {
  background: rgba(138, 148, 176, 1);
  transform: scale(1.05);
}

.modal-submission-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 2px solid;
  animation: slideUp 0.3s ease-in-out;
}

.modal-submission-result.success {
  background: rgba(34, 197, 94, 0.2);
  border-color: #86efac;
  color: #86efac;
}

.modal-submission-result.error {
  background: rgba(239, 68, 68, 0.2);
  border-color: #fca5a5;
  color: #fca5a5;
}

.modal-submission-result h3 {
  font-size: 9px;
  margin-bottom: 6px;
  text-transform: uppercase;
  text-shadow: 2px 2px #000;
}

.modal-submission-result p {
  font-size: 8px;
  line-height: 1.4;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .modal-challenge-layout {
    grid-template-columns: 1fr;
  }

  .modal-problem-panel {
    max-height: 300px;
  }
}

.congratulations-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.congratulations-modal {
  background: linear-gradient(135deg, rgba(59, 45, 38, 0.95), rgba(80, 60, 50, 0.95));
  border: 4px solid #ffcc00;
  border-radius: 15px;
  padding: 40px;
  max-width: 500px;
  text-align: center;
  box-shadow: 
    0 0 30px rgba(255, 204, 0, 0.5),
    inset 0 0 20px rgba(255, 204, 0, 0.1);
  animation: slideUp 0.5s ease-out;
}

.congrats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.congrats-title {
  font-size: 28px;
  color: #ffcc00;
  text-shadow: 
    3px 3px 0px #8b5a00,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000;
  margin: 0;
  animation: pulse 0.6s ease-in-out;
}

.congrats-boss {
  font-size: 14px;
  color: #4dcfff;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 2px 2px #000;
}

.congrats-rewards {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #ffcc00;
  border-radius: 10px;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.reward-icon {
  font-size: 32px;
  animation: bounce 0.6s ease-in-out infinite;
}

.reward-text {
  color: #ffcc00;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 2px 2px #000;
}

.congrats-button {
  padding: 12px 24px;
  background: linear-gradient(145deg, #4dcfff, #2aaadd);
  border: 3px solid #ffffff;
  border-radius: 8px;
  color: #000;
  font-size: 12px;
  font-family: 'Press Start 2P', cursive;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(45, 170, 221, 0.4),
    inset -2px -2px rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px #000;
}

.congrats-button:hover {
  transform: scale(1.05);
  box-shadow: 
    0 6px 16px rgba(45, 170, 221, 0.6),
    inset -2px -2px rgba(0, 0, 0, 0.3);
}

.congrats-button:active {
  transform: scale(0.98);
  box-shadow: 
    0 2px 8px rgba(45, 170, 221, 0.4),
    inset 2px 2px rgba(0, 0, 0, 0.3);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.modal-hp-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #ff6b6b;
  border-radius: 6px;
  margin-bottom: 12px;
}

.modal-hp-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ff6b6b;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  text-shadow: 1px 1px #000;
}

.modal-hp-text {
  font-size: 13px;
  color: #ffff00;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 6px;
  border-radius: 3px;
}

.modal-hp-bar-container {
  width: 100%;
  height: 14px;
  background: #000;
  border: 2px solid #333;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8);
  position: relative;
}

.modal-hp-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ff9999);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.6);
}

.modal-hp-bar-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}

.modal-damage-message {
  position: absolute;
  top: 40px;
  right: 20px;
  color: #ff6b6b;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 2px 2px #000;
  opacity: 1;
  pointer-events: none;
}

.modal-damage-message.damage-animation {
  animation: damagePopup 0.6s ease-out forwards;
}

@keyframes damagePopup {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }
}

.audio-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 50;
  
  width: 50px;
  height: 50px;
  
  background: rgba(59, 45, 38, 0.9);
  border: 3px solid #eebb4d;
  border-radius: 50%;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: #ffcc00;
  font-size: 24px;
  cursor: pointer;
  
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  
  user-select: none;
}

.audio-toggle:hover {
  transform: scale(1.1);
  background: rgba(59, 45, 38, 1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.7);
  border-color: #ffcc00;
}

.audio-toggle:active {
  transform: scale(0.95);
}
</style>
