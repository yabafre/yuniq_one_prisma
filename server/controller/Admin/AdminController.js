const AdminService = require("../../service/AdminService");
const AdminSneakersController = require("./AdminSneakerController");
const AdminCollectionController = require("./AdminCollectionController");
const AdminSubscriptionController = require("./AdminSubscriptionController");
const AdminEventController = require("./AdminEventController");
const UserService = require("../../service/UserService");
const StoreService = require("../../service/StoreService");
require('dotenv').config();
const stripe = require("stripe")(process.env.VITE_APP_STRIPE_API_SECRET);

class AdminController {
    getAdmin = async (req, res) => {
        const id = req.user.id;
        const admin = await AdminService.getAdmin(id);
        res.status(200).json(admin);
    }
    getAllUsers = async (req, res) => {
        const users = await AdminService.getAllUsers();
        res.status(200).json({message: 'Users retrieved successfully', data: users});
    }
    getAllUsersWithSubscriptions = async (req, res) => {
        const users = await AdminService.getAllUsersWithSubscriptions();
        res.status(200).json({message: 'Users With Subscriptions retrieved successfully', data: users});
    }
    updateUser = async (req, res) => {
        try {
            const userId = req.params.id;
            if (req.file) {
                req.body.avatar = await AdminService.uploadImage(req.file);
            }
            if (!userId) {
                throw new Error("User not found");
            }
            if (req.body.isAdmin) {
                req.body.isAdmin = JSON.parse(req.body.isAdmin);
            }

            const updatedUser = await AdminService.updateUser(userId, req.body);

            if (!updatedUser) {
                throw new Error("User not found");
            } else {
                res.status(200).json({message: "User updated successfully", data: updatedUser});
            }
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    updateUserSubscription = async (req, res) => {
        try {
            console.log(req.body);
            const userId = req.params.id;
            const { newSubscriptionId } = req.body;
            if (!newSubscriptionId) {
                throw new Error("Subscription id is required");
            }
            const currentSubscription = await UserService.getUserSubscriptions(userId); // Récupérez l'abonnement actuel de l'utilisateur
            console.log("currentSubscription: ", currentSubscription);
            if (!currentSubscription) {
                throw new Error("User not found");
            }
            console.log("userId: ", userId);
            console.log("currentSubscription: ", currentSubscription);

            const newSubscription = await StoreService.getSubscriptionById(newSubscriptionId); // Récupérez le nouvel abonnement choisi par l'utilisateur

            if (!newSubscription) {
                throw new Error("Subscription not found");
            }
            console.log('newSubscription: ', newSubscription);
            // Mettez à jour l'abonnement de l'utilisateur dans Stripe
            const stripeSubscription = await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId );
            console.log("stripeSubscription: ", stripeSubscription);
           const stripeUpdate = await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId , {
                items: [
                    {
                        id: stripeSubscription.items.data[0].id,
                        price: newSubscription.stripePriceId,
                    },
                ],
            });
            console.log("stripeUpdate: ", stripeUpdate);

            //Mettez à jour l'abonnement de l'utilisateur dans votre base de données
            const updatedUser = await UserService.updateUserSubscriptions(userId, { subscriptionId: parseInt(newSubscriptionId, 10) });

            if (!updatedUser) {
                throw new Error("Failed to update user subscription");
            }

            res.status(200).json({ message: "Subscription updated", user: updatedUser });

        } catch (error) {
            return res.status(400).json({message: error.message});
        }

    };
    deleteImage = async (req, res) => {
        const image = await AdminService.deleteImage();
        res.status(201).json({message: "Image deleted successfully", data: image});
    }
    sneaker = AdminSneakersController;
    event = AdminEventController;
    collection = AdminCollectionController;
    subscription = AdminSubscriptionController;
}

module.exports = new AdminController();