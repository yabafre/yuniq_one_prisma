const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');

class StoreService {

    getUser = async (id) => {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });
        const userWithoutPassword = _.omit(user, 'password');
        console.log(userWithoutPassword)
        return userWithoutPassword;
    }
    getCollection = async () => {
        const collections = await prisma.collection.findMany(
            {
                include: {
                    _count: {
                        select: {
                            sneakers: true,
                        }
                    }
                }
            }
        );
        return collections;
    };
    getCollectionById = async (id) => {
        const collection = await prisma.collection.findMany({
            where: {
                id: parseInt(id) // convertir la chaîne de caractères en entier
            },
            include: {
                sneakers: true,
                subscriptions: true,
                _count: {
                    select: {
                        sneakers: true,
                        subscriptions: true
                    }
                }
            }
        });
        return collection;
    };
    getSneakerById = async (collectionId, sneakerId) => {
        const sneaker = await prisma.sneaker.findMany({
            where: {
                id: parseInt(sneakerId)
            },
            include: {
                sizeSneaker: true,
                _count: true,
                relatedCollections: true,
                relatedEvents: true,
            }
        });
        console.log(sneaker)
        const checkCollection = sneaker[0].relatedCollections.some(collection => collection.id === parseInt(collectionId));
        if (!checkCollection) {
            return false;
        }
        return sneaker;
    };
    getSubscriptions = async () => {
        const subscriptions = await prisma.subscription.findMany({
            include: {
                _count: true,
                relatedCollections: true,
            }
        });
        return subscriptions;
    };
    getSubscriptionById = async (id) => {
        const subscription = await prisma.subscription.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                _count: true,
                relatedCollections: true,
                users: false
            }
        });
        return subscription;
    };
    subscribe = async (subscriptionId, userId) => {
        const user = await prisma.user.update({
            where: {
                id: parseInt(userId)
            },
            data: {
                subscription: {
                    connect: {
                        id: parseInt(subscriptionId)
                    }
                }
            }
        })
        return user;

    };
    updateSubscription = async (subscriptionId, userId) => {
        try {
            // Récupération de l'utilisateur et de sa subscription actuelle
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true },
            });
            if (!user) {
                throw new Error('User not found');
            }

            // Vérification que la nouvelle subscription existe
            const subscription = await prisma.subscription.findUnique({
                where: { id: subscriptionId },
            });
            if (!subscription) {
                throw new Error('Subscription not found');
            }

            // Mise à jour de la subscription de l'utilisateur dans la base de données
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { subscription: { connect: { id: subscriptionId } } },
                include: { subscription: true },
            });

            return { user: updatedUser, subscription: subscription };
        } catch (error) {
            console.error(`Error updating user with ID ${userId}: ${error.message}`);
            throw error;
        }
    }
    createPayment = async (userId,paymentDetails) => {
        try {
            // Find the user by their ID
            const user = await prisma.user.findUnique({
                where: {
                    id: parseInt(userId)
                }
            });
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    paymentDetails: {
                        create: {
                            ...paymentDetails
                        }
                    }
                },
            });
            return updatedUser;
        } catch (error) {
            console.error(`Error updating user with ID ${userId}: ${error.message}`);
            throw error;
        }
    }
    createPurchase = async (userId, sneakerId) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
                include: { subscription: true },
            });
            if (!user.subscription) {
                throw new Error('User does not have a subscription');
            }
            const subscriptionId = user.subscription.id;
            const sneaker = await prisma.sneaker.findUnique({
                where: { id: parseInt(sneakerId) },
                include: { relatedCollections: true },
            });
            if (!sneaker) {
                throw new Error('Sneaker not found');
            }

            const collectionId = sneaker.relatedCollections[0].id;
            const collection = await prisma.collection.findUnique({
                where: { id: collectionId },
                include: { subscriptions: true },
            });
            if (!collection) {
                throw new Error('Collection not found');
            }
            const subscription = collection.subscriptions.find(
                (subscription) => subscription.id === subscriptionId
            );
            console.log(subscription)
            if (!subscription) {
                throw new Error('Sneaker is not part of the user subscription');
            }

            const purchase = await prisma.purchase.create({
                data: {
                    user: { connect: { id: parseInt(userId) } },
                    sneaker: sneaker.name,
                    sneakerId: sneaker.id,
                    price: subscription.price,
                    userStripeId: user.stripeCustomerId,
                },
            });
            return purchase;
        } catch (error) {
            console.error(`Error making purchase for user with ID ${userId}: ${error.message}`);
            throw error;
        }
    }

    getEvents = async () => {
        const events = await Event.find();
        return events;
    };

    getEventById = async (id) => {
        const event = await Event.findById(id);
        return event;
    };

    eventSubscribe = async (eventId, userId) => {
        const event = await Event.findById(eventId);
        const user = await User.findById(userId);
        user.events.push(event);
        await user.save();
        return event;
    };

    checkout = async (userId, subscriptionId) => {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(userId)
            }
        });
        const subscription = await prisma.subscription.findUnique({
            where: {
                id: parseInt(subscriptionId)
            }
        });
        if (!subscription) {
            throw new Error("Subscription not found");
        }

        // Charge the user for the subscription and the sneaker
        // using Stripe API and update user subscriptions and events
        // with the new data.

        return { user, subscription};
    };

}

module.exports = new StoreService();
