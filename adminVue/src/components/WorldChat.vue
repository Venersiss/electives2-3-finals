<template>
  <div class="world-chat-container chat-expanded">
    <!-- Chat Header -->
    <div class="chat-header">
      <span class="chat-title">💬 WORLD CHAT</span>
    </div>

    <!-- Chat Messages -->
    <div class="chat-messages">
      <div v-if="messages.length === 0" class="no-messages">
        <p>No messages yet. Start chatting!</p>
      </div>
      <div v-else class="messages-list">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-item"
          :class="{ 'sent': msg.username === currentUsername, 'received': msg.username !== currentUsername }"
        >
          <div class="message-header" v-if="msg.username !== currentUsername">
            <span class="username">{{ msg.username }}</span>
          </div>
          <div class="message-content">{{ msg.message }}</div>
          <span class="timestamp">{{ formatTime(msg.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="chat-input-area">
      <input
        v-model="newMessage"
        type="text"
        class="chat-input"
        placeholder="Type a message..."
        @keyup.enter="sendMessage"
      />
      <button class="send-button" @click="sendMessage">SEND</button>
    </div>
  </div>
</template>

<script>
import { supabase } from '../library/supabase'
import { isoWithOffset } from '../library/time'

export default {
  name: 'WorldChat',
  props: {
    currentUsername: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      loading: false,
      subscription: null,
      currentUserId: null
    }
  },
  async mounted() {
    console.log('🎮 WorldChat mounted with username:', this.currentUsername)
    await this.fetchUserIdFromUsername()
    await this.loadChatMessages()
    this.subscribeToNewMessages()
  },
  beforeUnmount() {
    if (this.subscription) {
      console.log('🔌 Unsubscribing from chat messages')
      this.subscription.unsubscribe()
    }
  },
  methods: {
    async fetchUserIdFromUsername() {
      try {
        const { data, error } = await supabase
          .from('Credentials')
          .select('id')
          .eq('username', this.currentUsername)
          .maybeSingle()

        if (error) {
          console.error('❌ Error fetching user ID:', error)
          return
        }

        if (data) {
          this.currentUserId = data.id
          console.log('✓ User ID found:', this.currentUserId)
        }
      } catch (err) {
        console.error('❌ Exception in fetchUserIdFromUsername:', err)
      }
    },
    async loadChatMessages() {
      try {
        console.log('📨 Loading chat messages...')
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100) // Load last 100 messages

        if (error) {
          console.error('❌ Error loading chat messages:', error)
          return
        }

        this.messages = data || []
        console.log('✓ Loaded', this.messages.length, 'chat messages')
        this.scrollToBottom()
      } catch (err) {
        console.error('❌ Exception in loadChatMessages:', err)
      }
    },
    subscribeToNewMessages() {
      try {
        console.log('🔔 Subscribing to new chat messages...')
        this.subscription = supabase
          .channel('chat_messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages'
            },
            (payload) => {
              console.log('📩 New message received:', payload.new)
              this.messages.push(payload.new)
              this.scrollToBottom()
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✓ Successfully subscribed to chat messages')
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Error subscribing to chat messages')
            }
          })
      } catch (err) {
        console.error('❌ Exception in subscribeToNewMessages:', err)
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim()) {
        console.warn('⚠️ Empty message, not sending')
        return
      }

      if (!this.currentUsername) {
        console.error('❌ Username not available')
        return
      }

      this.loading = true
      const messageText = this.newMessage.trim()

      try {
        console.log('📤 Sending message:', messageText)

        const { data, error } = await supabase
          .from('chat_messages')
          .insert([
            {
              username: this.currentUsername,
              user_id: this.currentUserId,
              message: messageText,
              created_at: isoWithOffset()
            }
          ])
          .select()

        if (error) {
          console.error('❌ Error sending message:', error)
          alert('Failed to send message: ' + error.message)
          return
        }

        console.log('✓ Message sent successfully')
        
        // Add the message to the local array immediately so it appears right away
        if (data && data.length > 0) {
          this.messages.push(data[0])
          this.scrollToBottom()
        }
        
        this.newMessage = ''
      } catch (err) {
        console.error('❌ Exception in sendMessage:', err)
        alert('Error sending message: ' + err.message)
      } finally {
        this.loading = false
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const messagesList = this.$el.querySelector('.messages-list')
        if (messagesList) {
          messagesList.scrollTop = messagesList.scrollHeight
        }
      })
    },
    formatTime(timestamp) {
      try {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      } catch (err) {
        return 'unknown'
      }
    }
  }
}
</script>

