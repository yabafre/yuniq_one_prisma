const StoreService = require("../../service/StoreService");
const UserService = require("../../service/UserService");
require('dotenv').config();
const {VITE_APP_STRIPE_API_SECRET, STRIPE_API_FORFAIT_ONE} = process.env;
const stripe = require("stripe")(VITE_APP_STRIPE_API_SECRET);

class StoreCheckoutController {
    // subscribe by card of user and create a subscription to stripe
    static subscribe = async (req, res) => {
        const subscriptionId = parseInt(req.params.id);
        const { paymentMethodId, stripePriceId } = req.body;
        const userId = req.user.id;

        try {
            if (!paymentMethodId) {
                throw new Error("Payment method ID not found");
            }
            if (!stripePriceId) {
                throw new Error("Stripe price id not found");
            }
            if (!subscriptionId) {
                throw new Error("Subscription id not found");
            }
            const subscription = await StoreService.subscribe(subscriptionId, userId);
            const customer = await stripe.customers.create({
                email: subscription.email,
                name: subscription.firstname + " " + subscription.lastname,
                phone: subscription.phone,
                address: {
                    city: subscription.city,
                    line1: subscription.location,
                    postal_code: subscription.zip,
                },
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            // Get payment method details
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

            // Create a payment intent for the subscription
            const paymentIntent = await stripe.paymentIntents.create({
                customer: customer.id,
                payment_method: paymentMethodId,
                currency: 'eur', // Update this to your currency
                amount: subscription.price * 100,
                confirm: true,
                off_session: true,
                metadata: {
                    userId: userId.toString(),
                    stripeCustomerId: customer.id,
                    brand: paymentMethod.card.brand,
                    last4: paymentMethod.card.last4,
                },
            });

            if (paymentIntent.status === 'requires_action') {
                return res.status(200).json({ requiresAction: true, paymentIntentClientSecret: paymentIntent.client_secret });
            } else if (paymentIntent.status === 'succeeded') {
                // Handle successful payment
                const subscriptionStripe = await stripe.subscriptions.create({
                    customer: customer.id,
                    items: [
                        {
                            plan: stripePriceId,
                        },
                    ],
                    default_payment_method: paymentMethodId,
                });

                return res.status(200).json({status: "succeeded", redirect: `http://localhost:3000/api/store/confirm_payment/${subscriptionStripe.id}`, data: subscriptionStripe});
            } else {
                return  res.status(401).json({status: "failed", data: paymentIntent});
            }
        } catch (error) {
            return  res.status(400).json({ message: error.message, data: error });
        }
    }
    static confirm_payment = async (req, res) => {
        const subscriptionId = req.params.subscriptionId;
        const subscriptionStripe = await stripe.subscriptions.retrieve(subscriptionId);

        if (!subscriptionStripe) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        const paymentIntentId = subscriptionStripe.latest_invoice.payment_intent;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const invoice = await stripe.invoices.retrieve(subscriptionStripe.latest_invoice);
        const invoiceLink = invoice.hosted_invoice_url;

        if (paymentIntent.status === "succeeded") {
            const stripeCustomerId = subscriptionStripe.customer;
            const userId = parseInt(subscriptionStripe.metadata.userId);

            const user = await UserService.updateUserProfile(userId, {
                stripeCustomerId: stripeCustomerId,
                stripeSubscriptionId: subscriptionStripe.id
            });

            const PaymentDetails = {
                subscriptionId: subscriptionStripe.id,
                amount: paymentIntent.amount / 100, // Convert from cents to dollars
                status: paymentIntent.status,
                brand: subscriptionStripe.metadata.brand,
                last4: subscriptionStripe.metadata.last4,
                date: new Date(paymentIntent.created * 1000), // Convert from Unix timestamp to JS Date object
                invoiceLink: invoiceLink // Added invoice link to PaymentDetails
            };

            const payment = await StoreService.createPayment(userId, PaymentDetails);

            res.status(200).json({
                message: "Payment confirmed",
                data: {
                    payment,
                    user
                }
            });
        } else {
            res.status(400).json({
                message: "Payment failed",
                data: paymentIntent
            });
        }
    };
    static addPurchase = async (req, res) => {
        try {
            const userId = req.user.id;
            const sneakerId = req.params.sneakerId;
            if (!sneakerId) {
                throw new Error('Sneaker ID missing');
            }
            if (userId !== req.user.id) {
                throw new Error("Access denied. You can't add a purchase to someone else's account" );
            }
            const purchase = await StoreService.createPurchase(userId, sneakerId);
            if (!purchase) {
                throw new Error('Error creating purchase');
            } else {
                return res.status(200).json({ message: 'Purchase created', data: purchase });
            }
        } catch (error) {
            console.error(`Error making purchase for user with ID ${req.user.id}: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }
    // create a checkout session to stripe
    static checkout = async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId } = req.body;
        const result = await StoreService.checkout(userId, subscriptionId);

        const customer = await stripe.customers.create({
            email: result.user.email,
            name: result.user.firstname + " " + result.user.lastname,
            phone: result.user.phone,
            address: {
                city: result.user.city,
                line1: result.user.location,
                postal_code: result.user.zip,
            },
        });

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: result.subscription.stripePriceId,
                    quantity: 1,
                },
            ],
            client_reference_id: result.user.id,
            metadata: {
                userId: userId.toString(),
                subscriptionId: result.subscription.id.toString(),
            },
            allow_promotion_codes: true,
            mode: "subscription",
            success_url: "http://localhost:3000/api/store/confirm_payment_checkout?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3000/cancel",
        });

        res.json(session);
    };
    static confirm_payment_checkout = async (req, res) => {
        const { session_id } = req.query;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const latest_invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
        const payment_intent = await stripe.paymentIntents.retrieve(latest_invoice.payment_intent);

        if (payment_intent.status === "succeeded") {
            const stripeCustomerId = subscription.metadata.stripeCustomerId;
            const stripeSubscriptionId = subscription.id;
            const userId = parseInt(subscription.metadata.userId);
            // const user = await UserService.updateUserProfile(userId, {stripeCustomerId, stripeSubscriptionId});
            // const PaymentDetails = {
            //     subscriptionId: subscription.id,
            //     amount: payment_intent.amount/100,
            //     status: latest_invoice.status,
            //     brand: subscription.metadata.brand,
            //     last4: subscription.metadata.last4,
            //     date: new Date(payment_intent.created * 1000),
            // }
            // const payment = await StoreService.createPayment(userId,PaymentDetails);

            res.status(200).json({message: "Payment confirmed", data: {payment, user}});
        } else {
            res.status(400).json({message: "Payment failed", data: payment_intent});
        }
    }
    // stripe webhook to update user data when payment is confirmed all month
}

module.exports = StoreCheckoutController;