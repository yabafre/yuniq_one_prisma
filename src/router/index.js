import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Account from '../views/Account.vue'
import Logout from '../views/Logout.vue'
import { useAuthStore } from '@/stores/auth'
import Payement from "@/views/Payement.vue";

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/account',
    name: 'account',
    component: Account
  },
  {
    path: '/logout',
    name: 'logout',
    component: Logout
  },
  {
    path: '/payement',
    name: 'payement',
    component: Payement
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware to check if user is authenticated
router.beforeEach((to, from, next) => {
  const isAuthenticated = useAuthStore().isAuthenticated;

  if (isAuthenticated || to.name === 'home' || to.name === 'login' || to.name === 'register') {
    next();
  } else {
    next('/login');
  }
});

export default router;
