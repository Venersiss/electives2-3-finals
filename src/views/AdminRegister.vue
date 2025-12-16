<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
    <div class="pixel-card w-full max-w-md">
      <h1 class="text-4xl font-bold text-pixel-gold text-center mb-8">BYTE ADVENTURES</h1>
      <h2 class="text-2xl font-bold text-white text-center mb-8">ADMIN REGISTER</h2>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-pixel-gold font-bold mb-2">INVITATION CODE</label>
          <input 
            v-model="formData.invitationCode" 
            type="text" 
            class="pixel-input w-full"
            placeholder="Enter invitation code (e.g., A7K2Q9M4)"
            required
          />
          <p class="text-slate-400 text-xs mt-1">Ask an existing admin for an invitation code</p>
        </div>

        <div>
          <label class="block text-pixel-gold font-bold mb-2">EMAIL</label>
          <input 
            v-model="formData.email" 
            type="email" 
            class="pixel-input w-full"
            placeholder="Enter email address"
            @blur="validateEmail"
            required
          />
          <p v-if="emailError" class="text-red-400 text-sm mt-1">{{ emailError }}</p>
          <p v-if="formData.email && isValidEmail(formData.email)" class="text-green-400 text-sm mt-1">✓ Valid email</p>
        </div>

        <div>
          <label class="block text-pixel-gold font-bold mb-2">USERNAME</label>
          <input 
            v-model="formData.username" 
            type="text" 
            class="pixel-input w-full"
            placeholder="Enter username (3-20 characters)"
            minlength="3"
            maxlength="20"
            required
          />
        </div>

        <div>
          <label class="block text-pixel-gold font-bold mb-2">PASSWORD</label>
          <input 
            v-model="formData.password" 
            type="password" 
            class="pixel-input w-full"
            placeholder="Enter password (min 6 characters)"
            minlength="6"
            required
          />
        </div>

        <div>
          <label class="block text-pixel-gold font-bold mb-2">CONFIRM PASSWORD</label>
          <input 
            v-model="formData.confirmPassword" 
            type="password" 
            class="pixel-input w-full"
            placeholder="Confirm password"
            required
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="pixel-btn w-full mt-6 disabled:opacity-50"
        >
          {{ loading ? 'REGISTERING...' : 'CREATE ACCOUNT' }}
        </button>
      </form>

      <div v-if="error" class="mt-4 p-4 bg-red-900 border-2 border-red-600 rounded text-red-100">
        {{ error }}
      </div>

      <div v-if="success" class="mt-4 p-4 bg-green-900 border-2 border-green-600 rounded text-green-100">
        {{ success }}
      </div>

      <div class="mt-6 text-center">
        <p class="text-slate-400 mb-2">Already have an account?</p>
        <router-link to="/login" class="text-pixel-gold hover:text-yellow-300 font-bold">
          Back to Login →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase'

export default {
  name: 'AdminRegister',
  data() {
    return {
      formData: {
        invitationCode: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      error: null,
      success: null,
      emailError: null
    }
  },
  methods: {
    async handleRegister() {
      this.error = null
      this.success = null

      // Validation - check invitation code first
      if (!this.formData.invitationCode || !this.formData.invitationCode.trim()) {
        this.error = 'Invitation code is required'
        return
      }

      // Validation
      if (!this.formData.email || !this.formData.username || !this.formData.password) {
        this.error = 'All fields are required'
        return
      }

      // Email validation
      if (!this.isValidEmail(this.formData.email)) {
        this.error = 'Please enter a valid email address'
        return
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }

      if (this.formData.password.length < 6) {
        this.error = 'Password must be at least 6 characters'
        return
      }

      if (this.formData.username.length < 3 || this.formData.username.length > 20) {
        this.error = 'Username must be between 3 and 20 characters'
        return
      }

      this.loading = true

      try {
        // Validate invitation code
        const { data: invitation, error: invError } = await supabase
          .from('Invitations')
          .select('*')
          .eq('invitationCode', this.formData.invitationCode.toUpperCase())
          .single()

        if (invError || !invitation) {
          this.error = 'Invalid invitation code'
          this.loading = false
          return
        }

        if (invitation.isUsed) {
          this.error = 'This invitation has already been used'
          this.loading = false
          return
        }

        if (new Date() > new Date(invitation.expiresAt)) {
          this.error = 'This invitation has expired'
          this.loading = false
          return
        }

        if (invitation.invitedEmail.toLowerCase() !== this.formData.email.toLowerCase()) {
          this.error = 'Email must match the invitation email'
          this.loading = false
          return
        }

        // Check if username already exists
        const { data: existingUsername } = await supabase
          .from('adminCredentials')
          .select('username')
          .eq('username', this.formData.username)
          .single()

        if (existingUsername) {
          this.error = 'Username already taken'
          this.loading = false
          return
        }
      } catch (err) {
        // No existing user found (expected on first check)
        console.log('Username check completed')
      }

      try {
        // Check if email already exists
        const { data: existingEmail } = await supabase
          .from('adminCredentials')
          .select('email')
          .eq('email', this.formData.email)
          .single()

        if (existingEmail) {
          this.error = 'Email already registered'
          this.loading = false
          return
        }
      } catch (err) {
        // No existing user found (expected on first check)
        console.log('Email check completed')
      }

      try {
        // Insert new admin credential
        const { data: newAdmin, error } = await supabase
          .from('adminCredentials')
          .insert([
            {
              email: this.formData.email,
              username: this.formData.username,
              password: this.formData.password // In production, use hashed passwords!
            }
          ])
          .select()

        if (error) throw error

        // Mark invitation as used
        await supabase
          .from('Invitations')
          .update({
            isUsed: true,
            usedBy: newAdmin[0].id,
            usedAt: new Date().toISOString()
          })
          .eq('invitationCode', this.formData.invitationCode.toUpperCase())

        this.success = 'Account created successfully! Redirecting to login...'
        
        // Clear form
        this.formData = {
          invitationCode: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: ''
        }

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)

      } catch (err) {
        this.error = 'Registration failed: ' + err.message
        console.error('Registration error:', err)
      } finally {
        this.loading = false
      }
    },
    isValidEmail(email) {
      // Email regex pattern - checks for valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    validateEmail() {
      if (!this.formData.email) {
        this.emailError = null
        return
      }

      if (!this.isValidEmail(this.formData.email)) {
        this.emailError = 'Invalid email format (example: admin@company.com)'
      } else {
        this.emailError = null
      }
    }
  }
}
</script>

<style scoped>
/* Same styling as login page */
</style>
