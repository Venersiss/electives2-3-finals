<template>
  <div class="landing-page">
    <video playsinline autoplay muted loop id="bg-video">
      <source src="/Pixel_Art_Dragon_Sunset_Scene.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <!-- Background Music -->
    <audio ref="bgMusic" loop>
      <source src="/background-music.mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>

    <!-- Music Toggle Button -->
    <button class="music-toggle" @click="toggleMusic">
      {{ isMusicPlaying ? '🔊' : '🔇' }}
    </button>

    <div class="landing-content">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="game-title">
          <h1 class="title-gold">BYTE</h1>
          <h1 class="title-blue">ADVENTURES</h1>
        </div>
        
        <div class="welcome-box">
          <h2 class="form-header">WELCOME, {{ currentUser.toUpperCase() }}</h2>
          <p class="welcome-text">Welcome to the realm of code and knowledge!</p>
          <p class="welcome-text">Answer Vue.js questions to grow your character and become a legendary developer.</p>
        </div>
      </div>

      <!-- Character & Stats Section -->
      <div class="game-section">
        <div class="character-card">
          <h3 class="card-header">⚔️ CHARACTER</h3>
          <div class="stat-row">
            <span class="stat-label">LEVEL:</span>
            <span class="stat-value">1</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">EXP:</span>
            <span class="stat-value">0/100</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">HP:</span>
            <span class="stat-value">100/100</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">INTELLIGENCE:</span>
            <span class="stat-value">10</span>
          </div>
        </div>

        <div class="character-card">
          <h3 class="card-header">🎯 STATS</h3>
          <div class="stat-row">
            <span class="stat-label">QUESTIONS ANSWERED:</span>
            <span class="stat-value">0</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">CORRECT ANSWERS:</span>
            <span class="stat-value">0</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">ACCURACY:</span>
            <span class="stat-value">0%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">STREAK:</span>
            <span class="stat-value">0</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="game-button" @click="startAdventure">
          🎮 START ADVENTURE
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../library/supabase.js';
import { isoWithOffset } from '../library/time.js';

export default {
  data() {
    return {
      currentUser: '',
      isMusicPlaying: false
    }
  },
  mounted() {
    // Get current user from localStorage
    const user = localStorage.getItem('currentUser');
    if (!user) {
      // Redirect to login if not authenticated
      this.$router.push('/');
    } else {
      this.currentUser = user;
    }
    // Try to play music after user interaction
    document.addEventListener('click', () => this.playMusic(), { once: true });
  },
  methods: {
    startAdventure() {
      // Navigate to map page
      console.log('Starting adventure for', this.currentUser);
      this.$router.push('/map');
    },
    toggleMusic() {
      const audio = this.$refs.bgMusic;
      if (this.isMusicPlaying) {
        audio.pause();
        this.isMusicPlaying = false;
      } else {
        this.playMusic();
      }
    },
    playMusic() {
      const audio = this.$refs.bgMusic;
      audio.play()
        .then(() => {
          this.isMusicPlaying = true;
        })
        .catch(error => {
          console.log("Audio autoplay blocked:", error);
          this.isMusicPlaying = false;
        });
    }
  }
}
</script>

<style>
/* 1. IMPORTS: Press Start 2P for Title, VT323 for Inputs */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

/* GLOBAL RESET */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

/* Page Container */
.landing-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
}

/* Background Video */
#bg-video {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  object-fit: cover;
  z-index: 1;
}

/* Music Toggle Button */
.music-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  
  width: 50px;
  height: 50px;
  border-radius: 50%;
  
  background-color: rgba(59, 45, 38, 0.9);
  border: 3px solid #eebb4d;
  
  font-size: 24px;
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}

.music-toggle:hover {
  transform: scale(1.1);
  background-color: rgba(59, 45, 38, 1);
}

.music-toggle:active {
  transform: scale(0.95);
}

/* Main Content Container */
.landing-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px 15px;
  min-height: 100vh;
}

/* --- TITLE STYLES --- */
.game-title {
  text-align: center;
  margin-bottom: 10px;
  line-height: 1.1;
}

.title-gold {
  font-family: 'Press Start 2P', cursive;
  font-size: 32px;
  color: #ffcc00;
  margin: 0;
  text-shadow: 
    2px 2px 0px #8b5a00,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    2px 2px 0 #000;
}

.title-blue {
  font-family: 'Press Start 2P', cursive;
  font-size: 32px;
  color: #4dcfff;
  margin: -3px 0 0 0;
  text-shadow: 
    2px 2px 0px #005f87,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    2px 2px 0 #000;
}

/* --- WELCOME SECTION --- */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.welcome-box {
  background-color: #3b2d26; 
  padding: 18px 25px;
  border: 4px solid #eebb4d;
  border-radius: 10px;
  box-shadow: 
    0 0 0 4px #1a1a1a,
    inset 0 0 0 4px #1a1a1a,
    0 10px 20px rgba(0,0,0,0.6);
  width: 100%;
  max-width: 420px;
  margin: 0 15px;
  text-align: center;
}

.form-header {
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #ffffff;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px #000;
  font-weight: normal;
}

.welcome-text {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #a0a0b0;
  margin: 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.3;
}

/* --- GAME SECTION --- */
.game-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
}

.character-card {
  background-color: #3b2d26; 
  padding: 20px 25px;
  border: 4px solid #eebb4d;
  border-radius: 10px;
  box-shadow: 
    0 0 0 4px #1a1a1a,
    inset 0 0 0 4px #1a1a1a,
    0 10px 20px rgba(0,0,0,0.6);
}

.card-header {
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #ffcc00;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px #000;
  font-weight: normal;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 2px solid rgba(238, 187, 77, 0.2);
  font-family: 'VT323', monospace;
  font-size: 14px;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #a0a0b0;
  text-transform: uppercase;
}

.stat-value {
  color: #4dcfff;
  font-weight: bold;
  text-transform: uppercase;
}

/* --- ACTION BUTTONS --- */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
  margin: 30px auto 50px;
}

.game-button {
  padding: 12px 8px;
  background-color: #7b85a1;
  color: white;
  font-family: 'Press Start 2P', cursive;
  font-size: 13px;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  border-top: 4px solid #9fa9c2;
  border-left: 4px solid #9fa9c2;
  border-bottom: 4px solid #4a5061;
  border-right: 4px solid #4a5061;
  border-radius: 6px;
  box-shadow: 0 4px 0 #2a2e38;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-shadow: 2px 2px #000;
  transition: all 0.2s;
}

.game-button:hover {
  background-color: #8a94b0;
  transform: scale(1.05);
}

.game-button:active {
  transform: translate(0, 4px) scale(1.05);
  box-shadow: 0 0 0 #2a2e38;
  border-bottom: 4px solid transparent;
}
</style>
