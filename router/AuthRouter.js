const express = require('express');
const upload = require('../middleware/uploads-multer');
const {login, createToken, register, userAuth, forgotPassword, resetPassword, contact} = require ('../controller/Auth/AuthController');

exports.router = (() => {
    const router = express.Router();
    // route for register and login
    router.route('/register').post(upload.single('avatar'),userAuth, createToken, register);
    router.route('/login').post(upload.none(),login);
    router.route('/forgot-password').post(upload.none(),forgotPassword);
    router.route('/reset-password').post(upload.none(),resetPassword);
    router.route('/contact').post(upload.none(),contact)
    return router
})();