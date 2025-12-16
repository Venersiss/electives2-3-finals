<script>
import { RouterView } from 'vue-router'
import WorldChat from '@/components/WorldChat.vue'

export default {
  name: 'App',
  components: {
    RouterView,
    WorldChat
  },
  data() {
    return {
      showWorldChat: false,
      currentUsername: ''
    }
  },
  mounted() {
    // Get current username from localStorage
    this.currentUsername = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'Guest'
    console.log('🎮 App mounted - Username:', this.currentUsername)
    
    // Listen for storage changes (logout from other tabs or components)
    window.addEventListener('storage', this.onStorageChange)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.onStorageChange)
  },
  watch: {
    currentUsername(newVal) {
      // Close chat if user logs out
      if (newVal === 'Guest' || !newVal) {
        this.showWorldChat = false
        console.log('🔐 User logged out - Chat closed')
      }
    },
    '$route'() {
      // Also check and update username when route changes (e.g., logout redirects to login)
      const newUsername = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'Guest'
      if (newUsername !== this.currentUsername) {
        this.currentUsername = newUsername
      }
    }
  },
  methods: {
    toggleWorldChat() {
      this.showWorldChat = !this.showWorldChat
      console.log('💬 World Chat toggled:', this.showWorldChat ? 'OPEN' : 'CLOSED')
    },
    onStorageChange(e) {
      // Handle logout detected in storage
      if (e.key === 'currentUser' && !e.newValue) {
        this.currentUsername = 'Guest'
        this.showWorldChat = false
        console.log('🔐 Logout detected via storage - Chat closed')
      }
    }
  }
}
</script>

<template>
  <div class="app-container">
    <!-- Global World Chat Toggle Button -->
    <button 
      v-if="currentUsername && currentUsername !== 'Guest'"
      class="global-chat-toggle"
      @click="toggleWorldChat"
      title="Toggle World Chat">
      💬
    </button>

    <!-- Global World Chat (visible across all pages) -->
    <div v-if="showWorldChat" class="global-chat-wrapper">
      <WorldChat :currentUsername="currentUsername" />
    </div>

    <!-- Router Views -->
    <RouterView />
  </div>
</template>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

* {
  box-sizing: border-box;
}

.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.global-chat-toggle {
  position: fixed;
  bottom: 325px;
  right: calc(20px + -750px + 15px);
  z-index: 1000;
  
  width: 60px;
  height: 60px;
  border-radius: 8px;
  
  background: linear-gradient(135deg, #8B3A1A, #A0522D);
  border: 3px solid #D4AF37;
  color: #D4AF37;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(0, 0, 0, 0.5);
  user-select: none;
  font-family: 'Georgia', serif;
  overflow: hidden;
}

.global-chat-toggle::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.3), transparent);
  transform: rotate(45deg);
}

.global-chat-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.6), inset 0 0 15px rgba(212, 175, 55, 0.2);
  background: linear-gradient(135deg, #A0522D, #CD853F);
  border-color: #FFD700;
}

.global-chat-toggle:active {
  transform: scale(0.95);
}

.global-chat-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  width: 350px;
  height: 500px;
  animation: slideUp 0.3s ease-out forwards;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.8));
}

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

@media (max-width: 768px) {
  .global-chat-toggle {
    width: 40px;
    height: 40px;
    font-size: 18px;
    top: 15px;
    right: 70px;
  }

  .global-chat-wrapper {
    bottom: 15px;
    right: 15px;
    width: 95vw;
    max-width: 350px;
  }
}
</style>
