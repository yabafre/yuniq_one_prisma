require('dotenv').config();
const {VITE_APP_STRIPE_API_SECRET, STRIPE_API_FORFAIT_ONE, STRIPE_WEBHOOK_SECRET} = process.env;
const UserService = require ("../../service/UserService");
const StoreService = require ("../../service/StoreService");
const bcrypt = require("bcryptjs");
const stripe = require("stripe")(VITE_APP_STRIPE_API_SECRET);

class ProfileController{

    profile = async (req, res) => {
        try {
            const userId = req.user.id;
            const userProfile = await UserService.getUserProfile(userId);
            // res data : user profile
           if (!userProfile) {
               return throw new Error("User not found");
           }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

    updateProfile = async (req, res) => {
        try {
            const userId = req.user.id;
            if (req.file) {
                req.body.avatar = await UserService.uploadImage(req.file);
            }
            const updatedProfile = await UserService.updateUserProfile(userId, req.body);
            if (!updatedProfile) {
                return throw new Error("User not found");
            } else {
                return res.status(200).json({message: "User updated successfully", data: updatedProfile});
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

    deleteProfile = async (req, res) => {
        const userId = req.user.id;
        try {
            // Récupérez les informations d'abonnement de l'utilisateur
            const user = await UserService.getUserProfile(userId);
            if (!user) {
                return throw new Error("User not found");
            }
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
            if (!deleteById) {
                return throw new Error("User not found");
            } else {
                return res.status(200).json({message: "User deleted successfully", data: deleteById});
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

    getSubscriptions = async (req, res) => {
        try {
            const userId = req.user.id;
            const subscriptions = await UserService.getUserSubscriptions(userId);
            if (subscriptions === null || !subscriptions ) {
                return throw new Error("User not found");
            }
            res.status(200).json({ message: "Subscription found", data: subscriptions });
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

    getPurchases = async (req, res) => {
        try {
            const userId = req.user.id;
            const purchases = await UserService.getUserPurchases(userId);
            if (purchases.length === 0 || !purchases) {
                return throw new Error("Nothing purchase found");
            }
            res.status(200).json({ message: "Purchases found", data: purchases });
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

    updateSubscribtion = async (req, res) => {
        try {

            const userId = req.user.id;
            const { newSubscriptionId } = req.body;
            if (!newSubscriptionId) {
                return throw new Error("Subscription id is required");
            }
            const currentSubscription = await UserService.getUserSubscriptions(userId); // Récupérez l'abonnement actuel de l'utilisateur
            if (!currentSubscription) {
                return throw new Error("User not found");
            }
            const newSubscription = await StoreService.getSubscriptionById(newSubscriptionId); // Récupérez le nouvel abonnement choisi par l'utilisateur

            if (!newSubscription) {
                return throw new Error("Subscription not found");
            }

            // Mettez à jour l'abonnement de l'utilisateur dans votre base de données
            const updatedUser = await UserService.updateUserSubscriptions(userId, newSubscription);

            if (!updatedUser) {
                return throw new Error("Failed to update user subscription");
            }
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

        } catch (error) {
            return res.status(500).json({message: error.message});
        }

    };

    getPaimentDetails = async (req, res) => {
        try {
            const userId = req.user.id;
            const paymentDetails = await UserService.getUserPaymentDetails(userId);
            if (!paymentDetails) {
                return throw new Error("User not found");
            } else {
                res.status(200).json({ message: "Payment details found", data: paymentDetails });
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

    updateStripeCustomer = async (req, res) => {
        try {
            const userId = req.user.id;
            const { stripeCustomerId } = req.body;
            if (!stripeCustomerId) {
                return throw new Error("Stripe customer id is required");
            }
            const updatedUser = await UserService.getUserProfile(userId);
            if (!updatedUser) {
                return throw new Error("User not found");
            }
            // Créez une session de portail client
            const session = await stripe.billingPortal.sessions.create({
                customer: updatedUser.stripeCustomerId,
                return_url: 'https://localhost:3000/api/profile',
            });

            // Redirigez l'utilisateur vers la session de portail client
            if (session) {
                res.status(200).json({ message: "Stripe customer updated", data: session.url });
            } else {
                return throw new Error("Failed to update stripe customer");
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    }

    updatePassword = async (req, res) => {
        try {
            const userId = req.user.id;
            const { password } = req.body;
            if (!password) {
                return throw new Error("Password is required");
            }
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
            if (!passwordRegex.test(password)) {
                return throw new Error("Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre");
            }

            const salt = bcrypt.genSaltSync(10);
            const newPassword = bcrypt.hashSync(password, salt);

            const updatedProfile = await UserService.updateUserProfile(userId, { password: newPassword });
            if (!updatedProfile) {
                return throw new Error("Failed to update password");
            } else {
                res.status(200).json({ message: "Password updated", data: updatedProfile });
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    }

    // webhookPaymentStatus = async (req, res) => {
    //     const signature = req.headers['stripe-signature'];
    //     const payload = req.body;
    //     let event;
    //
    //     try {
    //         event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    //     } catch (err) {
    //         res.status(400).send(`Webhook Error: ${err.message}`);
    //         return;
    //     }
    //
    //     if (event.type === 'invoice.payment_failed') {
    //         const invoice = event.data.object;
    //         const userId = invoice.customer_metadata.userId;
    //
    //         // Mettre à jour le statut de paiement de l'utilisateur dans votre base de données
    //         await UserService.updatePaymentStatus(userId, 'failed');
    //
    //         // Envoyer une notification à l'utilisateur pour régulariser la situation
    //         await UserService.notifyUserAboutPaymentFailure(userId);
    //
    //         res.status(200).send('Payment status updated');
    //     } else {
    //         res.status(200).send('Unhandled event type');
    //     }
    // }
}

module.exports = new ProfileController();