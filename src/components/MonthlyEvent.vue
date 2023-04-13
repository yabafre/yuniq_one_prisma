<template>
  <div class="monthly-event">
    <h2>Événement mensuel</h2>
    <ul>
      <li v-for="sneaker in sneakers" :key="sneaker.id">
        <img :src="sneaker.image" :alt="sneaker.name" />
        <h3>{{ sneaker.name }}</h3>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      sneakers: [],
    };
  },
  async mounted() {
    // Remplacez 'http://localhost:3000' par l'URL de votre serveur Express
    const response = await axios.get('http://localhost:3000/monthly-event', {
      headers: {
        // Remplacez 'your_token' par le token JWT de l'utilisateur authentifié
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImpvaG5kb2UifSwiaWF0IjoxNjgwMzM2MzMyfQ.JqjLIdE2NoQG8HtFpxprCHCp4JzfHJ3ub_99GNZoASw',
      },
    });

    this.sneakers = response.data;
  },
};
</script>

<style scoped>
.monthly-event {
  /* Ajoutez vos styles ici */
}
</style>
