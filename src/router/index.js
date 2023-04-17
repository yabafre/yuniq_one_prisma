import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Account from '../views/Account.vue'
import Logout from '../views/Logout.vue'
import {useAuthStore} from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: Register
  },
  {
    path: '/account',
    component: Account,
    beforeEnter: (to, from, next) => {
      if (useAuthStore().isAuthenticated) {
        useAuthStore().fetchUser().then(() => {
          next();
        });
      } else {
        next('/login');
      }
    },
  },
  {
    path: '/logout',
    component: Logout,
    beforeEnter: (to, from, next) => {
      useAuthStore().logout();
      next('/login');
    },
  },
  {
    path: '/payement',
    component: () => import('../views/Payement.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
