const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema(
    {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            unique: true,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
            required: true,
        },
        phone: {
            type: String, // String pour mieux gérer les numéros de téléphone
            required: true,
        },
        avatar: {
            type: String,
            required: false,
        },
        address: {
            city: {
                type: String,
                required: true,
            },
            location: {
                type: String,
                required: true,
            },
            zip: {
                type: String, // String pour mieux gérer les codes postaux
                required: true,
            },
        },
        stripeCustomerId: { // Identifiant du client Stripe
            type: String,
            required: false,
        },
        subscription: { // subscription
            type: Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        stripeSubscriptionId: { // Identifiant de l'abonnement Stripe
            type: String,
            required: false,
        },
        purchases: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Purchase',
            },
        ],
        paymentDetails: { // gérer les détails de paiement
            paymentIntent: String,
            subscriptionId: String,
            amount: Number,
            status: String,
            date: Date,
        },
        events: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Event',
            },
        ],
        resetPasswordToken: { // gérer la réinitialisation du mot de passe
            type: String,
            default: null,
        },
        resetPasswordExpires: { // gérer l'expiration du lien de réinitialisation du mot de passe
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
