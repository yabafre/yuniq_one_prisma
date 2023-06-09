const AdminService = require("../../service/AdminService");
const stripe = require("stripe")(process.env.VITE_APP_STRIPE_API_SECRET);

class AdminSubscriptionController {
    getSubscriptions = async (req, res) => {
        try {
            const subscriptions = await AdminService.getSubscriptions();
            if (subscriptions) {
               return res.status(200).json({message: 'Subscriptions retrieved successfully', data: subscriptions});
            } else {
                throw new Error("Subscriptions not found");
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    addSubscription = async (req, res) => {
        try {
            // Upload the image to Cloudinary
            if (req.file) {
                const image = await AdminService.uploadImage(req.file);
                if (!image) {
                    throw new Error("Image could not be uploaded");
                }
                req.body.image = image;
            }
            if (!req.body.name) {
                throw new Error("Name is required");
            }
            if (!req.body.description) {
                throw new Error("Description is required");
            }
            if (!req.body.price) {
                throw new Error("Price is required");
            }
            if (!req.body.interval) {
                throw new Error("Interval is required");
            }
            if (!req.body.intervalCount) {
                throw new Error("Interval count is required");
            }
            const subscription = await AdminService.addSubscription(req.body);
            if (!subscription) {
                throw new Error("Subscription could not be added");
            }
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
            if (!save) {
                throw new Error("Subscription could not be updated after Stripe product and price creation");
            } else {
                res.status(201).json({message: "Subscription added successfully", data: save});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    };
    updateSubscription = async (req, res) => {
        try {
            const subscriptionId = parseInt(req.params.subscriptionId, 10);
            if (!subscriptionId) {
                throw new Error("Subscription ID is required");
            }
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
                    name: req.body.name ?  subscription.name : null,
                    description: req.body.description ? subscription.description : null,
                    images: req.body.image ? [subscription.image] : null,
                }
            );
            let newPrice = subscription.stripePriceId;
            if (req.body.price) {
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
                const newPriceStripe = await stripe.prices.list({
                        product: product.id,
                        active: true,
                    }
                );
                newPrice = newPriceStripe.data[0].id;
            }

            // Save the Stripe product ID and price ID in the subscription
            const save = await  AdminService.updateSubscription(subscription.id, {stripeProductId: product.id, stripePriceId: newPrice.data[0].id});
            console.log(newPrice)
            if (!save) {
                throw new Error("Subscription could not be updated after Stripe product and price creation");
            } else {
               return res.status(201).json({message: "Subscription updated successfully", data: save});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    deleteSubscription = async (req, res) => {
        try {
            const subscriptionId = req.params.subscriptionId;
            if (!subscriptionId) {
                throw new Error("Subscription ID is required");
            }
            const subscription = await AdminService.deleteSubscription(subscriptionId);
            if (!subscription) {
                throw new Error("Subscription could not be deleted");
            } else {
                return res.status(200).json({message: "Subscription deleted successfully", data: subscription});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    getSubscriptionsPaid = async (req, res) => {
        try {
            const subscriptions = await AdminService.getSubscriptionsPaid();
            if (!subscriptions) {
                throw new Error("Subscriptions could not be retrieved");
            } else {
                return res.status(200).json({message: "Subscriptions retrieved successfully", data: subscriptions});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    getPromoCodes = async (req, res) => {
        try {
            const coupons = await AdminService.getPromoCodes();
            if (!coupons) {
                throw new Error("Promo codes could not be retrieved");
            } else {
                return res.status(200).json({message: "Promo codes retrieved successfully", data: coupons});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    addPromoCode = async (req, res) => {
        try {
            const {duration, id, percent_off, max_redemptions, redeem_by} = req.body;
            console.log(req.body)
            if (!duration || !id || !percent_off || !max_redemptions || !redeem_by) {
                throw new Error("All fields are required");
            }
            const redeem = Math.floor(Date.now() / 1000) + parseInt(redeem_by) * 24 * 60 * 60; // timestamp Unix dans une semaine
            const coupon = await stripe.coupons.create({
                duration: duration, // "once", "repeating", "forever"
                id: id, // "promo-code"
                percent_off: parseInt(percent_off), // 10
                max_redemptions: parseInt(max_redemptions), // 1
                redeem_by: redeem, // 1620000000
            });
            if (!coupon) {
                throw new Error("Promo code could not be created");
            }
            const response = await AdminService.addPromoCode(coupon);
            if (!response) {
                throw new Error("Promo code could not be saved");
            } else {
                return res.status(201).json({message: "Promo code added successfully", data: response});
            }
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({message: error.message});
        }
    }
    deletePromoCode = async (req, res) => {
        try {
            const idCoupon = req.params.id;
            if (!idCoupon) {
                throw new Error("Promo code ID is required");
            }
            const coupon = await AdminService.deletePromoCode(idCoupon);
            if (!coupon) {
                throw new Error("Promo code could not be deleted");
            } else {
                return res.status(200).json({message: "Promo code deleted successfully", data: coupon});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }

    }
}

module.exports = new AdminSubscriptionController();