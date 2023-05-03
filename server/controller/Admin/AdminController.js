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
    getAllUsersWithSubscriptions = async (req, res) => {
        const users = await AdminService.getAllUsersWithSubscriptions();
        res.status(200).json({message: 'Users retrieved successfully', data: users});
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