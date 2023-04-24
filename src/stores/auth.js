import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null,
        response: null,
        isAuthenticated: !!localStorage.getItem('token') // Définir la propriété "isAuthenticated" dans l'objet "state"
    }),
    actions: {
        async register(user) {
            const response = await api.register(user);
            console.log('response : ',response)
        },
        async login(credentials) {
            const response = await api.login(credentials);
            this.token = response.data.token;
            this.user = response.data.user;
            localStorage.setItem('token', this.token);
            this.isAuthenticated = true; // Mettre à jour le getter "isAuthenticated"
        },
        async fetchUser() {
            try {
                const token = localStorage.getItem('token');
                const response = await api.getUser(token);
                this.user = response.data;
                console.log('response auth : ', response.data);
            } catch (error) {
                console.error('Error while fetching user:', error);
            }
        },
        logout() {
            this.token = null;
            localStorage.removeItem('token');
            this.user = null;
            this.isAuthenticated = false; // Mettre à jour le getter "isAuthenticated"
        },
        async createPayment(paymentData) {
            try {
                const token = localStorage.getItem('token');
                const response = await api.postPayment(token, { stripeToken: paymentData, stripePriceId: 'price_1MuCqOEsNvEaR3fb9eGT016k' });
                this.response = response;
                console.log('response payment : ', response);
            } catch (error) {
                console.error('Error while creating payment:', error);
            }
        }
        ,
    },
});
