const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');


class UserService{

    getUserProfile = async (userId) => {
        const userProfile = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        const userProfileWithoutPassword = _.omit(userProfile, 'password');
        return userProfileWithoutPassword;
    };

    checkEmail = async (email) => {
        const getEmail = await prisma.user.findUnique({
            where: {
                email: email
            },
        });
        return !getEmail;
    }

    updateUserProfile = async (userId, updateData) => {
        const updatedProfile = await prisma.user.update({
            where: {
                id: userId
            },
            data: updateData
        });
        const updatedProfileWithoutPassword = _.omit(updatedProfile, 'password');
        return updatedProfileWithoutPassword;
    };

    deleteUserProfile = async (userId) => {
        let message;
        try {
            await prisma.user.delete({
                where: {
                    id: userId
                }
            });
            message = "Profile deleted successfully";
            return message;
        } catch (error) {
            message = "Error deleting profile";
            return message;
        }
    };

    getUserSubscriptions = async (userId) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                subscription: true
            }
        });
        return user.subscription;
    };

    getUserPurchases = async (userId) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                purchases: true
            }
        });
        return user.purchases;
    };

    updateUserSubscriptions = async (userId, updatedSubscriptions) => {
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                subscription: updatedSubscriptions.id,
                subscriptionId: updatedSubscriptions.subscriptionId
            },
        });

        return user;
    };

    getUserPaymentDetails = async (userId) => {
        // Assuming that the user's payment details are stored in the User model
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                paymentDetails: true
            }
        });
        return user.paymentDetails;
    };

    updateUserWithPurchase = async (userId, subscriptionId, purchaseData, paymentDetails) => {
        try {
            // Find the user by their ID
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            });
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            const purchase = await prisma.purchase.create({
                data: {
                    ...purchaseData,
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                }
            });
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    subscription: {
                        connect: {
                            id: subscriptionId
                        }
                    },
                    paymentDetails: paymentDetails,
                    purchases: {
                        connect: {
                            id: purchase.id
                        }
                    },
                    subscriptionId: subscriptionId,
                },
            });
            return updatedUser;
        } catch (error) {
            console.error(`Error updating user with ID ${userId}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new UserService();