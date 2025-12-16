<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
    <!-- Header -->
    <div class="m-4 p-4 bg-slate-800 rounded-md flex justify-between items-center flex-wrap gap-4">
      <h1 class="text-3xl md:text-4xl font-bold text-pixel-gold">BOSS MANAGER</h1>
      <router-link to="/dashboard" class="pixel-btn-secondary px-4 py-2 whitespace-nowrap">← BACK</router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 m-4">
      <!-- Add/Edit Form -->
      <div class="lg:col-span-1">
        <div class="p-4 bg-slate-800 rounded-md">
          <h2 class="text-xl md:text-2xl font-bold text-pixel-gold mb-4">{{ editingId ? 'EDIT BOSS' : 'ADD NEW BOSS' }}</h2>
          
          <form @submit.prevent="saveBoss" class="space-y-4">
            <div>
              <label class="block text-pixel-gold font-bold mb-2">BOSS NAME</label>
              <input 
                v-model="formData.name" 
                type="text"
                class="pixel-input w-full"
                placeholder="e.g., Dragon King"
                required
              />
            </div>

            <div>
              <label class="block text-pixel-gold font-bold mb-2">LOCATION</label>
              <select v-model="formData.location" class="pixel-select w-full" required>
                <option value="">-- SELECT LOCATION --</option>
                <option value="Capital City">Capital City</option>
                <option value="Outskirts Village">Outskirts Village</option>
                <option value="Darkwood Forest">Darkwood Forest</option>
                <option value="Crystal Bay">Crystal Bay</option>
                <option value="Barren Lands">Barren Lands</option>
                <option value="Volcanic Dungeon">Volcanic Dungeon</option>
                <option value="Scorched Sands">Scorched Sands</option>
                <option value="Shadow Dungeon">Shadow Dungeon</option>
                <option value="Frost Peaks">Frost Peaks</option>
              </select>
            </div>

            <div>
              <label class="block text-pixel-gold font-bold mb-2">DIFFICULTY</label>
              <select v-model="formData.difficulty" class="pixel-select w-full">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>

            <div>
              <label class="block text-pixel-gold font-bold mb-2">PROBLEM DESCRIPTION</label>
              <textarea 
                v-model="formData.description"
                class="pixel-textarea w-full h-24"
                placeholder="Describe the coding challenge..."
              ></textarea>
            </div>

            <div>
              <label class="block text-pixel-gold font-bold mb-2">INITIAL CODE</label>
              <textarea 
                v-model="formData.initialCode"
                class="pixel-textarea w-full h-24 font-mono text-sm"
                placeholder="function solve() {&#10;  // Code here&#10;}"
              ></textarea>
            </div>

            <div>
              <label class="block text-pixel-gold font-bold mb-2">SOLUTION CODE</label>
              <textarea 
                v-model="formData.solution"
                class="pixel-textarea w-full h-24 font-mono text-sm"
                placeholder="Reference solution..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-pixel-gold font-bold mb-2">REWARD XP</label>
                <input 
                  v-model.number="formData.rewardXp"
                  type="number"
                  class="pixel-input w-full"
                  min="0"
                />
              </div>
              <div>
                <label class="block text-pixel-gold font-bold mb-2">REWARD GOLD</label>
                <input 
                  v-model.number="formData.rewardGold"
                  type="number"
                  class="pixel-input w-full"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label class="block text-pixel-gold font-bold mb-2">TEST CASES (JSON)</label>
              <textarea 
                v-model="formData.testCases"
                class="pixel-textarea w-full h-20 font-mono text-xs"
                placeholder='[{"input": 7, "expectedOutput": 14, "description": "Test 1"}]'
              ></textarea>
            </div>

            <div>
              <label class="block text-pixel-gold font-bold mb-2">HINTS (JSON)</label>
              <textarea 
                v-model="formData.hints"
                class="pixel-textarea w-full h-16 font-mono text-xs"
                placeholder='["Hint 1", "Hint 2", "Hint 3"]'
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <button type="submit" class="pixel-btn">
                {{ editingId ? 'UPDATE' : 'CREATE' }}
              </button>
              <button 
                v-if="editingId"
                type="button" 
                @click="cancelEdit"
                class="pixel-btn-secondary"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Boss List -->
      <div class="lg:col-span-2">
        <div class="p-4 bg-slate-800 rounded-md">
          <h2 class="text-xl md:text-2xl font-bold text-pixel-gold mb-4">BOSS CHALLENGES ({{ filteredBosses.length }}/{{ bosses.length }})</h2>
          
          <!-- Search and Filter Bar -->
          <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-pixel-gold font-bold mb-2 text-sm">SEARCH BY NAME</label>
              <input 
                v-model="searchQuery"
                type="text"
                class="pixel-input w-full"
                placeholder="Search boss names..."
              />
            </div>
            <div>
              <label class="block text-pixel-gold font-bold mb-2 text-sm">FILTER BY LOCATION</label>
              <select 
                v-model="selectedLocation"
                class="pixel-select w-full"
              >
                <option value="">-- ALL LOCATIONS --</option>
                <option v-for="location in allLocations" :key="location" :value="location">
                  {{ location }}
                </option>
              </select>
            </div>
          </div>
          
          <div v-if="bosses.length === 0" class="text-slate-400 text-center py-8">
            No bosses created yet. Add one using the form!
          </div>
          
          <div v-else-if="filteredBosses.length === 0" class="text-slate-400 text-center py-8">
            No bosses match your search criteria.
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="boss in filteredBosses"
              :key="boss.id"
              class="boss-item border-2 border-pixel-gold p-4 rounded bg-slate-700 transition-all duration-300"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-xl font-bold text-pixel-gold">{{ boss.name }}</h3>
                  <p class="text-slate-300 text-sm">📍 {{ boss.location }}</p>
                </div>
                <div class="flex gap-2">
                  <span :class="['px-3 py-1 rounded font-bold text-sm transition-all', difficultyClass(boss.difficulty)]">
                    {{ boss.difficulty.toUpperCase() }}
                  </span>
                </div>
              </div>

              <p class="text-slate-300 mb-3 text-sm line-clamp-2">{{ boss.description }}</p>

              <div class="flex gap-2 flex-wrap">
                <button 
                  @click="editBoss(boss)"
                  class="pixel-btn-secondary px-4 py-1 text-sm whitespace-nowrap"
                >
                  ✏️ EDIT
                </button>
                <button 
                  @click="deleteBoss(boss.id)"
                  class="pixel-btn-secondary px-4 py-1 text-sm bg-red-900 hover:bg-red-800 whitespace-nowrap"
                >
                  🗑️ DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase'

