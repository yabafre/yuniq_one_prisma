const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');
module.exports = async (req, res, next) => {
    try {
        const user = req.user.id;
        const check = await prisma.user.findUnique({
            where: {
                id: user
            }
        });
        if (!check) {
            throw new Error('Utilisateur non trouvé');
        }
        console.log(check.isAdmin)
        if (!check.isAdmin) {
            throw new Error('Vous n\'avez pas les droits pour accéder à cette page');
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}