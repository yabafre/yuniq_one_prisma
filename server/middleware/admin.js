const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');
module.exports = async (req, res, next) => {
    const user = req.user.id;
    const check = await prisma.user.findUnique({
        where: {
            id: user
        }
    });
    console.log(check.isAdmin)
    if (!check.isAdmin) {
        return res.status(403).json({ message: "Accès refusé. Vous devez être administrateur pour accéder à cette ressource." });
    }
    next();
}