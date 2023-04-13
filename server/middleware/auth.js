const jwt = require("jsonwebtoken");
require('dotenv').config()
const {ACCESS_TOKEN_SECRET, TEST_JWT_SESSION} = process.env;

function authMiddleware(req, res, next) {
    const token = TEST_JWT_SESSION
    if (!token) {
        return res.status(401).json({ message: "Auth Error" });
    }
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Invalid Token" });
    }
}

module.exports = authMiddleware;
