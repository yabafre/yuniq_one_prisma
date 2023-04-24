import axios from 'axios';

const API_BASE_URL = `https://localhost:${import.meta.env.VITE_APP_PORT}/api`;

const authApi = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
});

const profileApi = axios.create({
    baseURL: `${API_BASE_URL}/profile`,
});

const storeApi = axios.create({
    baseURL: `${API_BASE_URL}/store`,
});

export default {
    async register(user) {
        try {
            const response = await authApi.post('/register', user);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to register user');
        }
    },
    async login(credentials) {
        try {
            const response = await authApi.post('/login', credentials);
            console.log('response : ',response.data)
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to login');
        }
    },
    async getUser(token) {
        try {
            const response = await profileApi.get('/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get user profile');
        }
    },
    async postPayment(token, paymentData) {
        try {
            const response = await storeApi.post('/subscriptions/2/subscribe',
                paymentData
                , {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to post payment');
        }
    }
};
