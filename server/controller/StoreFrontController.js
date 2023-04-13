const StoreService = require ("../service/StoreService");
const UserService = require ("../service/UserService");
require('dotenv').config();
const {STRIPE_API_SECRET, STRIPE_API_FORFAIT_ONE} = process.env;
const stripe = require("stripe")(STRIPE_API_SECRET);


class StoreFrontController {
    home = async (req, res) => {
        const user = await StoreService.getUser(req.user.id);
        res.json(` Welcome to store  ${user[0].firstname} !`);
    }

    getCollection = async (req, res) => {
        const collections = await StoreService.getCollection();
        res.json(collections);
    };

    getCollectionById = async (req, res) => {
        const collectionId = req.params.id;
        const collection = await StoreService.getCollectionById(collectionId);
        res.json(collection);
    };

    getSneakerById = async (req, res) => {
        const sneakerId = req.params.sneakerId;
        const collectionId = req.params.collectionId;
        const sneaker = await StoreService.getSneakerById(collectionId,sneakerId);
        res.json(sneaker);
    };

    getSubscriptions = async (req, res) => {
        const subscriptions = await StoreService.getSubscriptions();
        res.json(subscriptions);
    };

    getSubscriptionById = async (req, res) => {
        const subscriptionId = req.params.id;
        const subscription = await StoreService.getSubscriptionById(subscriptionId);
        res.json(subscription);
    };

    getEvents = async (req, res) => {
        const events = await StoreService.getEvents();
        res.json(events);
    };

    getEventById = async (req, res) => {
        const eventId = req.params.id;
        const event = await StoreService.getEventById(eventId);
        res.json(event);
    };

    eventSubscribe = async (req, res) => {
        const eventId = req.params.id;
        const userId = req.user.id;
        const result = await StoreService.eventSubscribe(eventId, userId);
        res.json(result);
    };

    checkout = async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId, sneakerId } = req.body;
        const result = await StoreService.checkout(userId, subscriptionId, sneakerId);

        const customer = await stripe.customers.create({
            email: result.user.email,
            name: result.user.firstname + " " + result.user.lastname,
            phone: result.user.phone,
            address: {
                city: result.user.address[0].city,
                line1: result.user.address[0].location,
                postal_code: result.user.address[0].zip,
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
            client_reference_id: result.user._id,
            metadata: {
                userId: userId.toString(),
                sneakerId: sneakerId.toString(),
                subscriptionId: result.subscription._id.toString(),
            },
            allow_promotion_codes: true,
            mode: "subscription",
            success_url: "http://localhost:3000/api/store/confirm_payment?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3000/cancel",
        });

        res.json(session);
    };

    confirm_payment = async (req, res) => {
        const session_id = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        // res.json(session);
        // console.log(session);
        const userId = session.metadata.userId;
        const metadata = session.metadata;
        const subscription = await StoreService.getSubscriptionById(metadata.subscriptionId);
        const sneaker = await StoreService.getSneakerById(metadata.sneakerId);

        const purchase = {
            sneakerId: sneaker._id,
            userId: userId,
            quantity: session.quantity,
            price: session.amount_total / 100,
            status: session.status,
            userStripeId: session.customer,
            date: new Date(),
        };

        const paymentDetails = {
            paymentIntent: "stripe_test",
            subscriptionId: session.subscription,
            amount: session.amount_total,
            status: session.status,
            date: new Date(),
        };

        const user = await UserService.updateUserWithPurchase(userId, subscription._id, purchase, paymentDetails);
        req.user = user;
        res.status(200).json({ message: "Payment confirmed and data updated" });
    };

    // stripe webhook to update user data when payment is confirmed all month

}

module.exports = new StoreFrontController();