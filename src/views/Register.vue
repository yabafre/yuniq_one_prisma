<template>
    <div>
        <h2>Register</h2>
        <form @submit.prevent="register" enctype="multipart/form-data" >
            <label>
                Firstname:
                <input v-model="form.firstname" type="text" required />
            </label>
            <label>
                Lastname:
                <input v-model="form.lastname" type="text" required />
            </label>
            <label>
                Phone:
                <input v-model="form.phone" type="text" required />
            </label>
            <label>
                Email:
                <input v-model="form.email" type="email" required />
            </label>
            <label>
                Avatar:
                <input @change="onFileChange" id="avatar" name="avatar" type="file" ref="fileInput" />
            </label>
            <label>
                Location:
                <input v-model="form.location" type="text" required />
            </label>
            <label>
                City:
                <input v-model="form.city" type="text" required />
            </label>
            <label>
                Zip:
                <input v-model="form.zip" type="number" required />
            </label>
            <label>
                Password:
                <input v-model="form.password" type="password" required />
            </label>
            <button type="submit">Register</button>
        </form>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
    data() {
        return {
            form: {
                firstname: '',
                lastname: '',
                email: '',
                phone: '',
                avatar: null,
                location: '',
                city: '',
                zip: '',
                password: '',
            },
        };
    },
    methods: {
        async register() {
            const formData = new FormData();
            formData.append('firstname', this.form.firstname);
            formData.append('lastname', this.form.lastname);
            formData.append('email', this.form.email);
            formData.append('phone', this.form.phone);
            formData.append('avatar', this.form.avatar);
            formData.append('location', this.form.location);
            formData.append('city', this.form.city);
            formData.append('zip', this.form.zip);
            formData.append('password', this.form.password);

            await useAuthStore().register(formData);
            this.$router.push('/account');
        },
        onFileChange(event) {
            this.form.avatar = event.target.files[0];
        }
    },
};
</script>
