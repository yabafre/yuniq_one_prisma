<template>
    <div>
        <h2>Login</h2>
        <form @submit.prevent="login">
            <label>
                Email:
                <input v-model="form.email" type="email" required />
            </label>
            <label>
                Password:
                <input v-model="form.password" type="password" required />
            </label>
            <button type="submit">Login</button>
        </form>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
    data() {
        return {
            form: {
                email: '',
                password: '',
            },
        };
    },
    mounted() {
        console.log(useAuthStore().isAuthenticated);
        if (useAuthStore().user) {
            this.$router.push('/account');
        }
    },
    methods: {
        async login() {
            console.log('Login method called');
            console.log(this.form);
            await useAuthStore()
                .login(this.form)
                .then(() => {
                    this.$router.push('/account');
                });
        },
    },
};
</script>