<style scoped>
.world-chat-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(20, 10, 30, 0.98), rgba(30, 15, 40, 0.98));
  border: 3px solid #8B4513;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'Georgia', serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(212, 175, 55, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
}

.world-chat-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #D4AF37, #A0522D, #D4AF37, transparent);
  pointer-events: none;
}

.world-chat-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8B4513, #D4AF37, #8B4513, transparent);
  pointer-events: none;
}

.world-chat-container.chat-expanded {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: linear-gradient(135deg, #654321, #8B4513);
  color: #D4AF37;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  font-size: 13px;
  font-weight: bold;
  transition: all 0.3s ease;
  border-bottom: 2px solid #D4AF37;
  font-family: 'Georgia', serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  position: relative;
}

.chat-header::before {
  content: '⚔️';
  margin-right: 8px;
}

.chat-header::after {
  content: '⚔️';
  margin-left: 8px;
}

.chat-header:hover {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  box-shadow: inset 0 0 15px rgba(212, 175, 55, 0.2);
}

.chat-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.chat-toggle {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: linear-gradient(135deg, rgba(15, 5, 25, 0.7), rgba(20, 10, 30, 0.7));
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 12px;
  animation: slideInMessage 0.3s ease-out;
  max-width: 85%;
  word-wrap: break-word;
}

.message-item.sent {
  align-self: flex-end;
  background: linear-gradient(135deg, #8B0000, #DC143C);
  border: 2px solid #FFD700;
  border-radius: 8px;
}

.message-item.received {
  align-self: flex-start;
  background: linear-gradient(135deg, rgba(40, 20, 60, 0.8), rgba(50, 30, 70, 0.8));
  border-left: 3px solid #D4AF37;
  border-radius: 8px;
}

@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-header {
  margin-bottom: 4px;
  font-size: 8px;
}

.username {
  color: #FFD700;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-family: 'Georgia', serif;
}

.timestamp {
  color: rgba(212, 175, 55, 0.6);
  font-size: 7px;
  margin-top: 2px;
}

.message-item.sent .timestamp {
  text-align: right;
}

.message-content {
  font-size: 9px;
  word-wrap: break-word;
  line-height: 1.4;
}

.message-item.sent .message-content {
  color: #FFD700;
  font-weight: 500;
}

.message-item.received .message-content {
  color: #D4AF37;
}

.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8B7355;
  font-size: 13px;
  text-align: center;
  padding: 20px;
  font-family: 'Georgia', serif;
}

.no-messages p {
  margin: 0;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(135deg, rgba(15, 5, 25, 0.7), rgba(20, 10, 30, 0.7));
  border-top: 2px solid #8B4513;
}

.chat-input {
  flex: 1;
  background: rgba(10, 5, 15, 0.8);
  border: 2px solid #8B4513;
  color: #D4AF37;
  font-family: 'Georgia', serif;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s ease;
}

.chat-input::placeholder {
  color: #5A4A3A;
}

.chat-input:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.4), inset 0 0 8px rgba(212, 175, 55, 0.1);
  background: rgba(20, 10, 30, 0.9);
}

.send-button {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  border: 2px solid #D4AF37;
  color: #D4AF37;
  padding: 8px 14px;
  font-family: 'Georgia', serif;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.send-button:hover {
  background: linear-gradient(135deg, #A0522D, #CD853F);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.5);
  border-color: #FFD700;
}

.send-button:active {
  transform: translateY(0);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #eebb4d;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #ffcc00;
}

@media (max-width: 500px) {
  .world-chat-container {
    width: 90%;
    right: 5%;
  }

  .world-chat-container.chat-expanded {
    height: 400px;
  }
}
</style>
