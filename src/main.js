import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'

createApp(App).mount('#app')


// Commentez ces lignes pour désactiver le serveur de développement de Vite
// if (import.meta.env.DEV) {
//   import.meta.hot.accept();
// }
// app.component('Ping', require('./components/Ping.vue').default);

// Ajoutez ces lignes pour utiliser votre serveur Express
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3000';