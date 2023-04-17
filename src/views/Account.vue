<template>
    <div>
        <h2>My Account</h2>
        <div v-if="$auth.isAuthenticated">
            <p>Name: {{ user.firstname }} {{ user.lastname }}</p>
            <img :src="user.avatar" alt="user image" />
            <p>Email: {{ user.email }}</p>
            <p>Location: {{ user.location }}</p>
        </div>
        <div v-else>
            <p>You must be logged in to view this page.</p>
            <router-link to="/login">Login</router-link>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
    computed: {
        user() {
            return useAuthStore().user;
        },
        $auth: () => useAuthStore(),
    },
};
</script>
