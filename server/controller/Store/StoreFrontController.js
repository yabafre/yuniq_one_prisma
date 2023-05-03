const StoreService = require ("../../service/StoreService");
const StoreCheckoutController = require("./StoreCheckoutController");
require('dotenv').config();
const {VITE_APP_STRIPE_API_SECRET, STRIPE_API_FORFAIT_ONE} = process.env;
const stripe = require("stripe")(VITE_APP_STRIPE_API_SECRET);


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
    StoreCheckout = StoreCheckoutController

}

module.exports = new StoreFrontController();