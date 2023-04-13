const express = require('express');
const {login, createToken, register, userAuth, forgotPassword, resetPassword} = require ('../controller/AuthController');

exports.router = (() => {
    const router = express.Router();
    // route for register and login
    router.route('/register').post(userAuth, createToken, register);
    router.route('/login').post(login);
    router.route('/forgot-password').post(forgotPassword);
    router.route('/reset-password').post(resetPassword);
    return router
})();