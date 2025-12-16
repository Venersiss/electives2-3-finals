<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
    <div class="pixel-card w-full max-w-md">
      <h1 class="text-4xl font-bold text-pixel-gold text-center mb-8">BYTE ADVENTURES</h1>
      <h2 class="text-2xl font-bold text-white text-center mb-8">ADMIN LOGIN</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-pixel-gold font-bold mb-2">USERNAME</label>
          <input 
            v-model="username" 
            type="text" 
            class="pixel-input w-full"
            placeholder="Enter admin username"
            required
          />
        </div>

        <div>
          <label class="block text-pixel-gold font-bold mb-2">PASSWORD</label>
          <input 
            v-model="password" 
            type="password" 
            class="pixel-input w-full"
            placeholder="Enter password"
            required
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="pixel-btn w-full mt-6 disabled:opacity-50"
        >
          {{ loading ? 'LOGGING IN...' : 'LOGIN' }}
        </button>
      </form>

      <div v-if="error" class="mt-4 p-4 bg-red-900 border-2 border-red-600 rounded text-red-100">
        {{ error }}
      </div>

      <div class="mt-6 text-center">
        <p class="text-slate-400 mb-2">No account yet?</p>
        <router-link to="/register" class="text-pixel-gold hover:text-yellow-300 font-bold">
          Create Admin Account →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase'

export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: null
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = null

      try {
        // Query adminCredentials table
        const { data, error } = await supabase
          .from('adminCredentials')
          .select('*')
          .eq('username', this.username)
          .eq('password', this.password)
          .single()

        if (error || !data) {
          this.error = 'Invalid username or password'
          this.loading = false
          return
        }

        // Login successful - store minimal session info (only token and admin ID)
        localStorage.setItem('adminToken', 'admin_token_' + Date.now())
        localStorage.setItem('adminId', data.id)  // Store only the ID to fetch data from DB
        
        console.log('✅ Admin login successful:', data.username)
        this.$router.push('/dashboard')

      } catch (err) {
        this.error = 'Login failed: ' + err.message
        console.error('Login error:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
