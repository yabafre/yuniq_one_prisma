const AdminService = require("../../service/AdminService");
const AdminSneakersController = require("./AdminSneakerController");
const AdminCollectionController = require("./AdminCollectionController");
const AdminSubscriptionController = require("./AdminSubscriptionController");
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
    deleteImage = async (req, res) => {
        const image = await AdminService.deleteImage();
        res.status(201).json({message: "Image deleted successfully", data: image});
    }

    sneaker = AdminSneakersController;
    collection = AdminCollectionController;
    subscription = AdminSubscriptionController;
}

module.exports = new AdminController();