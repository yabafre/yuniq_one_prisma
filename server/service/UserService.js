const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');
const fs = require('fs');
const cloudinary = require('../service/CloudinaryService');

class UserService{

    getUserProfile = async (userId) => {
        const userProfile = await prisma.user.findMany({
            where: {
                id: userId
            },
            include: {
                subscription: true,
                purchases: true,
                paymentDetails: true,
                events: true,
                _count: true
            }
        });
        const userProfileWithoutPassword = _.omit(userProfile, 'password');
        if (userProfileWithoutPassword[0] === undefined) {
            return false;
        }
        return userProfileWithoutPassword[0];
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
            await prisma.user.deleteMany({
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
        const user = await prisma.user.findMany({
            where: {
                id: parseInt(userId)
            },
            include: {
                subscription: true,
                purchases: false,
                paymentDetails: false,
                events: false,
                _count: false
            }
        });
        return user[0];
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
                id: parseInt(userId)
            },
            data: {
                subscriptionId: parseInt(updatedSubscriptions.subscriptionId),
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

    // Upload the image to Cloudinary
    uploadImage = async (file) => {
        try {
            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'profile', // You can change the folder name to your preferred folder
            });
            // Delete the local file after uploading to Cloudinary
            fs.unlinkSync(file.path);
            // Return the image URL
            console.log('Image uploaded to Cloudinary: ', result.secure_url)
            return result.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Error uploading image');
        }
    }
}

module.exports = new UserService();