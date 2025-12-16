<template>
  <div class="challenge-container">
    <!-- Background Video -->
    <video 
      class="background-video"
      autoplay
      muted
      loop
      playsinline>
      <source src="/Retro_RPG_Boss_Battle_Video_Generation.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <!-- Main Challenge UI -->
    <div class="challenge-content">
      <!-- Back Button -->
      <button class="back-button" @click="goBack">← BACK</button>

      <!-- Challenge Header -->
      <div class="challenge-header">
        <h1>⚔️ {{ boss.name }}</h1>
        <p class="difficulty" :class="boss.difficulty">{{ boss.difficulty.toUpperCase() }}</p>
      </div>

      <!-- Two Column Layout: Problem & Code Editor -->
      <div class="challenge-layout">
        <!-- LEFT: Problem Description -->
        <div class="problem-panel">
          <h2>PROBLEM DESCRIPTION</h2>
          <div class="problem-content">
            <p>{{ boss.description }}</p>
            <div class="initial-code-box">
              <h3>START WITH THIS CODE:</h3>
              <pre><code>{{ boss.initialCode }}</code></pre>
            </div>
            
            <!-- Test Cases Preview -->
            <div v-if="boss.testCases && boss.testCases.length > 0" class="test-cases-preview">
              <h3>TEST CASES:</h3>
              <div class="test-case-item" v-for="(test, idx) in boss.testCases" :key="idx">
                <small>Input: <code>{{ test.input }}</code></small>
                <small>Expected: <code>{{ test.expectedOutput }}</code></small>
              </div>
            </div>

            <!-- Hints -->
            <div v-if="boss.hints && boss.hints.length > 0" class="hints-section">
              <h3>HINTS:</h3>
              <button 
                v-for="(hint, idx) in visibleHints" 
                :key="idx"
                class="hint-button"
                @click="toggleHint(idx)">
                {{ hintsRevealed[idx] ? '✓ HINT ' + (idx + 1) : '? HINT ' + (idx + 1) }}
              </button>
              <div v-for="(hint, idx) in hintsRevealed" :key="'hint-' + idx" v-if="hintsRevealed[idx]" class="hint-text">
                💡 {{ boss.hints[idx] }}
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Code Editor -->
        <div class="code-panel">
          <h2>YOUR SOLUTION</h2>
          <textarea 
            v-model="userCode"
            class="code-editor"
            placeholder="Write your code here..."></textarea>
          
          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="submit-button" @click="submitCode">
              🎯 SUBMIT SOLUTION
            </button>
            <button class="reset-button" @click="resetCode">
              🔄 RESET CODE
            </button>
          </div>

          <!-- Submission Result -->
          <div v-if="submissionResult" class="submission-result" :class="submissionResult.status">
            <h3>{{ submissionResult.message }}</h3>
            <p v-if="submissionResult.details">{{ submissionResult.details }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../library/supabase'

export default {
  name: 'ChallengeView',
  data() {
    return {
      boss: null,
      userCode: '',
      submissionResult: null,
      hintsRevealed: {},
      visibleHints: []
    }
  },
  mounted() {
    this.loadChallenge()
  },
  methods: {
    loadChallenge() {
      // Get boss from session storage (passed from outskirts.vue)
      const savedBoss = sessionStorage.getItem('selectedBoss')
      if (savedBoss) {
        this.boss = JSON.parse(savedBoss)
        this.userCode = this.boss.initialCode || ''
        
        // Initialize hints
        if (this.boss.hints && Array.isArray(this.boss.hints)) {
          this.visibleHints = this.boss.hints
          this.boss.hints.forEach((_, idx) => {
            this.hintsRevealed[idx] = false
          })
        }
        
        console.log('Challenge loaded:', this.boss.name)
      } else {
        console.error('No boss data found')
        this.$router.push('/outskirts')
      }
    },
    toggleHint(idx) {
      this.hintsRevealed[idx] = !this.hintsRevealed[idx]
    },
    resetCode() {
      this.userCode = this.boss.initialCode || ''
      this.submissionResult = null
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
        // For now, show a simple test message
        // In a real scenario, you'd execute the code against test cases
        this.submissionResult = {
          status: 'success',
          message: 'SOLUTION SUBMITTED!',
          details: 'Your code has been sent for evaluation. (Testing system coming soon)'
        }

        // TODO: Implement actual code execution with Web Worker
        // This would:
        // 1. Execute user code in a sandboxed environment
        // 2. Run against test cases
        // 3. Award XP/Gold on success
        // 4. Update leaderboard

        // Simulate a delay
        setTimeout(() => {
          this.submissionResult = {
            status: 'success',
            message: 'ALL TESTS PASSED!',
            details: 'Congratulations! You earned 100 XP and 50 Gold'
          }
        }, 2000)
      } catch (error) {
        this.submissionResult = {
          status: 'error',
          message: 'SUBMISSION ERROR',
          details: error.message
        }
      }
    },
    goBack() {
      this.$router.push('/outskirts')
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Courier+Prime&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.challenge-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Press Start 2P', cursive;
  background: #000;
  margin: 0;
  padding: 0;
}

.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.5;
}

.challenge-content {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(22, 33, 62, 0.6) 50%, rgba(15, 52, 96, 0.6) 100%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 60px 20px 20px 20px;
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

.challenge-header {
  text-align: center;
  margin-bottom: 30px;
  color: #ffcc00;
  text-shadow: 3px 3px 0px #8b5a00, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
}

.challenge-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.difficulty {
  font-size: 12px;
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-block;
  font-weight: bold;
  text-transform: uppercase;
}

.difficulty.easy {
  background: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.difficulty.medium {
  background: rgba(234, 179, 8, 0.3);
  color: #facc15;
}

.difficulty.hard {
  background: rgba(249, 115, 22, 0.3);
  color: #fb923c;
}

.difficulty.extreme {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.challenge-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Problem Panel */
.problem-panel {
  background: rgba(59, 45, 38, 0.95);
  border: 3px solid #eebb4d;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
  max-height: 600px;
}

.problem-panel h2 {
  color: #ffcc00;
  font-size: 14px;
  margin-bottom: 15px;
  text-shadow: 2px 2px #000;
  text-transform: uppercase;
  border-bottom: 2px solid #eebb4d;
  padding-bottom: 10px;
}

.problem-content {
  color: #a0a0b0;
  font-size: 9px;
  line-height: 1.5;
}

.problem-content p {
  margin-bottom: 15px;
}

.initial-code-box {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #4dcfff;
  border-radius: 6px;
  padding: 12px;
  margin: 15px 0;
  font-family: 'Courier Prime', monospace;
}

.initial-code-box h3 {
  color: #4dcfff;
  font-size: 8px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.initial-code-box code {
  color: #86efac;
  font-size: 8px;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.test-cases-preview {
  margin: 20px 0;
  border-top: 1px solid #eebb4d;
  padding-top: 15px;
}

.test-cases-preview h3 {
  color: #ffcc00;
  font-size: 9px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.test-case-item {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #facc15;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.test-case-item small {
  display: block;
  color: #a0a0b0;
  font-size: 7px;
  margin: 4px 0;
}

.test-case-item code {
  background: rgba(0, 0, 0, 0.5);
  color: #4dcfff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier Prime', monospace;
}

.hints-section {
  margin-top: 20px;
  border-top: 1px solid #eebb4d;
  padding-top: 15px;
}

.hints-section h3 {
  color: #ffcc00;
  font-size: 9px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.hint-button {
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

.hint-button:hover {
  background: rgba(139, 92, 246, 0.6);
  transform: scale(1.05);
}

.hint-text {
  background: rgba(139, 92, 246, 0.2);
  border-left: 3px solid #c4b5fd;
  padding: 10px 12px;
  margin-top: 8px;
  border-radius: 4px;
  color: #ddd6fe;
  font-size: 8px;
  line-height: 1.4;
}

/* Code Panel */
.code-panel {
  background: rgba(59, 45, 38, 0.95);
  border: 3px solid #eebb4d;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.code-panel h2 {
  color: #ffcc00;
  font-size: 14px;
  margin-bottom: 15px;
  text-shadow: 2px 2px #000;
  text-transform: uppercase;
  border-bottom: 2px solid #eebb4d;
  padding-bottom: 10px;
}

.code-editor {
  flex: 1;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #4dcfff;
  color: #86efac;
  font-family: 'Courier Prime', monospace;
  font-size: 11px;
  padding: 15px;
  border-radius: 6px;
  resize: none;
  min-height: 300px;
  line-height: 1.6;
  outline: none;
}

.code-editor::placeholder {
  color: #4a5568;
}

.code-editor:focus {
  border-color: #86efac;
  box-shadow: 0 0 10px rgba(134, 239, 172, 0.3);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.submit-button,
.reset-button {
  flex: 1;
  padding: 12px 20px;
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid #000;
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.submit-button {
  background: linear-gradient(145deg, #FFD700, #FFA500);
  color: #000;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.submit-button:hover {
  background: linear-gradient(145deg, #FFED4E, #FFD700);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.5);
}

.reset-button {
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border-color: #eebb4d;
}

.reset-button:hover {
  background: rgba(138, 148, 176, 1);
  transform: scale(1.05);
}

.submission-result {
  margin-top: 15px;
  padding: 15px;
  border-radius: 6px;
  border: 2px solid;
  animation: slideUp 0.3s ease-in-out;
}

.submission-result.success {
  background: rgba(34, 197, 94, 0.2);
  border-color: #86efac;
  color: #86efac;
}

.submission-result.error {
  background: rgba(239, 68, 68, 0.2);
  border-color: #fca5a5;
  color: #fca5a5;
}

.submission-result h3 {
  font-size: 10px;
  margin-bottom: 8px;
  text-transform: uppercase;
  text-shadow: 2px 2px #000;
}

.submission-result p {
  font-size: 8px;
  line-height: 1.4;
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
  .challenge-layout {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .problem-panel {
    max-height: 400px;
  }
}
</style>
