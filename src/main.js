import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import './assets/main.css'

const stripe = await loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLIC_KEY);


import './assets/main.css'

const pinia = createPinia()

const app = createApp(App)

app.provide('stripe', stripe);
app.use(router)
app.use(pinia)

app.mount('#app')

// Commentez ces lignes pour désactiver le serveur de développement de Vite
// if (import.meta.env.DEV) {
//   import.meta.hot.accept();
// }
// app.component('Ping', require('./components/Ping.vue').default);

// Ajoutez ces lignes pour utiliser votre serveur Express
axios.defaults.baseURL = `http://localhost:${import.meta.env.VITE_APP_PORT}`;