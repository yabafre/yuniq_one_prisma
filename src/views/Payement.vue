<template>
    <div class="payment">
        <h1>Paiement</h1>
        <div class="stripe-form">
            <form @submit.prevent="submit">
                <label for="name">Nom complet</label>
                <input id="name" type="text" v-model="address.name" />
                <label for="street">Adresse</label>
                <input id="street" type="text" v-model="address.street" />
                <label for="city">Ville</label>
                <input id="city" type="text" v-model="address.city" />
                <label for="zip">Code postal</label>
                <input id="zip" type="text" v-model="address.zip" />
                <label for="country">Pays</label>
                <select id="country" v-model="address.country">
                    <option value="">Sélectionnez un pays</option>
                    <option v-for="country in countries" :key="country.code" :value="country.code">
                        {{ country.name }}
                    </option>
                </select>
                <label for="card-element">Carte de crédit</label>
                <div id="card-element"></div>
                <button type="submit">Payer</button>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { fetchCountries } from '@/services/countries';


export default {
    setup() {
        const stripe = inject('stripe');
        const cardElement = ref(null);
        const countries = ref([]);

        const address = ref({
            name: '',
            street: '',
            city: '',
            zip: '',
            country: ''
        });

        onMounted(async () => {
            const appearance = {
                theme: 'night',
                labels: 'floating'
            };
            const elements = stripe.elements({ appearance });
            cardElement.value = elements.create('card', {
                hidePostalCode: true});
            cardElement.value.mount('#card-element');
            const fetchedCountries = await fetchCountries();
            countries.value = fetchedCountries;
        });

        const submit = async () => {
            const { token, error } = await stripe.createToken(cardElement.value, {
                name: address.value.name,
                address_line1: address.value.street,
                address_city: address.value.city,
                address_zip: address.value.zip,
                address_country: address.value.country,
            });
            if (error) {
                console.error(error);
            } else {
                console.log(token);

                const authStore = useAuthStore();
                const response = await authStore.createPayment(token);
                console.log(response);
            }
        };

        return { submit, countries, address };
    },
};
</script>

<style scoped>
.payment {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.stripe-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 400px;
    padding: 30px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

form {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: space-between;
}

button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #666ee8;
    color: white;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

/* --- stripe-elements.css --- */

.StripeElement {
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid transparent;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 1px 3px 0 #e6ebf1;
    -webkit-transition: box-shadow 150ms ease;
    transition: box-shadow 150ms ease;
}

.StripeElement--focus {
    box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
    border-color: #fa755a;
}

.StripeElement--webkit-autofill {
    background-color: #fefde5 !important;
}


</style>
