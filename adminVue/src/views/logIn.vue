<template>
  <div class="login-page">
    <video playsinline autoplay muted loop id="bg-video">
      <!-- Make sure this file path is correct -->
      <source src="/Pixel_Art_Dragon_Sunset_Scene.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <!-- Background Music -->
    <audio autoplay loop>
      <source src="/background-music.mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>

    <div class="login-content">
      <!-- 1. The Game Logo Title -->
      <div class="game-title">
        <h1 class="title-gold">BYTE</h1>
        <h1 class="title-blue">ADVENTURES</h1>
      </div>

      <!-- 2. The Login Box -->
      <form @submit.prevent="login">
        <h2 class="form-header">ADVENTURER LOGIN</h2>
        
        <!-- Added the little cursor | in placeholder to match reference -->
        <div class="input-group">
          <input type="text" placeholder="USERNAME" required>
        </div>
        <div class="input-group">
          <input type="password" placeholder="PASSWORD" required>
        </div>

        <button type="submit">
          <span class="sword-icon">🗡️</span> START GAME
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "Hello World"
    }
  },
  methods: {
    login() {
      console.log("Login submitted");
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

/* Main Content Container */
.login-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 20px; /* Space between Logo and Box */
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
  color: #ffcc00; /* Gold */
  margin: 0;
  /* Thick black outline logic */
  text-shadow: 
    4px 4px 0px #8b5a00, /* Darker Gold Shadow */
    -2px -2px 0 #000,  
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    4px 4px 0 #000;
}

.title-blue {
  font-family: 'Press Start 2P', cursive;
  font-size: 50px;
  color: #4dcfff; /* Cyan/Blue */
  margin: -10px 0 0 0; /* Pull it up closer to QUEST */
  /* Thick black outline logic */
  text-shadow: 
    4px 4px 0px #005f87, /* Darker Blue Shadow */
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
  
  /* The Main Brown Background */
  background-color: #3b2d26; 
  padding: 25px 35px;
  
  /* The Golden Border */
  border: 4px solid #eebb4d;
  border-radius: 10px;
  
  /* The Double Border Effect (Black inside Gold) */
  box-shadow: 
    0 0 0 4px #1a1a1a, /* Black outline outside gold */
    inset 0 0 0 4px #1a1a1a, /* Black outline inside gold */
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
  
  /* Dark Grey/Purpleish Background */
  background-color: #24242e; 
  border: 4px solid #15151b; /* Inset look */
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
  border-color: #eebb4d; /* Gold highlight on focus */
  color: #fff;
}

/* --- BUTTON STYLES --- */
button {
  width: 100%;
  padding: 12px 10px;
  margin-top: 10px;
  
  /* Stone Blue Gradient */
  background-color: #7b85a1;
  color: white;
  
  font-family: 'Press Start 2P', cursive; /* Blocky font for button */
  font-size: 16px; /* Smaller size for this specific font */
  text-transform: uppercase;
  cursor: pointer;
  
  /* The 3D Stone Button Border */
  border: none;
  border-top: 4px solid #9fa9c2;    /* Light highlight top */
  border-left: 4px solid #9fa9c2;   /* Light highlight left */
  border-bottom: 4px solid #4a5061; /* Dark shadow bottom */
  border-right: 4px solid #4a5061;  /* Dark shadow right */
  
  border-radius: 6px;
  box-shadow: 0 4px 0 #2a2e38; /* Extra depth shadow below button */
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-shadow: 2px 2px #000;
}

button:active {
  transform: translate(0, 4px); /* Pushes down */
  box-shadow: 0 0 0 #2a2e38; /* Removes shadow */
  border-bottom: 4px solid transparent;
}

button:hover {
  background-color: #8a94b0;
}

.sword-icon {
  font-size: 20px;
  filter: drop-shadow(2px 2px 0 #000);
}
</style>