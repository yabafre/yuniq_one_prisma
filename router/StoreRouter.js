const express = require('express');
const authMiddleware = require("../middleware/auth");
const checkSubscription = require("../middleware/checkSubscription");
const checkCollectionsAccess = require("../middleware/checkCollectionsAccess");
const StoreFrontController = require ("../controller/Store/StoreFrontController");

exports.router = (() => {
    const router = express.Router();
    // // routes for Store events
    router.route('/events').get(StoreFrontController.getEvents);
    router.route('/events/:idEvent/sneaker/:sneakerId').get(StoreFrontController.getSneakerByEvent);
    // routes with pre-middleware authMiddleware for all routes
    router.use(authMiddleware);
    // routes for Store home

    router.route('/').get(StoreFrontController.home);
    // // routes for Store collections
    router.route('/collections').get(StoreFrontController.getCollection);
    router.route('/collection').get(checkCollectionsAccess,StoreFrontController.getCollection);
    router.route('/collection/:collectionId').get(checkCollectionsAccess,StoreFrontController.getCollectionById);
    router.route('/collection/:collectionId/sneaker/:sneakerId').get(checkCollectionsAccess,StoreFrontController.getSneakerById);
    //
    // // routes for Store subscriptions
    router.route('/subscriptions').get(StoreFrontController.getSubscriptions);
    router.route('/subscriptions/:id').get(StoreFrontController.getSubscriptionById);
    // routes for Store checkout (payment) stripe
    router.route('/subscriptions/:id/subscribe').post(StoreFrontController.StoreCheckout.subscribe);
    router.route('/subscriptions/:id/subscribeSecondStep').post(StoreFrontController.StoreCheckout.subscribeSecondStep);
    router.route('/confirm_payment/:subscriptionId').get(StoreFrontController.StoreCheckout.confirm_payment);
    // routes for Store checkout session (payment) stripe
    // router.route('/checkout').post(StoreFrontController.StoreCheckout.checkout);
    // router.route('/confirm_payment_checkout').get(StoreFrontController.StoreCheckout.confirm_payment_checkout);
    // routes for Store purchases
    // router.use(checkSubscription);
    router.route('/purchase/:sneakerId').get(StoreFrontController.StoreCheckout.addPurchase);
    // router.route('/events/:id').get(StoreFrontController.getEventById);
    // router.route('/events/:id/subscribe').post(StoreFrontController.eventSubscribe);

    return router
})();