const express = require('express');
const authMiddleware = require("../middleware/auth");
const ProfileController = require ("../controller/ProfileController");

exports.router = (() => {
    const router = express.Router();
    // routes with pre-middleware authMiddleware for all routes
    router.use(authMiddleware);
    // route profile
    router.route('/').get(ProfileController.profile);
    router.route('/').put(ProfileController.updateProfile);
    router.route('/subscribtion').get(ProfileController.getSubscriptions);
    router.route('/purchases').get(ProfileController.getPurchases);
    router.route('/payment-details').get(ProfileController.getPaimentDetails);
    // route update subscribtion
    router.route('/subscribtion').put(ProfileController.updateSubscribtion);
    // route cancel subscription and delete profile
    router.route('/subscription/cancel').post(ProfileController.deleteProfile);
    // route update by stripe portal, redirect to link stripe portal
    router.route('/update-client').get(ProfileController.updateStripeCustomer);
    // route update password
    router.route('/update-password').put(ProfileController.updatePassword);
    // route webhooks stripe
    router.route('/webhook').get(ProfileController.webhookPaymentStatus);

    return router
})();