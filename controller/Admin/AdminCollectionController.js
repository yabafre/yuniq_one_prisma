const AdminService = require("../../service/AdminService");
const stripe = require("stripe")(process.env.VITE_APP_STRIPE_API_SECRET);

class AdminCollectionController {
    static addCollection = async (req, res) => {
        try
        {
            // Upload the image to Cloudinary
            console.log(req.file)
            if (req.file) {
                req.body.image = await AdminService.uploadImage(req.file);
                if (!req.body.image){
                    throw new Error("Image is required");
                }
            }
            if (!req.body.name){
                throw new Error("Name is required");
            }
            if (!req.body.description){
                throw new Error("Description is required");
            }
            const collection = await AdminService.addCollection(req.body);
            if (!collection) throw new Error("Collection not created");
            return res.status(200).json({message: "Collection created successfully", data: collection});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    };
    static updateCollection = async (req, res) => {
        try {
            const collectionId = parseInt(req.params.id, 10);
            // Upload the image to Cloudinary
            if (req.file) {
                req.body.image = await AdminService.uploadImage(req.file);
            }
            if (req.body.status) {
                req.body.status = req.body.status === 'true';
            }
            const collection = await AdminService.updateCollection(collectionId, req.body);
            if (!collection) throw new Error("Collection not found");
            return res.status(200).json({message: "Collection updated successfully", data: collection});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    };
    static deleteCollection = async (req, res) => {
        try {
            const collectionId = req.params.id;
            if (!collectionId) throw new Error("Collection id is required");
            const collection = await AdminService.deleteCollection(collectionId);
            if (!collection) throw new Error("Collection not found");
            return res.status(200).json({message: "Collection deleted successfully", data: collection});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
}

module.exports = AdminCollectionController;