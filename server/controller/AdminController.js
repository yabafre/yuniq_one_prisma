const AdminService = require("../service/AdminService");
require('dotenv').config();
const stripe = require("stripe")(process.env.VITE_APP_STRIPE_API_SECRET);

class AdminController {
    getAdmin = async (req, res) => {
        const id = req.user.id;
        const admin = await AdminService.getAdmin(id);
        res.status(200).json(admin);
    }
    addSneaker = async (req, res) => {
        const {collectionId, sizes} = req.body;
        let parsedSizes = [];

        if (sizes) {
            parsedSizes = JSON.parse(sizes);
        }
        // Upload the images array to Cloudinary
        let images = [];

        if (req.files) {
            const imagePromises = [];
            Object.keys(req.files).forEach((fieldName) => {
                const files = req.files[fieldName];
                files.forEach((file) => {
                    imagePromises.push(
                        AdminService.uploadImage(file).then((image) => {
                            const imageObject = {};
                            imageObject[fieldName] = image;
                            return imageObject;
                        })
                    );
                });
            });
            const imageResults = await Promise.all(imagePromises);
            images = imageResults.reduce((accumulator, current) => {
                return { ...accumulator, ...current };
            }, {});
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

        if (req.files) {
            const imagePromises = [];
            Object.keys(req.files).forEach((fieldName) => {
                const files = req.files[fieldName];
                files.forEach((file) => {
                    imagePromises.push(
                        AdminService.uploadImage(file).then((image) => {
                            const imageObject = {};
                            imageObject[fieldName] = image;
                            return imageObject;
                        })
                    );
                });
            });
            const imageResults = await Promise.all(imagePromises);
            images = imageResults.reduce((accumulator, current) => {
                return { ...accumulator, ...current };
            }, {});
        }

        const sneaker = await AdminService.updateSneaker(sneakerId, req.body, images, parsedSizes);
        res.status(200).json(sneaker);
    };
    deleteSneaker = async (req, res) => {
        const sneakerId = parseInt(req.params.id, 10);
        const sneaker = await AdminService.deleteSneaker(sneakerId);
        res.status(200).json(sneaker);
    };
    addSizeToSneaker = async (req, res) => {
        const sneakerId = parseInt(req.params.id, 10);
        const {sizes} = req.body;
        let parsedSizes = [];

        if (sizes) {
            parsedSizes = JSON.parse(sizes);
        }
        console.log(parsedSizes)
        const size = await AdminService.addSizesToSneaker(sneakerId, parsedSizes);
        res.json(size);
    };
    deleteSizeFromSneaker = async (req, res) => {
        const sneakerId = parseInt(req.params.id, 10);
        const sizeId = parseInt(req.params.sizeId, 10);
        const size = await AdminService.deleteSizeFromSneaker(sneakerId, sizeId);
        res.status(200).json(size);
    };
    addCollection = async (req, res) => {
        // Upload the image to Cloudinary
        console.log(req.file)
        if (req.file) {
            const image = await AdminService.uploadImage(req.file);
            req.body.image = image;
        }
        const collection = await AdminService.addCollection(req.body);
        res.status(201).json(collection);
    };
    updateCollection = async (req, res) => {
        const collectionId = parseInt(req.params.id, 10);
        // Upload the image to Cloudinary
        if (req.file) {
            const image = await AdminService.uploadImage(req.file);
            req.body.image = image;
        }
        const collection = await AdminService.updateCollection(collectionId, req.body);
        res.status(201).json(collection);
    };
    deleteCollection = async (req, res) => {
        const collectionId = req.params.id;
        const collection = await AdminService.deleteCollection(collectionId);
        res.status(200).json(collection);
    }
    addSubscription = async (req, res) => {
        // Upload the image to Cloudinary
        if (req.file) {
            const image = await AdminService.uploadImage(req.file);
            req.body.image = image;
        }
        const subscription = await AdminService.addSubscription(req.body);
        // Create a Stripe product for the subscription
        const product = await stripe.products.create({
            name: subscription.name,
            description: subscription.description,
            images: [subscription.image],
        });
        // Create a Stripe price for the subscription
        const price = await stripe.prices.create({
            unit_amount: subscription.price * 100,
            currency: "eur",
            recurring: {
                interval: subscription.interval, // "day", "week", "month", "year"
                interval_count: subscription.intervalCount, // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            },
            product: product.id,
        });
        // Save the Stripe product ID and price ID in the subscription
        const save = await  AdminService.updateSubscription(subscription.id, {stripeProductId: product.id, stripePriceId: price.id});
        res.status(201).json(save);
    };
    updateSubscription = async (req, res) => {
        const subscriptionId = parseInt(req.params.subscriptionId, 10);
        // Upload the image to Cloudinary
        if (req.file) {
            const image = await AdminService.uploadImage(req.file);
            req.body.image = image;
        }
        if(req.body.price) {
            req.body.price = parseInt(req.body.price, 10);
        }
        if (req.body.intervalCount) {
            req.body.intervalCount = parseInt(req.body.intervalCount, 10);
        }
        const subscription = await AdminService.updateSubscription(subscriptionId, req.body);
        // Update the Stripe product for the subscription
        const product = await stripe.products.update(
            subscription.stripeProductId,
            {
                name: subscription.name,
                description: subscription.description,
                images: [subscription.image],
            }
        );
        // Update and archive the Stripe price for the subscription
        const priceArchive = await stripe.prices.update(
            subscription.stripePriceId,
            {
                lookup_key: subscription.stripePriceId,
                active: false,
            }
        );

        // Create a Stripe price for the subscription
        const price = await stripe.prices.create({
            unit_amount: subscription.price * 100,
            currency: "eur",
            recurring: {
                interval: subscription.interval, // "day", "week", "month", "year"
                interval_count: subscription.intervalCount, // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            },
            product: product.id,
        });

        // get new price id from stripe by subscription id
        const newPrice = await stripe.prices.list({
            product: product.id,
            active: true,
        }
        );


        // Save the Stripe product ID and price ID in the subscription
        const save = await  AdminService.updateSubscription(subscription.id, {stripeProductId: product.id, stripePriceId: newPrice.data[0].id});
        console.log(newPrice)
        res.status(201).json(newPrice);
    }
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
    deleteImage = async (req, res) => {
        const image = await AdminService.deleteImage();
        res.status(201).json(image);
    }
}

module.exports = new AdminController();