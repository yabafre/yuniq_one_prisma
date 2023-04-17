require('dotenv').config();
const {VITE_APP_STRIPE_API_SECRET, STRIPE_API_FORFAIT_ONE, STRIPE_WEBHOOK_SECRET} = process.env;
const UserService = require ("../service/UserService");
const StoreService = require ("../service/StoreService");
const bcrypt = require("bcryptjs");
const stripe = require("stripe")(VITE_APP_STRIPE_API_SECRET);

class ProfileController{

    profile = async (req, res) => {
        const userId = req.user.id;
        const userProfile = await UserService.getUserProfile(userId);
        // res data : user profile
        res.status(200).json({data: userProfile});
    };

    updateProfile = async (req, res) => {
        const userId = req.user.id;
        if (req.file) {
            req.body.avatar = await UserService.uploadImage(req.file);
        }
        const updatedProfile = await UserService.updateUserProfile(userId, req.body);
        res.json(updatedProfile);
    };

    deleteProfile = async (req, res) => {
        const userId = req.user.id;
        try {
            // Récupérez les informations d'abonnement de l'utilisateur
            const user = await UserService.getUserProfile(userId);
            const stripeSubscriptionId = user.stripeSubscriptionId;
            if (stripeSubscriptionId) {
                // Annulez l'abonnement de l'utilisateur sur Stripe à la fin du mois en cours
                await stripe.subscriptions.update(stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });
                await stripe.customers.del(user.stripeCustomerId);
            }
            // Supprimez le profil de l'utilisateur dans votre base de données
            const deleteById = await UserService.deleteUserProfile(userId);
            res.json({ message: deleteById });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la suppression du profil", error });
        }
    };

    getSubscriptions = async (req, res) => {
        const userId = req.user.id;
        const subscriptions = await UserService.getUserSubscriptions(userId);
        if (subscriptions === null) {
            return res.status(400).json({ message: "Nothing subscription"});
        }
        res.status(200).json({ message: "Subscription found", data: subscriptions });
    };

    getPurchases = async (req, res) => {
        const userId = req.user.id;
        const purchases = await UserService.getUserPurchases(userId);
        if (purchases.length === 0) {
            return res.status(400).json({ message: "Nothing purchases"});
        }
        res.status(200).json({ message: "Purchases found", data: purchases });
    };

    updateSubscribtion = async (req, res) => {
        const userId = req.user.id;
        const { newSubscriptionId } = req.body;
        const currentSubscription = await UserService.getUserSubscriptions(userId); // Récupérez l'abonnement actuel de l'utilisateur
        const newSubscription = await StoreService.getSubscriptionById(newSubscriptionId); // Récupérez le nouvel abonnement choisi par l'utilisateur

        if (!newSubscription) {
            return res.status(400).json({ message: "Invalid subscription" });
        }

        // Mettez à jour l'abonnement de l'utilisateur dans votre base de données
        const updatedUser = await UserService.updateUserSubscriptions(userId, newSubscription);

        // Mettez à jour l'abonnement de l'utilisateur dans Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId);

        await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
            items: [
                {
                    id: stripeSubscription.items.data[0].id,
                    price: newSubscription.stripePriceId,
                },
            ],
        });

        res.status(200).json({ message: "Subscription updated", user: updatedUser });

    };

    getPaimentDetails = async (req, res) => {
        const userId = req.user.id;
        const paymentDetails = await UserService.getUserPaymentDetails(userId);
        res.json(paymentDetails);
    };

    updateStripeCustomer = async (req, res) => {
        const stripeCustomerId = req.user.stripeCustomerId;

        // Créez une session de portail client
        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: 'https://localhost:3000/api/profile',
        });

        // Redirigez l'utilisateur vers la session de portail client
        res.redirect(session.url);
    }

    updatePassword = async (req, res) => {
        const userId = req.user.id;
        const { newPassword } = req.body;

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre" });
        }

        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(newPassword, salt);

        const updatedProfile = await UserService.updateUserProfile(userId, { password: password });
        res.json(updatedProfile);
    }

    webhookPaymentStatus = async (req, res) => {
        const signature = req.headers['stripe-signature'];
        const payload = req.body;
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
            const userId = invoice.customer_metadata.userId;

            // Mettre à jour le statut de paiement de l'utilisateur dans votre base de données
            await UserService.updatePaymentStatus(userId, 'failed');

            // Envoyer une notification à l'utilisateur pour régulariser la situation
            await UserService.notifyUserAboutPaymentFailure(userId);

            res.status(200).send('Payment status updated');
        } else {
            res.status(200).send('Unhandled event type');
        }
    }
}

module.exports = new ProfileController();