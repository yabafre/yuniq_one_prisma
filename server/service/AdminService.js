const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');
const fs = require('fs');
require('dotenv').config();
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your API credentials
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});
class AdminService{
    /**
     * Sneaker fields param prisma
     * @param {array} sneakerData
     * @param {string} collectionId
     * @param {array} images - Sneaker image
     * @param {array} sizes
     */
    addSneaker = async (sneakerData, collectionId, images, sizes) => {
        const existingSizes = await prisma.size.findMany();
        const missingSizes = sizes.filter((size) => !existingSizes.find((s) => s.id === size.size));

        if (missingSizes.length > 0) {
            const createdSizes = await prisma.size.createMany({
                data: missingSizes.map((size) => ({
                    id: size.size,
                    size: size.size
                })),
            });
            existingSizes.push(...Array.from(createdSizes));
        }

        const sneaker = await prisma.sneaker.create({
            data: {
                name: sneakerData.name,
                description: sneakerData.description,
                price: parseFloat(sneakerData.price),
                image_url: images[0],
                image_url2: images[1],
                image_url3: images[2],
                status: sneakerData.status,
                stock: parseInt(sneakerData.stock),
                relatedCollections: {
                    connect: {
                        id: parseInt(collectionId),
                    },
                },
                sizeSneaker: {
                    create: sizes.map((size) => ({
                        size: { connect: { id: size.size } },
                    })),
                },
            },
            include: {
                sizeSneaker: {
                    include: {
                        size: true,
                    },
                },
            },
        });
        return sneaker;
    };
    /**
     * Sneaker fields param prisma
     * @param sneakerId
     * @param {string} sneakerId
     * @param {array} sneakerData
     * @param {string} collectionId
     * @param {Awaited<unknown>[]} images - Subscription image
     * @param {array} sizes
     */
    updateSneaker = async (sneakerId, sneakerData, images, sizes) => {
        // Vérifiez d'abord si les tailles existent déjà ou doivent être créées
        const existingSizes = await prisma.size.findMany();
        const missingSizes = sizes.filter((size) => !existingSizes.find((s) => s.id === size.size));

        if (missingSizes.length > 0) {
            const createdSizes = await prisma.size.createMany({
                data: missingSizes.map((size) => ({
                    id: size.size,
                    size: size.size
                })),
            });
            existingSizes.push(...Array.from(createdSizes));
        }

        // Mise à jour des tailles de sneakers et suppression des anciennes relations
        await prisma.sneaker.update({
            where: { id: parseInt(sneakerId) },
            data: {
                sizeSneaker: {
                    deleteMany: {},
                },
            },
        });

        // Mise à jour du sneaker avec les nouvelles données et relations
        const updatedSneaker = await prisma.sneaker.update({
            where: {
                id: parseInt(sneakerId),
            },
            data: {
                name: sneakerData.name,
                description: sneakerData.description,
                price: parseFloat(sneakerData.price),
                image_url: images[0],
                image_url2: images[1],
                image_url3: images[2],
                status: sneakerData.status,
                stock: parseInt(sneakerData.stock),
                relatedCollections: parseInt(sneakerData.collectionId)
                    ? {
                        connect: {
                            id: parseInt(sneakerData.collectionId),
                        },
                    }
                    : undefined,
                sizeSneaker: {
                    create: sizes.map((size) => ({
                        size: { connect: { id: size.size } },
                    })),
                },
            },
            include: {
                sizeSneaker: {
                    include: {
                        size: true,
                    },
                },
            },
        });

        return updatedSneaker;
    };
    deleteSneaker = async (sneakerId) => {
        const sneaker = await prisma.sneaker.findUnique({
            where: {
                id: parseInt(sneakerId),
            }
        });
        if (sneaker) {
            await prisma.sneaker.delete({
                where: {
                    id: parseInt(sneakerId),
                }
            });
            return 'Sneaker deleted';
        } else {
            return 'Sneaker not found';
        }
    }
    addSizesToSneaker = async (sneakerId, sizes) => {
        // Vérifiez d'abord si les tailles existent déjà ou doivent être créées
        const existingSizes = await prisma.size.findMany();
        const missingSizes = sizes.filter((size) => !existingSizes.find((s) => s.id === size.size));

        if (missingSizes.length > 0) {
            const createdSizes = await prisma.size.createMany({
                data: missingSizes.map((size) => ({
                    id: size.size,
                    size: size.size
                })),
            });
            existingSizes.push(...Array.from(createdSizes));
        }

        // Ajoutez les nouvelles tailles au sneaker existant
        const updatedSneaker = await prisma.sneaker.update({
            where: {
                id: parseInt(sneakerId),
            },
            data: {
                sizeSneaker: {
                    create: sizes.map((size) => ({
                        size: { connect: { id: size.size } },
                    })),
                },
            },
            include: {
                sizeSneaker: {
                    include: {
                        size: true,
                    },
                },
            },
        });

        return updatedSneaker;
    };
    deleteSizesFromSneaker = async (sneakerId, sizes) => {
        // Trouver le sneaker par ID
        const sneaker = await prisma.sneaker.findUnique({
            where: {
                id: parseInt(sneakerId),
            },
            include: {
                sizeSneaker: true,
            },
        });

        if (!sneaker) {
            throw new Error(`Sneaker with ID ${sneakerId} not found`);
        }

        // Supprimer les tailles associées au sneaker
        const removedSizes = await prisma.sizeSneaker.deleteMany({
            where: {
                sneakerId: parseInt(sneakerId),
                sizeId: {
                    in: sizes.map((size) => size.size),
                },
            },
        });

        // Retourner le sneaker mis à jour sans les tailles supprimées
        const updatedSneaker = await prisma.sneaker.findUnique({
            where: {
                id: parseInt(sneakerId),
            },
            include: {
                sizeSneaker: {
                    include: {
                        size: true,
                    },
                },
            },
        });

        return updatedSneaker;
    };
    addCollection = async (collectionData) => {
        const collection = await prisma.collection.create({
            data: {
                name: collectionData.name,
                description: collectionData.description,
            }
        });
        return collection;
    };
    deleteCollection = async (collectionId) => {
        const collection = await prisma.collection.findUnique({
            where: {
                id: parseInt(collectionId),
            }
        });
        if (collection) {
            await prisma.collection.delete({
                where: {
                    id: parseInt(collectionId),
                }
            });
            return 'Collection deleted';
        } else {
            return 'Collection not found';
        }
    }
    addSubscription = async (subscriptionData, collection, image) => {
        const subscription = await prisma.subscription.create({
            data: {
                name: subscriptionData.name,
                description: subscriptionData.description,
                price: parseInt(subscriptionData.price),
                image: image,
                relatedCollections: {
                    connect: {
                        id: parseInt(collection),
                    }
                }
            }
        });
        return subscription;
    };
    updateSubscription = async (subscriptionId, productPriceStripe, priceStripe) => {
        const subscription = await prisma.subscription.update({
            where: {
                id: parseInt(subscriptionId),
            },
            data: {
                stripeProductId: productPriceStripe,
                stripePriceId: priceStripe
            }
        });
        console.log('update : ',subscription);
        return subscription;
    }
    deleteSubscription = async (subscriptionId) => {
        const subscription = await prisma.subscription.findUnique({
            where: {
                id: parseInt(subscriptionId),
            }
        });
        if (subscription) {
            await stripe.products.del(subscription.stripeProductId)
                .then((res) => {
                    console.log('delete product : ',res);
                    stripe.prices.del(subscription.stripePriceId).then((res) => {
                        console.log('delete price : ',res);
                        prisma.subscription.delete({
                            where: {
                                id: parseInt(subscriptionId),
                            }
                        }).then((res) => {
                            return `Delete subscription success`;
                        }).catch((err) => {
                            return `Delete subscription error: ${err}`;
                        });
                    }).catch((err) => {
                        console.log('delete price error : ',err);
                    });
                })
                .catch((err) => {
                    return `Delete product error: ${err}`;
                });
        } else {
            return 'Subscription not found';
        }
    }
    addPromoCode = async (promoCodeData) => {
        const promoCode = await prisma.codePromo.create({
            data: {
                code: promoCodeData.id,
                discount: promoCodeData.percent_off.toString(),
                maxRedeem: parseInt(promoCodeData.max_redemptions),
                endTime: (new Date(promoCodeData.redeem_by)).toString(),
                duration: promoCodeData.duration,
                valid: promoCodeData.valid
            }
        });
        return promoCode;
    }
    deletePromoCode = async (code) => {
        let valid = false;
        const coupon = await stripe.coupons.del(
            code,
        ).then((res) => {
            valid = true;
        }).catch((err) => {
            return `Delete coupon error: ${err}`;
        });
        if (valid) {
            await prisma.codePromo.deleteMany({
                where: {
                    code: code,
                }
            })
            return `Delete coupon success`;
        }
    }
    // Upload the image to Cloudinary
    uploadImage = async (file) => {
        try {
            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'sneakers', // You can change the folder name to your preferred folder
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

module.exports = new AdminService();