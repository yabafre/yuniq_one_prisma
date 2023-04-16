const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSubscription(req, res, next) {
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { subscription: true },
        });
        if (!user.subscription) {
            throw new Error('User does not have a subscription');
        }
        next();
    } catch (error) {
        console.error(`Error checking subscription for user with ID ${userId}: ${error.message}`);
        res.status(403).json({ message: 'User does not have a subscription' });
    }
}

module.exports = checkSubscription;