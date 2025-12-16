import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminRegister from '@/views/AdminRegister.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminInvitations from '@/views/AdminInvitations.vue'
import BossManager from '@/views/BossManager.vue'
import ItemManager from '@/views/ItemManager.vue'
import PlayerTracking from '@/views/PlayerTracking.vue'
import Analytics from '@/views/Analytics.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: AdminLogin
    },
    {
      path: '/register',
      name: 'register',
      component: AdminRegister
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/invitations',
      name: 'invitations',
      component: AdminInvitations,
      meta: { requiresAuth: true }
    },
    {
      path: '/bosses',
      name: 'bosses',
      component: BossManager,
      meta: { requiresAuth: true }
    },
    {
      path: '/items',
      name: 'items',
      component: ItemManager,
      meta: { requiresAuth: true }
    },
    {
      path: '/players',
      name: 'players',
      component: PlayerTracking,
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics,
      meta: { requiresAuth: true }
    }
  ]
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('adminToken')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
