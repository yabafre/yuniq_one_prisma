const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');

class StoreService {

    getUser = async (id) => {
        const user = await prisma.user.findMany({
            where: {
                id: id
            }
        });
        const userWithoutPassword = _.omit(user, 'password');
        console.log(userWithoutPassword)
        return userWithoutPassword;
    }

    getCollection = async () => {
        const collections = await prisma.collection.findMany();
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
                purchases: false
            }
        });
        const checkCollection = sneaker[0].relatedCollections.some(collection => collection.id === parseInt(collectionId));
        if (!checkCollection) {
            return "Sneaker not found";
        }
        return sneaker;
    };

    getSubscriptions = async () => {
        const subscriptions = await Subscription.find();
        return subscriptions;
    };

    getSubscriptionById = async (id) => {
        const subscription = await Subscription.findById(id);
        return subscription;
    };

    subscribe = async (subscriptionId, userId) => {
        const subscription = await Subscription.findById(subscriptionId);
        const user = await User.findById(userId);
        user.subscriptions.push(subscription);
        await user.save();
        return subscription;
    };

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

    checkout = async (userId, subscriptionId, sneakerId) => {
        const user = await User.findById(userId).populate("subscriptions").populate("events").populate('purchases');
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error("Subscription not found");
        }
        const sneaker = await Sneaker.findById(sneakerId);

        // Charge the user for the subscription and the sneaker
        // using Stripe API and update user subscriptions and events
        // with the new data.

        return { user, subscription, sneaker };
    };

}

module.exports = new StoreService();
