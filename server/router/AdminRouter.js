const express = require('express');
const upload = require('../middleware/uploads-multer');
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const AdminController = require ("../controller/AdminController");
exports.router = (() => {
    const router = express.Router();
    // Utiliser le middleware d'authentification et le middleware d'administration pour toutes les routes
    router.use(authMiddleware);
    router.use(adminMiddleware);
    router.route('/').get(AdminController.getAdmin);
    router.route('/users/subs').get(AdminController.getAllUsersWithSubscriptions);
    router.route('/sneaker').get(AdminController.getSneakers);
    router.route('/sneaker').post(upload.fields([
        { name: 'image_url', maxCount: 1 },
        { name: 'image_url2', maxCount: 1 },
        { name: 'image_url3', maxCount: 1 }
    ]),AdminController.addSneaker);
    router.route('/sneaker/:id').put(upload.fields([
        { name: 'image_url', maxCount: 1 },
        { name: 'image_url2', maxCount: 1 },
        { name: 'image_url3', maxCount: 1 }
    ]),AdminController.updateSneaker);
    router.route('/sneaker/:id').delete(AdminController.deleteSneaker);
    router.route('/sneaker/:id/size').post(upload.none(),AdminController.addSizeToSneaker);
    router.route('/sneaker/:id/size/:sizeId').delete(AdminController.deleteSizeFromSneaker);
    router.route('/collection').post(upload.single('image'), AdminController.addCollection);
    router.route('/collection/:id').put(upload.single('image'), AdminController.updateCollection);
    router.route('/collection/:id').delete(AdminController.deleteCollection);
    router.route('/subscription').get(AdminController.getSubscriptions);
    router.route('/subscription').post(upload.single('image'),AdminController.addSubscription);
    router.route('/subscription/:subscriptionId').put(upload.single('image'),AdminController.updateSubscription);
    router.route('/subscription/:subscriptionId').delete(AdminController.deleteSubscription);
    router.route('/subscription/paid').get(AdminController.getSubscriptionsPaid);
    router.route('/promo-code').get(AdminController.getPromoCodes);
    router.route('/promo-code').post(upload.none(),AdminController.addPromoCode);
    router.route('/promo-code/:id').delete(AdminController.deletePromoCode);
    router.route('/reload-image').get(AdminController.deleteImage);
    return router;
})();
