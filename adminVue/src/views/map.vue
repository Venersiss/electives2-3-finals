<template>
  <div class="map-container" @click="handleMapClick">
  <video class="map-background" autoplay muted loop playsinline>
  <source src="/Bit_Fantasy_Map_Video_Generation.mp4" type="video/mp4">
</video>
    <div class="map-background-fallback"></div>

    <!-- Background Audio -->
    <audio ref="bgAudio" loop>
      <source src="/Pokemon RubySapphireEmerald- Littleroot Town.mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>

    <!-- Title -->
    <div class="title-overlay">
      <h1>BYTE ADVENTURES</h1>
      <p>SELECT A LOCATION TO BEGIN YOUR QUEST</p>
    </div>

    <!-- Back Button -->
    <button class="back-button" @click="logout">← LOGOUT</button>

    <!-- Audio Mute Toggle -->
    <button class="audio-toggle" @click.stop="toggleMute">{{ isMuted ? '🔇' : '🔊' }}</button>

    <!-- World Chat Toggle -->
    <button v-if="currentUsername && currentUsername !== 'Guest'" class="world-chat-toggle" @click.stop="toggleWorldChat" title="Toggle World Chat">💬</button>

    <!-- World Chat Toggle -->
    <button v-if="currentUsername && currentUsername !== 'Guest'" class="world-chat-toggle" @click.stop="toggleWorldChat" title="Toggle World Chat">💬</button>

    <!-- Interactive overlay -->
    <div class="map-overlay">
      <!-- Location markers -->
      <div 
        v-for="(location, key) in locations" 
        :key="key"
        class="location-marker"
        :style="location.position"
        :data-location="key"
        @click.stop="showLocationInfo(key)">
        <div class="marker-box">{{ location.name }}</div>
      </div>
    </div>

    <!-- Location info panel -->
    <div class="location-info" :class="{ active: isInfoActive }" :style="infoPanelPos" @click.stop>
      <button class="close-button" @click="closeInfo">✕</button>
      <h2 id="locationTitle">{{ selectedLocation.title }}</h2>
      <p id="locationDesc">
        {{ selectedLocationBoss ? selectedLocationBoss.description : selectedLocation.description }}
      </p>
      <button class="quest-button" @click="startQuest">⚔️ START QUEST</button>
    </div>

    <!-- Dynamic Location Challenge Modal (using Outskirts as base) -->
    <QuestModal 
      v-if="showQuestModal"
      :location-key="selectedLocationKey"
      :locations="locations"
      :background-video="selectedLocationBackgroundVideo"
      @close="closeQuestModal"
      @quest-complete="onQuestComplete"
    />
  </div>
</template>

<script>
import { supabase } from '@/library/supabase'
import { isoWithOffset } from '@/library/time'
import QuestModal from '@/components/QuestModal.vue'

