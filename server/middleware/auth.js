const jwt = require("jsonwebtoken");
require('dotenv').config()
const UserServices = require('../service/UserService')
const {ACCESS_TOKEN_SECRET, TEST_JWT_SESSION} = process.env;

async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] || TEST_JWT_SESSION;

    if (!token) {
        return res.status(401).json({ message: "Auth Error" });
    }
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const user = await UserServices.getUserProfile(decoded.user.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = decoded.user;
        next();
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Invalid Token" });
    }
}

module.exports = authMiddleware;
