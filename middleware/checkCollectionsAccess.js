const StoreService = require('../service/StoreService');

module.exports = async (req, res, next) => {
    const userId = req.user.id; // Supposons que vous ayez le user dans le req
    const collectionId = req.params.collectionId;
    const sneakerId = req.params.sneakerId;

    try {
        const user = await StoreService.getUserWithSubscription(userId);

        if(!user.subscription) {
            throw new Error("User doesn't have a subscription");
        }

        const subscription = await StoreService.getCollectionsForSubscription(user.subscription.id);
        const collections = subscription.relatedCollections;

        if(!collections.find(collection => collection.id === Number(collectionId))) {
            throw new Error("This collection is not included in your subscription");
        }

        if(sneakerId) {
            const sneaker = await StoreService.getSneakerForCollection(collectionId);
            console.log('sneaker id', sneakerId)
            console.log(sneaker)
            if(!sneaker.id === sneakerId) {
                throw new Error("This sneaker is not included in your subscription collection");
            }
        }

        next();
    } catch(err) {
        console.log(err);
        res.status(401).json({ error: err, message: err.message });
    }
}