export default {
  name: 'MapView',
  components: {
    QuestModal
  },
  data() {
    return {
      isMuted: false,
      isInfoActive: false,
      currentLocation: null,
      selectedLocationKey: null,
      showQuestModal: false,
      selectedLocationBackgroundVideo: '/Retro_RPG_Boss_Battle_Video_Generation.mp4',
      infoPanelPos: { top: '20px', left: '20px' },
      selectedLocationBoss: null,
      currentUsername: '',
      locations: {
        capital: {
          name: 'CAPITAL CITY',
          title: 'CAPITAL CITY',
          description: 'The grand capital stands as a beacon of civilization. Master Vue.js fundamentals to prove your worth in this bustling metropolis.',
          difficulty: 'Beginner',
          position: { top: '60%', left: '50%' },
          dbLocation: 'Capital City',
          isQuestLocation: false,
          backgroundVideo: '/Retro_RPG_Boss_Battle_Video_Generation.mp4'
        },
        darkwood: {
          name: 'DARKWOOD FOREST',
          title: 'DARKWOOD FOREST',
          description: 'Ancient trees hide mysterious secrets within the shadows. Master component lifecycle methods to survive the shadowy depths.',
          difficulty: 'Intermediate',
          position: { top: '45%', left: '14%' },
          dbLocation: 'Darkwood Forest',
          isQuestLocation: true,
          backgroundVideo: '/Pixel_Art_Golem_Standoff.mp4'
        },
        frost: {
          name: 'FROST PEAKS',
          title: 'FROST PEAKS',
          description: 'Treacherous mountains where blizzards rage eternally. Conquer advanced Vue composition API challenges to reach the summit.',
          difficulty: 'Advanced',
          position: { top: '10%', left: '73%' },
          dbLocation: 'Frost Peaks',
          isQuestLocation: true,
          backgroundVideo: '/Pixel_Art_Dragon_Standoff_Scene.mp4'
        },
        crystal: {
          name: 'CRYSTAL BAY',
          title: 'CRYSTAL BAY',
          description: 'Peaceful shores shimmer with crystalline waters and hidden treasures. Learn reactive data and props in this serene location.',
          difficulty: 'Beginner',
          position: { top: '80%', left: '90%' },
          dbLocation: 'Crystal Bay',
          isQuestLocation: true,
          backgroundVideo: '/Bit_Kraken_Boss_Prompt_Generation.mp4'
        },
        scorched: {
          name: 'SCORCHED SANDS',
          title: 'SCORCHED SANDS',
          description: 'An unforgiving desert filled with endless trials and mirages. Test your Vuex state management skills in extreme heat.',
          difficulty: 'Intermediate',
          position: { top: '53%', left: '83%' },
          dbLocation: 'Scorched Sands',
          isQuestLocation: true,
          backgroundVideo: '/Pixel_Art_Centipede_Standoff.mp4'
        },
        barren: {
          name: 'BARREN LANDS',
          title: 'BARREN LANDS',
          description: 'Desolate terrain stretches across the horizon. Practice Vue directives and data binding in this harsh environment.',
          difficulty: 'Beginner',
          position: { top: '80%', left: '67%' },
          dbLocation: 'Barren Lands',
          isQuestLocation: true,
          backgroundVideo: '/Pixel_Art_Boss_Battle_Standoff.mp4'
        },
        volcanic: {
          name: 'VOLCANIC DUNGEON',
          title: 'VOLCANIC DUNGEON',
          description: 'Molten lava flows and scorching heat define this infernal realm. Tackle complex computed properties and watchers.',
          difficulty: 'Intermediate',
          position: { top: '33%', left: '74%' },
          dbLocation: 'Volcanic Dungeon',
          isQuestLocation: true,
          backgroundVideo: '/Pixel_Art_Volcanic_Snail_Encounter.mp4'
        },
        shadow: {
          name: 'SHADOW DUNGEON',
          title: 'SHADOW DUNGEON',
          description: 'Darkness envelops this mysterious dungeon shrouded in ancient magic. Learn custom directives and mixins to unveil secrets.',
          difficulty: 'Intermediate',
          position: { top: '23%', left: '48%' },
          dbLocation: 'Shadow Dungeon',
          isQuestLocation: true,
          backgroundVideo: '/Pixel_Art_Grim_Reaper_Standoff.mp4'
        },
        village: {
          name: 'OUTSKIRTS VILLAGE',
          title: 'OUTSKIRTS VILLAGE',
          description: 'A humble village on the edge of civilization offers refuge and wisdom. Master the fundamentals of Vue development here.',
          difficulty: 'Intermediate',
          position: { top: '68%', left: '26%' },
          dbLocation: 'Outskirts Village',
          isQuestLocation: true,
          backgroundVideo: '/Retro_RPG_Boss_Battle_Video_Generation.mp4'
        },
      }
    }
  },
  mounted() {
    // Restore mute preference and play background audio after user interaction
    this.isMuted = localStorage.getItem('mapMuted') === 'true'
    this.currentUsername = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'Guest'
    document.addEventListener('click', () => this.playAudio(), { once: true });
    // Ensure audio element muted state is synced if already present
    this.$nextTick(() => {
      const audio = this.$refs.bgAudio
      if (audio) audio.muted = this.isMuted
    })
  },
  computed: {
    selectedLocation() {
      if (!this.currentLocation) {
        return { title: 'LOCATION', description: 'Description' }
      }
      return this.locations[this.currentLocation]
    }
  },
  methods: {
    playAudio() {
      const audio = this.$refs.bgAudio
      if (audio) {
        audio.muted = this.isMuted
        audio.play().catch(error => {
          console.log("Audio play failed:", error)
        })
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted
      try {
        const audio = this.$refs.bgAudio
        if (audio) {
          audio.muted = this.isMuted
          // If unmuting and audio is paused, try to play
          if (!this.isMuted && audio.paused) {
            audio.play().catch(() => {})
          }
        }
      } catch (e) {
        console.warn('Audio toggle error:', e)
      }
      localStorage.setItem('mapMuted', this.isMuted ? 'true' : 'false')
    },
    toggleWorldChat() {
      this.$root.toggleWorldChat()
    },
    async showLocationInfo(locationKey) {
      this.currentLocation = locationKey
      
      // Fetch bosses for this location from Supabase
      try {
        const dbLocation = this.locations[locationKey].dbLocation
        const { data, error } = await supabase
          .from('bosses')
          .select('*')
          .eq('location', dbLocation)
        
        if (error) throw error
        
        // If bosses exist for this location, use the first one
        if (data && data.length > 0) {
          this.selectedLocationBoss = data[0]
        } else {
          this.selectedLocationBoss = null
        }
      } catch (err) {
        console.error('Error loading boss:', err)
        this.selectedLocationBoss = null
      }
      
      this.isInfoActive = true
      
      // Position the info panel near the clicked marker
      const location = this.locations[locationKey]
      
      // Convert percentage to pixel values based on viewport
      const markerTopPercent = parseFloat(location.position.top)
      const markerLeftPercent = parseFloat(location.position.left)
      
      const markerTop = (markerTopPercent / 100) * window.innerHeight
      const markerLeft = (markerLeftPercent / 100) * window.innerWidth
      
      // Position panel below the marker, keeping it on screen
      let panelTop = markerTop + 80
      let panelLeft = markerLeft - 150
      
      // Keep panel within viewport bounds
      if (panelLeft < 20) panelLeft = 20
      if (panelLeft + 300 > window.innerWidth) panelLeft = window.innerWidth - 320
      if (panelTop + 300 > window.innerHeight) panelTop = window.innerHeight - 320
      
      this.infoPanelPos = { 
        top: `${panelTop}px`, 
        left: `${panelLeft}px` 
      }
    },
    closeInfo() {
      this.isInfoActive = false
      this.currentLocation = null
      this.selectedLocationBoss = null
    },
    startQuest() {
      if (this.currentLocation) {
        console.log('Starting quest at:', this.currentLocation)
        const location = this.locations[this.currentLocation]
        
        // Check if it's a quest location or capital city
        if (location.isQuestLocation) {
          // Open quest modal for quest locations
          this.selectedLocationKey = this.currentLocation
          this.selectedLocationBackgroundVideo = location.backgroundVideo || '/Retro_RPG_Boss_Battle_Video_Generation.mp4'
          this.showQuestModal = true
        } else if (this.currentLocation === 'capital') {
          // Navigate to capital.vue for capital city
          this.$router.push('/capital')
        }
        
        this.closeInfo()
      }
    },
    closeQuestModal() {
      this.showQuestModal = false
      this.selectedLocationKey = null
      
      // Resume map audio with fade in
      const mapAudio = this.$refs.bgAudio
      if (mapAudio) {
        console.log('🔊 Resuming map audio...')
        mapAudio.muted = this.isMuted
        mapAudio.volume = 0
        mapAudio.play().catch(error => {
          console.log("Audio play failed:", error)
        })
        const fadeInInterval = setInterval(() => {
          if (mapAudio.volume < 1) {
            mapAudio.volume = Math.min(1, mapAudio.volume + 0.05)
          } else {
            clearInterval(fadeInInterval)
            console.log('✓ Map audio faded in')
          }
        }, 50)
      }
    },
    onQuestComplete() {
      // Called when quest is completed, can add any additional logic here
      this.closeQuestModal()
    },
    handleMapClick(e) {
      // Close info panel when clicking on map background
      if (e.target === this.$el || e.target.classList.contains('map-overlay') || e.target.classList.contains('map-background-fallback')) {
        this.closeInfo()
      }
    },
    async logout() {
      // Attempt to mark user as inactive in the DB, then clear session
      const user = localStorage.getItem('currentUser')
      if (user) {
        try {
          const { data, error } = await supabase
            .from('Credentials')
            .select('id')
            .eq('username', user)
            .maybeSingle()

          const now = isoWithOffset(8)
          if (data && data.id) {
            const { error: uiErr } = await supabase
              .from('userInfo')
              .update({ isActive: false, lastActive: now, updatedAt: now })
              .eq('userId', data.id)

            if (uiErr) console.warn('Failed to update userInfo on logout:', uiErr)
          }
        } catch (err) {
          console.error('Logout userInfo update error:', err)
        }
      }

      // Clear local session and navigate to login
      localStorage.removeItem('currentUser')
      this.$router.push('/')
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

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.map-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Press Start 2P', cursive;
  background: #000;
  margin: 0;
  padding: 0;
  animation: fadeInPage 0.5s ease-in-out;
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 1;
  min-width: 100%;
  min-height: 100%;
}

/* Fallback gradient if no image */
.map-background-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2d5016 0%, #1a4d2e 25%, #4a7c59 50%, #8b7355 75%, #d4af37 100%);
  z-index: 1;
  opacity: 0.3;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.3; }
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.location-marker {
  position: absolute;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;
}

.marker-box {
  padding: 6px 10px;
  background: linear-gradient(145deg, #FFD700, #FFA500);
  border: 3px solid #000;
  box-shadow: 
    inset -2px -2px #654321,
    inset 2px 2px #FFFFFF,
    3px 3px 0px #000,
    5px 5px 0px rgba(0, 0, 0, 0.3);
  font-family: 'Press Start 2P', cursive;
  font-size: 8px;
  font-weight: bold;
  color: #000;
  white-space: nowrap;
  text-align: center;
  animation: pixel-pulse 1.5s ease-in-out infinite;
  line-height: 1.2;
}

@keyframes pixel-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes fadeInPage {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.location-marker:hover .marker-box {
  animation: none;
  background: linear-gradient(145deg, #FFED4E, #FFD700);
  box-shadow: 
    inset -2px -2px #654321,
    inset 2px 2px #FFFFFF,
    0px 0px 0px 3px #FFD700,
    3px 3px 0px #000,
    5px 5px 0px rgba(0, 0, 0, 0.3);
  transform: scale(1.15) translateY(-5px);
}

.location-info {
  position: absolute;
  background: rgba(59, 45, 38, 0.95);
  border: 4px solid #eebb4d;
  border-radius: 10px;
  padding: 10px 15px;
  max-width: 400px;
  width: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 100;
  transform: scale(0.8);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}

.location-info.active {
  transform: scale(1);
  opacity: 1;
  pointer-events: auto;
}

.location-info h2 {
  color: #ffcc00;
  font-size: 12px;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  text-shadow: 2px 2px #000;
}

.location-info p {
  color: #a0a0b0;
  font-size: 8px;
  margin: 0 0 4px 0;
  line-height: 1.2;
  text-transform: uppercase;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: rgba(238, 187, 77, 0.8);
  border: 2px solid #fff;
  border-radius: 50%;
  color: #000;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 204, 0, 1);
  transform: rotate(90deg);
}

.quest-button {
  width: 100%;
  background: rgba(123, 133, 161, 0.9);
  color: #fff;
  border: 2px solid #eebb4d;
  padding: 6px;
  font-size: 10px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  border-radius: 4px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.quest-button:hover {
  background: rgba(138, 148, 176, 1);
  transform: scale(1.05);
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

/* Audio toggle button (mute/unmute) */
.audio-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 300;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(238, 187, 77, 0.95);
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.6);
}

.audio-toggle:hover {
  transform: scale(1.05);
  background: rgba(255, 204, 0, 1);
}

/* World chat toggle button */
.world-chat-toggle {
  position: fixed;
  top: 20px;
  right: 75px;
  z-index: 300;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(138, 58, 26, 0.95);
  border: 3px solid #D4AF37;
  color: #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.6);
  transition: all 0.3s ease;
}

.world-chat-toggle:hover {
  transform: scale(1.05);
  background: rgba(160, 82, 45, 1);
}

/* World chat toggle button */
.world-chat-toggle {
  position: fixed;
  top: 20px;
  right: 75px;
  z-index: 300;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(138, 58, 26, 0.95);
  border: 3px solid #D4AF37;
  color: #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.6);
  transition: all 0.3s ease;
}

.world-chat-toggle:hover {
  transform: scale(1.05);
  background: rgba(160, 82, 45, 1);
}

@media (max-width: 768px) {
  .marker-icon {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .location-label {
    font-size: 8px;
    padding: 6px 12px;
  }

  .location-info {
    padding: 15px 20px;
    max-width: 90%;
  }

  .title-overlay h1 {
    font-size: 18px;
  }
}


    .location-label {
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(59, 45, 38, 0.95);
      color: #fff;
      padding: 8px 16px;
      border: 3px solid #eebb4d;
      border-radius: 8px;
      font-size: 10px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
      text-shadow: 2px 2px #000;
      z-index: 10;
    }

    .location-marker:hover .location-label {
      opacity: 1;
    }

    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #a1574a;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
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

    @media (max-width: 768px) {
      .marker-icon {
        width: 30px;
        height: 30px;
        font-size: 16px;
      }

      .location-label {
        font-size: 8px;
        padding: 6px 12px;
      }

      .location-info {
        padding: 15px 20px;
        max-width: 90%;
      }

      .title-overlay h1 {
        font-size: 18px;
      }
    }
  </style>