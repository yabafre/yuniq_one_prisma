const StoreService = require ("../service/StoreService");
const UserService = require ("../service/UserService");
require('dotenv').config();
const {STRIPE_API_SECRET, STRIPE_API_FORFAIT_ONE} = process.env;
const stripe = require("stripe")(STRIPE_API_SECRET);


class StoreFrontController {
    home = async (req, res) => {
        const user = await StoreService.getUser(req.user.id);
        res.json({message: ` Welcome to store  ${user.firstname} !`, data: user});
    }
    getCollection = async (req, res) => {
        const collections = await StoreService.getCollection();
        if (collections.length === 0) {
            return res.status(400).json({ message: "Nothing collections"});
        }
        res.status(200).json({message: "Collections found", data: collections});
    };
    getCollectionById = async (req, res) => {
        const collectionId = req.params.id;
        const collection = await StoreService.getCollectionById(collectionId);
        if (collection.length === 0) {
            return res.status(400).json({ message: "Nothing collection"});
        }
        res.status(200).json({message: "Collection found", data: collection});
    };
    getSneakerById = async (req, res) => {
        const sneakerId = req.params.sneakerId;
        const collectionId = req.params.collectionId;
        const sneaker = await StoreService.getSneakerById(collectionId,sneakerId);
        if (sneaker.length === 0) {
            return res.status(400).json({ message: "Nothing sneaker"});
        }
        res.status(200).json({message: "Sneaker found", data: sneaker});
    };
    getSubscriptions = async (req, res) => {
        const subscriptions = await StoreService.getSubscriptions();
        if (subscriptions.length === 0) {
            return res.status(400).json({ message: "Nothing subscriptions"});
        }
        res.status(200).json({message: "Subscriptions found", data: subscriptions});
    };
    getSubscriptionById = async (req, res) => {
        const subscriptionId = req.params.id;
        const subscription = await StoreService.getSubscriptionById(subscriptionId);
        if (subscription.length === 0) {
            return res.status(400).json({ message: "Nothing subscription"});
        }
        res.status(200).json({message: "Subscription found", data: subscription});
    };
    // subscribe by card of user and create a subscription to stripe
    subscribe = async (req, res) => {
        const subscriptionId = parseInt(req.params.id);
        const { stripeToken, stripePriceId } = req.body;
        const userId = req.user.id;

        try {
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
            });
            const card = await stripe.customers.createSource(customer.id, {
                source: stripeToken.id,
            });

            const subscriptionStripe = await stripe.subscriptions.create({
                customer: customer.id,
                items: [
                    {
                        plan: stripePriceId,
                    },
                ],
                metadata: {
                    userId: userId.toString(),
                    stripeCustomerId: customer.id,
                    brand: stripeToken.card.brand,
                    last4: stripeToken.card.last4,
                },
                expand: ["latest_invoice.payment_intent"],
            });
            console.log(subscriptionStripe.latest_invoice.payment_intent.status)
            if (subscriptionStripe.latest_invoice.payment_intent.status === "succeeded") {
                res.status(200).json({status: "succeeded", redirect: `http://localhost:3000/api/store/confirm_payment/${subscriptionStripe.id}`, data: subscriptionStripe});
            } else {
                res.status(401).json({status: "failed", data: subscriptionStripe.latest_invoice.payment_intent});
            }
        } catch (error) {
            res.status(400).json({ message: error.message, data: error });
        }
    }
    confirm_payment = async (req, res) => {
        const subscriptionId = req.params.subscriptionId;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const latest_invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
        const payment_intent = await stripe.paymentIntents.retrieve(latest_invoice.payment_intent);

        if (payment_intent.status === "succeeded") {
            const stripeCustomerId = subscription.metadata.stripeCustomerId;
            const stripeSubscriptionId = subscription.id;
            const userId = parseInt(subscription.metadata.userId);
            const user = await UserService.updateUserProfile(userId, {stripeCustomerId, stripeSubscriptionId});
            const PaymentDetails = {
                subscriptionId: subscriptionId,
                amount: payment_intent.amount/100,
                status: latest_invoice.status,
                brand: subscription.metadata.brand,
                last4: subscription.metadata.last4,
                date: new Date(payment_intent.created * 1000),
            }
            const payment = await StoreService.createPayment(userId,PaymentDetails);

            res.status(200).json({message: "Payment confirmed", data: {payment, user}});
        } else {
            res.status(400).json({message: "Payment failed", data: payment_intent});
        }
    };

    addPurchase = async (req, res) => {
        try {
            const userId = req.user.id;
            const sneakerId = req.params.sneakerId;
            const purchase = await StoreService.createPurchase(userId, sneakerId);
            res.status(201).json({ message: 'Purchase successful', purchase });
        } catch (error) {
            console.error(`Error making purchase for user with ID ${req.user.id}: ${error.message}`);
            res.status(500).json({ message: 'Error making purchase' });
        }
    }

    // create a checkout session to stripe
    checkout = async (req, res) => {
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
    confirm_payment_checkout = async (req, res) => {
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

module.exports = new StoreFrontController();