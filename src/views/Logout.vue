<template>
    <div>
        <button @click="logout">Logout</button>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
    methods: {
        logout() {
            useAuthStore().logout();
            this.$router.push('/login');
        },
    },
};
</script>
