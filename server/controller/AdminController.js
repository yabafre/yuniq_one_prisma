const AdminService = require("../service/AdminService");
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

class AdminController {
    addSneaker = async (req, res) => {
        const {collectionId, sizes} = req.body;
        let parsedSizes = [];

        if (sizes) {
            parsedSizes = JSON.parse(sizes);
        }

        // Upload the images array to Cloudinary
        let images = [];

        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file) => {
                return AdminService.uploadImage(file);
            });
            images = await Promise.all(imagePromises);
        }
        const sneaker = await AdminService.addSneaker(req.body, collectionId, images, parsedSizes);
        res.status(201).json(sneaker);
    };
    updateSneaker = async (req, res) => {
        const sneakerId = parseInt(req.params.id, 10);
        const {sizes} = req.body;
        let parsedSizes = [];

        if (sizes) {
            parsedSizes = JSON.parse(sizes);
        }

        // Upload the images array to Cloudinary
        let images = [];

        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file) => {
                return AdminService.uploadImage(file);
            });
            images = await Promise.all(imagePromises);
        }
        const sneaker = await AdminService.updateSneaker(sneakerId, req.body, images, parsedSizes);
        res.status(200).json(sneaker);
    };
    deleteSneaker = async (req, res) => {
        const sneakerId = req.params.sneakerId;
        const sneaker = await AdminService.deleteSneaker(sneakerId);
        res.status(200).json(sneaker);
    };
    addSizeToSneaker = async (req, res) => {
        const sneakerId = req.params.sneakerId;
        const size = await AdminService.addSizesToSneaker(req.body, sneakerId);
        res.status(201).json(size);
    };
    deleteSizeFromSneaker = async (req, res) => {
        const sneakerId = req.params.sneakerId;
        const sizeId = req.params.sizeId;
        const size = await AdminService.deleteSizesFromSneaker(sneakerId, sizeId);
        res.status(200).json(size);
    };
    addCollection = async (req, res) => {
        const collection = await AdminService.addCollection(req.body);
        res.status(201).json(collection);
    };
    deleteCollection = async (req, res) => {
        const collectionId = req.params.collectionId;
        const collection = await AdminService.deleteCollection(collectionId);
        res.status(200).json(collection);
    }
    addSubscription = async (req, res) => {
        const {collection, interval} = req.body;
        // Upload the image to Cloudinary
        const image = await AdminService.uploadImage(req.file);
        const subscription = await AdminService.addSubscription(req.body, collection, image);
        // Create a Stripe product for the subscription
        const product = await stripe.products.create({
            name: subscription.name,
            description: subscription.description,
            images: [subscription.image ? image : "https://placeholder/50/50"],
        });
        // Create a Stripe price for the subscription
        const price = await stripe.prices.create({
            unit_amount: subscription.price * 100,
            currency: "eur",
            recurring: {
                interval: interval, // "day", "week", "month", "year", "2 months", "3 months", "6 months", "12 months"
            },
            product: product.id,
        });
        // Save the Stripe product ID and price ID in the subscription
        await  AdminService.updateSubscription(subscription.id, product.id, price.id);

        res.status(201).json(subscription);
    };
    deleteSubscription = async (req, res) => {
        const subscriptionId = req.params.subscriptionId;
        const subscription = await AdminService.deleteSubscription(subscriptionId);
        res.status(200).json(subscription);
    }
    addPromoCode = async (req, res) => {
        const {duration, id, percent_off, max_redemptions, redeem_by} = req.body;
        const redeem = Math.floor(Date.now() / 1000) + parseInt(redeem_by) * 24 * 60 * 60; // timestamp Unix dans une semaine
        const coupon = await stripe.coupons.create({
            duration: duration, // "once", "repeating", "forever"
            id: id, // "promo-code"
            percent_off: parseInt(percent_off), // 10
            max_redemptions: parseInt(max_redemptions), // 1
            redeem_by: redeem, // 1620000000
        });
        await AdminService.addPromoCode(coupon);
        res.status(201).json(coupon);
    }
    deletePromoCode = async (req, res) => {
        const idCoupon = req.params.id;
        const coupon = await AdminService.deletePromoCode(idCoupon);
        res.status(201).json(coupon);
    }

}

module.exports = new AdminController();