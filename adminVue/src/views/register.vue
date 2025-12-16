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

      <!-- 2. The Register Box -->
      <form @submit.prevent="register">
        <h2 class="form-header">CREATE ACCOUNT</h2>
        
        <div class="input-group">
          <input type="text" v-model="username" placeholder="USERNAME" required>
        </div>
        <div class="input-group">
          <input type="email" v-model="email" placeholder="EMAIL" required>
        </div>
        <div class="input-group">
          <input type="password" v-model="password" placeholder="PASSWORD" required>
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '⏳ REGISTERING...' : '⚔️ JOIN ADVENTURE' }}
        </button>
        <button type="button" @click="goBack">
          🔙 BACK
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { supabase } from '../library/supabase.js';
import { isoWithOffset } from '../library/time.js';

export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      isMusicPlaying: false,
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  mounted() {
    // Try to play music on mount (might be blocked by browser)
    this.playMusic();
  },
  methods: {
    async register() {
      this.errorMessage = '';
      this.successMessage = '';
      this.isLoading = true;

      try {
        // Validate input
        if (!this.username || !this.email || !this.password) {
          this.errorMessage = 'All fields are required!';
          this.isLoading = false;
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
          this.errorMessage = 'Please enter a valid email address!';
          this.isLoading = false;
          return;
        }

        // Check if username already exists
        const { data: existingUsername, error: usernameLookupError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.username);

        if (existingUsername && existingUsername.length > 0) {
          this.errorMessage = 'Username already exists!';
          this.isLoading = false;
          return;
        }

        // Check if email already exists
        const { data: existingEmail, error: emailLookupError } = await supabase
          .from('Credentials')
          .select('id')
          .eq('email', this.email);

        if (existingEmail && existingEmail.length > 0) {
          this.errorMessage = 'Email already registered!';
          this.isLoading = false;
          return;
        }

        // Insert data into Supabase Credentials table
        const { data, error } = await supabase
          .from('Credentials')
          .insert([
            {
              username: this.username,
              email: this.email,
              password: this.password
            }
          ])
          .select()

        if (error) {
          this.errorMessage = `Error: ${error.message}`;
          console.error('Supabase error:', error);
        } else {
          console.log('Registration successful:', data);
          
          // Create userInfo record with default stats
          if (data && data.length > 0) {
            const newUserId = data[0].id;
            const now = isoWithOffset(8);
            
            const { data: userInfoData, error: userInfoError } = await supabase
              .from('userInfo')
              .insert([
                {
                  userId: newUserId,
                  level: 1,
                  xp: 0,
                  gold: 10,
                  hp: 100,
                  lastActive: now,
                  updatedAt: now,
                  isActive: true
                }
              ])
              .select();
            
            if (userInfoError) {
              console.error('Error creating user stats:', userInfoError);
              this.errorMessage = 'Account created but failed to initialize stats';
            } else {
              console.log('✅ User info created successfully:', userInfoData);
              this.successMessage = 'Account created successfully! 🎉';
              
              // Reset form
              this.username = '';
              this.email = '';
              this.password = '';

              // Redirect to login after 2 seconds
              setTimeout(() => {
                this.$router.push('/');
              }, 2000);
            }
          }
        }
      } catch (error) {
        this.errorMessage = `Unexpected error: ${error.message}`;
        console.error('Unexpected error:', error);
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push('/');
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
  font-size: 36px;
  color: #ffcc00;
  margin: 0;
  text-shadow: 
    3px 3px 0px #8b5a00,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    3px 3px 0 #000;
}

.title-blue {
  font-family: 'Press Start 2P', cursive;
  font-size: 36px;
  color: #4dcfff;
  margin: -5px 0 0 0;
  text-shadow: 
    3px 3px 0px #005f87,
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    3px 3px 0 #000;
}

/* --- FORM BOX STYLES --- */
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  background-color: #3b2d26; 
  padding: 20px 30px;
  
  border: 4px solid #eebb4d;
  border-radius: 10px;
  
  box-shadow: 
    0 0 0 4px #1a1a1a,
    inset 0 0 0 4px #1a1a1a,
    0 10px 20px rgba(0,0,0,0.6);
    
  width: 100%;
  max-width: 380px;
  margin: 0 20px;
}

.form-header {
  font-family: 'VT323', monospace;
  font-size: 24px;
  color: #ffffff;
  margin: 0 0 3px 0;
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
  padding: 10px 12px;
  
  background-color: #24242e; 
  border: 4px solid #15151b;
  border-radius: 6px;
  
  color: #a0a0b0;
  font-family: 'VT323', monospace;
  font-size: 18px;
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
  padding: 10px 8px;
  margin-top: 5px;
  
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
}

form button:active {
  transform: translate(0, 4px);
  box-shadow: 0 0 0 #2a2e38;
  border-bottom: 4px solid transparent;
}

form button:hover:not(:disabled) {
  background-color: #8a94b0;
}

form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- MESSAGE STYLES --- */
.error-message {
  width: 100%;
  padding: 12px;
  background-color: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff4444;
  border-radius: 6px;
  color: #ff8888;
  font-family: 'VT323', monospace;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

.success-message {
  width: 100%;
  padding: 12px;
  background-color: rgba(0, 255, 0, 0.2);
  border: 2px solid #44ff44;
  border-radius: 6px;
  color: #88ff88;
  font-family: 'VT323', monospace;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}
</style>
