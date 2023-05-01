const express = require('express');
const authMiddleware = require("../middleware/auth");
const checkSubscription = require("../middleware/checkSubscription");
const StoreFrontController = require ("../controller/StoreFrontController");

exports.router = (() => {
    const router = express.Router();
    // routes with pre-middleware authMiddleware for all routes

    router.use(authMiddleware);
    // routes for Store home

    router.route('/').get(StoreFrontController.home);
    // // routes for Store collections
    router.route('/collection').get(StoreFrontController.getCollection);
    router.route('/collection/:id').get(StoreFrontController.getCollectionById);
    router.route('/collection/:collectionId/sneaker/:sneakerId').get(StoreFrontController.getSneakerById);
    // router.route('/sneakers/:sneakerId').get(StoreFrontController.getSneakerDetailsById);
    //
    // // routes for Store subscriptions
    router.route('/subscriptions').get(StoreFrontController.getSubscriptions);
    router.route('/subscriptions/:id').get(StoreFrontController.getSubscriptionById);
    // routes for Store checkout (payment) stripe
    router.route('/subscriptions/:id/subscribe').post(StoreFrontController.subscribe);
    router.route('/confirm_payment/:subscriptionId').get(StoreFrontController.confirm_payment);
    // routes for Store update subscription
    router.route('/subscriptions/:id/update').put(StoreFrontController.updateSubscription);
    // routes for Store checkout session (payment) stripe
    router.route('/checkout').post(StoreFrontController.checkout);
    router.route('/confirm_payment_checkout').get(StoreFrontController.confirm_payment_checkout);
    // routes for Store purchases
    // router.use(checkSubscription);
    router.route('/purchase/:sneakerId').get(StoreFrontController.addPurchase);
    // // routes for Store events
    // router.route('/events').get(StoreFrontController.getEvents);
    // router.route('/events/:id').get(StoreFrontController.getEventById);
    // router.route('/events/:id/subscribe').post(StoreFrontController.eventSubscribe);

    return router
})();