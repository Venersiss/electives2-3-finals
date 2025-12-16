import LogIn from '@/views/logIn.vue'
import Register from '@/views/register.vue'
import Map from '@/views/map.vue'
import Capital from '@/views/capital.vue'
import Challenge from '@/views/challenge.vue'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LogIn,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/map',
      name: 'map',
      component: Map,
    },
    {
      path: '/capital',
      name: 'capital',
      component: Capital,
    },
    {
      path: '/challenge/:id',
      name: 'challenge',
      component: Challenge,
    },
  ],
})

export default router
