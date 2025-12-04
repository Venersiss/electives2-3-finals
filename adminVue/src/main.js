import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

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
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 3. Register the Vuetify instance with the Vue app
app.use(vuetify) 

app.mount('#app')