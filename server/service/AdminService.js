const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const _ = require('lodash');
const fs = require('fs');
require('dotenv').config();
const stripe = require("stripe")(process.env.VITE_APP_STRIPE_API_SECRET);
const cloudinary = require('../service/CloudinaryService');

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
                image_url: images.image_url,
                image_url2: images.image_url2,
                image_url3: images.image_url3,
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
        const updateData = {};

        if(sneakerData.status !== undefined){
            updateData.status = sneakerData.status;
        }

        if (sneakerData.name !== undefined) {
            updateData.name = sneakerData.name;
        }

        if (sneakerData.description !== undefined) {
            updateData.description = sneakerData.description;
        }

        if (sneakerData.price !== undefined) {
            updateData.price = parseFloat(sneakerData.price);
        }

        if (images.image_url !== undefined) {
            updateData.image_url = images.image_url;
        }

        if (images.image_url2 !== undefined) {
            updateData.image_url2 = images.image_url2;
        }

        if (images.image_url3 !== undefined) {
            updateData.image_url3 = images.image_url3;
        }

        if (sneakerData.stock !== undefined) {
            updateData.stock = parseInt(sneakerData.stock, 10);
        }

        const parsedCollectionId = parseInt(sneakerData.collectionId, 10);
        if (!isNaN(parsedCollectionId)) {
            updateData.relatedCollections = {
                connect: {
                    id: parsedCollectionId,
                },
            };
        }


        if (sizes.length > 0) {
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

            // Ajoutez les nouvelles tailles à updateData
            updateData.sizeSneaker = {
                create: sizes.map((size) => ({
                    size: { connect: { id: size.size } },
                })),
            };
        }

        // Mise à jour du sneaker avec les nouvelles données et relations
        const updatedSneaker = await prisma.sneaker.update({
            where: {
                id: parseInt(sneakerId),
            },
            data: updateData,
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
        const deletedSneaker = await prisma.sneaker.findUnique({
            where: {
                id: parseInt(sneakerId),
            },
            include: {
                sizeSneaker: true,
                relatedCollections: true,
                relatedEvents: {
                    include: {
                        event: true,
                    },
                },
            },
        });

        if (!deletedSneaker) {
            return 'Sneaker not found';
        }

        await prisma.sneaker.deleteMany({
            where: {
                id: parseInt(sneakerId),
            }
        });
        return 'Sneaker deleted';
    };
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
    deleteSizeFromSneaker = async (sneakerId, size) => {
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
                    in: size,
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
                image: collectionData.image,
            }
        });
        return collection;
    };
    updateCollection = async (collectionId, collectionData) => {
        const updateData = {};
        if (collectionData.name !== undefined) {
            updateData.name = collectionData.name;
        }
        if (collectionData.description !== undefined) {
            updateData.description = collectionData.description;
        }
        if (collectionData.image !== undefined) {
            updateData.image = collectionData.image;
        }
        const collection = await prisma.collection.update({
            where: {
                id: parseInt(collectionId),
            },
            data: updateData,
        });
        return collection;
    }
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
    addSubscription = async (subscriptionData) => {
        const subscription = await prisma.subscription.create({
            data: {
                name: subscriptionData.name,
                description: subscriptionData.description,
                price: parseInt(subscriptionData.price),
                image: subscriptionData.image,
                interval: subscriptionData.interval,
                intervalCount: parseInt(subscriptionData.intervalCount),
                relatedCollections: {
                    connect: {
                        id: parseInt(subscriptionData.collection),
                    }
                }
            }
        });
        return subscription;
    };
    updateSubscription = async (subscriptionId, subscriptionData) => {
        const subscription = await prisma.subscription.update({
            where: {
                id: parseInt(subscriptionId),
            },
            data: subscriptionData,
        });
        console.log('update : ',subscription);
        return subscription;
    }
    deleteSubscription = async (subscriptionId) => {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: {
                    id: parseInt(subscriptionId),
                },
            });

            if (subscription) {
                // Get the prices associated with the product
                const prices = await stripe.prices.list({
                    product: subscription.stripeProductId,
                });

                if (prices.data.length === 0) {
                    // Delete the product
                    await stripe.products.del(subscription.stripeProductId);
                    await prisma.subscription.delete({
                        where: {
                            id: parseInt(subscriptionId),
                        },
                    });
                    return `Delete subscription success`;
                } else {
                    return `Product ${subscription.stripeProductId} cannot be deleted because it has one or more user-created prices.`;
                }
            } else {
                return 'Subscription not found';
            }
        } catch (err) {
            return `Delete subscription error: ${err}`;
        }
    };
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
    // deleteImage all images to Cloudinary by public_id
    deleteImage = async () => {
        try {
            // Récupérer toutes les images du dossier "sneakers" sur Cloudinary
            const { resources } = await cloudinary.api.resources({
                type: "upload",
                prefix: "sneakers",
                max_results: 500,
            });

            // Parcourir chaque image
            for (const resource of resources) {
                // Vérifier si l'image est utilisée dans les tables de la base de données
                const subscriptions = await prisma.subscription.findMany({
                    where: { image: resource.secure_url },
                });
                const collections = await prisma.collection.findMany({
                    where: { image: resource.secure_url },
                });
                const events = await prisma.event.findMany({
                    where: { image: resource.secure_url },
                });
                const sneakers_url = await prisma.sneaker.findMany({
                    where: { image_url: resource.secure_url },
                });
                const sneakers_url2 = await prisma.sneaker.findMany({
                    where: { image_url2: resource.secure_url },
                });
                const sneakers_url3 = await prisma.sneaker.findMany({
                    where: { image_url3: resource.secure_url },
                });
                const user = await prisma.user.findMany({
                    where: { avatar: resource.secure_url },
                });
                // Si l'image n'est pas utilisée, la supprimer de Cloudinary
                if (subscriptions.length === 0 && collections.length === 0 && events.length === 0 && sneakers_url.length === 0 && sneakers_url2.length === 0 && sneakers_url3.length === 0 && user.length === 0) {
                    await cloudinary.uploader.destroy(resource.public_id);
                }
            }

            return "Suppression des images inutilisées terminée.";
        } catch (error) {
            console.error("Erreur lors de la suppression des images :", error);
            return "Erreur lors de la suppression des images.";
        }
    };
}

module.exports = new AdminService();