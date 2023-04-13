const express = require('express');
const authMiddleware = require("../middleware/auth");
const StoreFrontController = require ("../controller/StoreFrontController");

exports.router = (() => {
    const router = express.Router();
    // routes with pre-middleware authMiddleware for all routes
    // router.route('/confirm_payment').get(StoreFrontController.confirm_payment);

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
    // router.route('/subscriptions').get(StoreFrontController.getSubscriptions);
    // router.route('/subscriptions/:id').get(StoreFrontController.getSubscriptionById);
    // // router.route('/subscriptions/:id/subscribe').post(subscribe);
    // // routes for Store events
    // router.route('/events').get(StoreFrontController.getEvents);
    // router.route('/events/:id').get(StoreFrontController.getEventById);
    // router.route('/events/:id/subscribe').post(StoreFrontController.eventSubscribe);
    // // routes for Store checkout (payment) stripe
    // router.route('/checkout').post(StoreFrontController.checkout);
    return router
})();