export default {
  name: 'BossManager',
  data() {
    return {
      bosses: [],
      editingId: null,
      searchQuery: '',
      selectedLocation: '',
      formData: {
        name: '',
        location: '',
        description: '',
        difficulty: 'medium',
        initialCode: '',
        solution: '',
        rewardXp: 100,
        rewardGold: 50,
        testCases: '[]',
        hints: '[]'
      }
    }
  },
  computed: {
    filteredBosses() {
      return this.bosses.filter(boss => {
        const matchesSearch = boss.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesLocation = !this.selectedLocation || boss.location === this.selectedLocation
        return matchesSearch && matchesLocation
      })
    },
    allLocations() {
      return [
        'Capital City',
        'Outskirts Village',
        'Darkwood Forest',
        'Crystal Bay',
        'Barren Lands',
        'Volcanic Dungeon',
        'Scorched Sands',
        'Shadow Dungeon',
        'Frost Peaks'
      ]
    }
  },
  mounted() {
    this.loadBosses()
    this.refreshIntervalMs = 5000
    this.refreshTimer = setInterval(() => this.loadBosses(), this.refreshIntervalMs)
  },
  beforeUnmount() {
    try { if (this.refreshTimer) clearInterval(this.refreshTimer) } catch (e) {}
  },
  methods: {
    async loadBosses() {
      try {
        const { data, error } = await supabase
          .from('bosses')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        this.bosses = data || []
      } catch (err) {
        console.error('Error loading bosses:', err)
        this.bosses = []
      }
    },
    async saveBoss() {
      try {
        if (this.editingId) {
          // Update existing
          const { error } = await supabase
            .from('bosses')
            .update(this.formData)
            .eq('id', this.editingId)
          
          if (error) throw error
        } else {
          // Create new
          const { error } = await supabase
            .from('bosses')
            .insert([this.formData])
          
          if (error) throw error
        }
        
        await this.loadBosses()
        this.resetForm()
      } catch (err) {
        console.error('Error saving boss:', err)
        alert('Error saving boss: ' + err.message)
      }
    },
    editBoss(boss) {
      this.editingId = boss.id
      this.formData = { ...boss }
    },
    cancelEdit() {
      this.resetForm()
    },
    deleteBoss(id) {
      if (confirm('Are you sure you want to delete this boss?')) {
        this.bosses = this.bosses.filter(b => b.id !== id)
        
        // Delete from Supabase
        supabase
          .from('bosses')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('Error deleting boss:', error)
              alert('Error deleting boss')
            }
          })
      }
    },
    resetForm() {
      this.editingId = null
      this.formData = {
        name: '',
        location: '',
        description: '',
        difficulty: 'medium',
        initialCode: '',
        solution: '',
        rewardXp: 100,
        rewardGold: 50,
        testCases: '[]',
        hints: '[]'
      }
    },
    difficultyClass(difficulty) {
      const classes = {
        easy: 'bg-green-900 text-green-100',
        medium: 'bg-yellow-900 text-yellow-100',
        hard: 'bg-orange-900 text-orange-100',
        extreme: 'bg-red-900 text-red-100'
      }
      return classes[difficulty] || classes.medium
    }
  }
}
</script>
<style scoped>
/* Boss list item animations */
.boss-item {
  animation: slideInRight 0.4s ease-out;
  transform-origin: left;
}

.boss-item:hover {
  box-shadow: 0 0 20px rgba(253, 224, 71, 0.2);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Form transition */
form {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>