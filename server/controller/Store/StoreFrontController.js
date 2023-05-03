const StoreService = require ("../../service/StoreService");
const StoreCheckoutController = require("./StoreCheckoutController");
require('dotenv').config();
const {VITE_APP_STRIPE_API_SECRET, STRIPE_API_FORFAIT_ONE} = process.env;
const stripe = require("stripe")(VITE_APP_STRIPE_API_SECRET);


class StoreFrontController {
    home = async (req, res) => {
        try {
            const user = await StoreService.getUser(req.user.id);
            if (!user) {
                throw new Error("User not found");
            } else {
               return res.status(200).json({message: ` Welcome to store  ${user.firstname} !`, data: user});
            }
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    getCollection = async (req, res) => {
        try {
            const collections = await StoreService.getCollection();
            if (collections.length === 0) {
                throw new Error("Nothing collections");
            }
            return res.status(200).json({message: "Collections found", data: collections});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    };
    getCollectionById = async (req, res) => {
        try {
            const collectionId = req.params.id;
            if (!collectionId) {
                throw new Error("Collection id not found");
            }
            const collection = await StoreService.getCollectionById(collectionId);
            if (collection.length === 0) {
                throw new Error("Nothing collection");
            }
            return res.status(200).json({message: "Collection found", data: collection});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    };
    getSneakerById = async (req, res) => {
        try {
            const sneakerId = req.params.sneakerId;
            if (!sneakerId) {
                throw new Error("Sneaker id not found");
            }
            const collectionId = req.params.collectionId;
            if (!collectionId) {
                throw new Error("Collection id not found");
            }
            const sneaker = await StoreService.getSneakerById(collectionId,sneakerId);
            if (!sneaker) {
                throw new Error("Nothing sneaker");
            }
            return res.status(200).json({message: "Sneaker found", data: sneaker});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    };
    getSubscriptions = async (req, res) => {
        try {
            const subscriptions = await StoreService.getSubscriptions();
            if (!subscriptions) {
                throw new Error("Nothing subscriptions");
            }
            return res.status(200).json({message: "Subscriptions found", data: subscriptions});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    };
    getSubscriptionById = async (req, res) => {
        try {
            const subscriptionId = req.params.id;
            if (!subscriptionId) {
                throw new Error("Subscription id not found");
            }
            const subscription = await StoreService.getSubscriptionById(subscriptionId);
            if (!subscription) {
                throw new Error("Nothing subscription");
            }
            return res.status(200).json({message: "Subscription found", data: subscription});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    };
    StoreCheckout = StoreCheckoutController

}

module.exports = new StoreFrontController();