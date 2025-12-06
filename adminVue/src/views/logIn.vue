<template>
  <div class="login-page">
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

    <div class="login-content">
      <!-- 1. The Game Logo Title -->
      <div class="game-title">
        <h1 class="title-gold">BYTE</h1>
        <h1 class="title-blue">ADVENTURES</h1>
      </div>

      <!-- 2. The Login Box -->
      <form @submit.prevent="login">
        <h2 class="form-header">ADVENTURER LOGIN</h2>
        
        <div class="input-group">
          <input type="text" v-model="username" placeholder="USERNAME" required>
        </div>
        <div class="input-group">
          <input type="password" v-model="password" placeholder="PASSWORD" required>
        </div>

        <button type="submit">
           🗡️ START GAME
        </button>
        <button type="submit">
           📜 REGISTER
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      isMusicPlaying: false
    }
  },
  mounted() {
    // Try to play music on mount (might be blocked by browser)
    this.playMusic();
  },
  methods: {
    login() {
      console.log("Login submitted");
      console.log("Username:", this.username);
      console.log("Password:", this.password);
      
      // If music hasn't started, start it on login click
      if (!this.isMusicPlaying) {
        this.playMusic();
      }
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
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

/* Background Video */
#bg-video {
  position: absolute;
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
.login-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 20px;
}

/* --- TITLE STYLES (The "Logo") --- */
.game-title {
  text-align: center;
  margin-bottom: 10px;
  line-height: 1.2;
}

.title-gold {
  font-family: 'Press Start 2P', cursive;
  font-size: 50px;
  color: #ffcc00;
  margin: 0;
  text-shadow: 
    4px 4px 0px #8b5a00,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    4px 4px 0 #000;
}

.title-blue {
  font-family: 'Press Start 2P', cursive;
  font-size: 50px;
  color: #4dcfff;
  margin: -10px 0 0 0;
  text-shadow: 
    4px 4px 0px #005f87,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    4px 4px 0 #000;
}

/* --- FORM BOX STYLES --- */
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  
  background-color: #3b2d26; 
  padding: 25px 35px;
  
  border: 4px solid #eebb4d;
  border-radius: 10px;
  
  box-shadow: 
    0 0 0 4px #1a1a1a,
    inset 0 0 0 4px #1a1a1a,
    0 10px 20px rgba(0,0,0,0.6);
    
  width: 400px;
}

.form-header {
  font-family: 'VT323', monospace;
  font-size: 32px;
  color: #ffffff;
  margin: 0 0 5px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px #000;
  font-weight: normal;
}

/* --- INPUT STYLES --- */
.input-group {
  width: 100%;
  position: relative;
}

input {
  width: 100%;
  padding: 12px 15px;
  
  background-color: #24242e; 
  border: 4px solid #15151b;
  border-radius: 6px;
  
  color: #a0a0b0;
  font-family: 'VT323', monospace;
  font-size: 26px;
  outline: none;
  text-transform: uppercase;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
}

input::placeholder {
  color: #6e6e80;
}

input:focus {
  background-color: #2e2e3a;
  border-color: #eebb4d;
  color: #fff;
}

/* --- BUTTON STYLES --- */
form button {
  width: 100%;
  padding: 12px 10px;
  margin-top: 10px;
  
  background-color: #7b85a1;
  color: white;
  
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
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
  gap: 10px;
  text-shadow: 2px 2px #000;
}

form button:active {
  transform: translate(0, 4px);
  box-shadow: 0 0 0 #2a2e38;
  border-bottom: 4px solid transparent;
}

form button:hover {
  background-color: #8a94b0;
}


</style>