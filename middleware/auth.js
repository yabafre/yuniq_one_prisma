const jwt = require("jsonwebtoken");
require('dotenv').config()
const UserServices = require('../service/UserService')
const {ACCESS_TOKEN_SECRET, TEST_JWT_SESSION} = process.env;

async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    try {
            console.log('Token set in auth.js: ', token)
        if (!token) {
            throw new Error("No token, authorization denied");
        }
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        if (!decoded) {
            throw new Error("Invalid token");
        }
        const user = await UserServices.getUserProfile(decoded.user.id);
        if (!user) {
            throw new Error("No user found");
        }
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: err, message: err.message });
    }
}

module.exports = authMiddleware;
