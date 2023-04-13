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
    router.route('/sneaker').post(upload.array('file', 3),AdminController.addSneaker);
    router.route('/sneaker/:id').put(upload.array('file', 3),AdminController.updateSneaker);
    router.route('/sneaker/:id').delete(AdminController.deleteSneaker);
    router.route('sneaker/:id/size').post(AdminController.addSizeToSneaker);
    router.route('sneaker/:id/size/:sizeId').delete(AdminController.deleteSizeFromSneaker);
    router.route('/collection').post(AdminController.addCollection);
    router.route('/collection/:id').delete(AdminController.deleteCollection);
    router.route('/subscription').post(upload.single('file'),AdminController.addSubscription);
    router.route('/subscription/:subscriptionId').delete(AdminController.deleteSubscription);
    router.route('/promo-code').post(AdminController.addPromoCode);
    router.route('/promo-code/:id').delete(AdminController.deletePromoCode);
    return router;
})();
