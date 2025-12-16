import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { supabase } from './library/supabase.js'
import { isoWithOffset } from './library/time.js'

// --- START VUETIFY CONFIGURATION ---

// 1. Import Vuetify styles and core functions
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi' 

// 2. Initialize Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  // Configure the default icon set
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

// --- END VUETIFY CONFIGURATION ---

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 3. Register the Vuetify instance with the Vue app
app.use(vuetify)

app.mount('#app')

// Visibility and unload handlers to keep `userInfo.isActive` in sync
async function setActiveFlag(isActive) {
  try {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    const { data: cred, error: credErr } = await supabase
      .from('Credentials')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (credErr) {
      console.warn('Credentials lookup failed in setActiveFlag:', credErr);
      return;
    }

    if (cred && cred.id) {
      const now = isoWithOffset(8);
      // Try upsert so a missing userInfo row is created
      await supabase.from('userInfo').upsert(
        { userId: cred.id, isActive: isActive, lastActive: now, updatedAt: now },
        { onConflict: 'userId' }
      );
    }
  } catch (err) {
    console.warn('setActiveFlag error:', err);
  }
}

// Toggle active true when page becomes visible, false otherwise
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') setActiveFlag(true);
  else setActiveFlag(false);
});

// Attempt to mark inactive when the page unloads (best-effort)
window.addEventListener('beforeunload', () => {
  setActiveFlag(false);
});