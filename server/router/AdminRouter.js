const express = require('express');
const upload = require('../middleware/uploads-multer');
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const AdminController = require ("../controller/Admin/AdminController");
exports.router = (() => {
    const router = express.Router();
    // Middleware d'authentification et le middleware d'administration pour toutes les routes
    router.use(authMiddleware);
    router.use(adminMiddleware);
    //route admin
    router.route('/').get(AdminController.getAdmin);
    //route user with subscription
    router.route('/users/subs').get(AdminController.getAllUsersWithSubscriptions);
    //route sneaker
    router.route('/sneaker').get(AdminController.sneaker.getSneakers);
    router.route('/sneaker').post(upload.fields([
        { name: 'image_url', maxCount: 1 },
        { name: 'image_url2', maxCount: 1 },
        { name: 'image_url3', maxCount: 1 }
    ]),AdminController.sneaker.addSneaker);
    router.route('/sneaker/:id').put(upload.fields([
        { name: 'image_url', maxCount: 1 },
        { name: 'image_url2', maxCount: 1 },
        { name: 'image_url3', maxCount: 1 }
    ]),AdminController.sneaker.updateSneaker);
    router.route('/sneaker/:id').delete(AdminController.sneaker.deleteSneaker);
    router.route('/sneaker/:id/size').post(upload.none(),AdminController.sneaker.addSizeToSneaker);
    router.route('/sneaker/:id/size/:sizeId').delete(AdminController.sneaker.deleteSizeFromSneaker);
    //route collection
    router.route('/collection').post(upload.single('image'), AdminController.collection.addCollection);
    router.route('/collection/:id').put(upload.single('image'), AdminController.collection.updateCollection);
    router.route('/collection/:id').delete(AdminController.collection.deleteCollection);
    //route subscription
    router.route('/subscription').get(AdminController.subscription.getSubscriptions);
    router.route('/subscription').post(upload.single('image'),AdminController.subscription.addSubscription);
    router.route('/subscription/:subscriptionId').put(upload.single('image'),AdminController.subscription.updateSubscription);
    router.route('/subscription/:subscriptionId').delete(AdminController.subscription.deleteSubscription);
    router.route('/subscription/paid').get(AdminController.subscription.getSubscriptionsPaid);
    //route promo code
    router.route('/promo-code').get(AdminController.subscription.getPromoCodes);
    router.route('/promo-code').post(upload.none(),AdminController.subscription.addPromoCode);
    router.route('/promo-code/:id').delete(AdminController.subscription.deletePromoCode);
    //route reload image
    router.route('/reload-image').get(AdminController.deleteImage);
    return router;
})();
