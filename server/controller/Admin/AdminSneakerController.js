const AdminService = require("../../service/AdminService");
const stripe = require("stripe")(process.env.VITE_APP_STRIPE_API_SECRET);

class AdminSneakerController {
    getSneakers = async (req, res) => {
        try {
            const sneakers = await AdminService.getSneakers();
            res.status(200).json({message: 'Sneakers retrieved successfully', data: sneakers});
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    }
    addSneaker = async (req, res) => {
        try {
            const {collectionId, sizes} = req.body;
            let parsedSizes = [];

            if (sizes) {
                parsedSizes = JSON.parse(sizes);
            }
            // Upload the images array to Cloudinary
            let images = [];

            if (req.files) {
                const imagePromises = [];
                Object.keys(req.files).forEach((fieldName) => {
                    const files = req.files[fieldName];
                    files.forEach((file) => {
                        imagePromises.push(
                            AdminService.uploadImage(file).then((image) => {
                                const imageObject = {};
                                imageObject[fieldName] = image;
                                return imageObject;
                            })
                        );
                    });
                });
                const imageResults = await Promise.all(imagePromises);
                images = imageResults.reduce((accumulator, current) => {
                    return { ...accumulator, ...current };
                }, {});
            }
            if (!collectionId) {
                throw new Error('Collection ID is required');
            }
            if (!parsedSizes.length) {
                throw new Error('Sizes are required');
            }
            if (!images.length) {
                throw new Error('Images are required');
            }
            if (!req.body.name) {
                throw new Error('Name is required');
            }
            if (!req.body.description) {
                throw new Error('Description is required');
            }
            if (!req.body.price) {
                throw new Error('Price is required');
            }
            const sneaker = await AdminService.addSneaker(req.body, collectionId, images, parsedSizes);
            res.status(201).json({message: 'Sneaker added successfully', data: sneaker});
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };
    updateSneaker = async (req, res) => {
        try {
            const sneakerId = parseInt(req.params.id, 10);
            if (!sneakerId) {
                throw new Error('Sneaker ID is required');
            }
            const {sizes} = req.body;
            let parsedSizes = [];
            if (sizes) {
                parsedSizes = JSON.parse(sizes);
            }
            // Upload the images array to Cloudinary
            let images = [];

            if (req.files) {
                const imagePromises = [];
                Object.keys(req.files).forEach((fieldName) => {
                    const files = req.files[fieldName];
                    files.forEach((file) => {
                        imagePromises.push(
                            AdminService.uploadImage(file).then((image) => {
                                const imageObject = {};
                                imageObject[fieldName] = image;
                                return imageObject;
                            })
                        );
                    });
                });
                const imageResults = await Promise.all(imagePromises);
                images = imageResults.reduce((accumulator, current) => {
                    return { ...accumulator, ...current };
                }, {});
            }
            const sneaker = await AdminService.updateSneaker(sneakerId, req.body, images, parsedSizes);
            if (sneaker) {
                res.status(200).json({message: 'Sneaker updated successfully', data: sneaker});
            } else {
                throw new Error('Sneaker not found');
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };
    deleteSneaker = async (req, res) => {
        try {
            const sneakerId = parseInt(req.params.id, 10);
            if (!sneakerId) {
                throw new Error('Sneaker ID is required');
            }
            const sneaker = await AdminService.deleteSneaker(sneakerId);
            if (sneaker) {
                res.status(200).json({message: 'Sneaker deleted successfully', data: sneaker});
            } else {
                throw new Error('Sneaker not found');
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };
    addSizeToSneaker = async (req, res) => {
        try {
            const sneakerId = parseInt(req.params.id, 10);
            const {sizes} = req.body;

            if (!sneakerId) {
                throw new Error('Sneaker ID is required');
            }
            if (!sizes) {
                throw new Error('Sizes are required');
            }
            let parsedSizes = [];

            if (sizes) {
                parsedSizes = JSON.parse(sizes);
            }
            console.log(parsedSizes)
            const size = await AdminService.addSizesToSneaker(sneakerId, parsedSizes);
            if (size) {
                res.status(200).json({message: 'Sizes added successfully', data: size});
            } else {
                throw new Error('Error adding size to sneaker');
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };
    deleteSizeFromSneaker = async (req, res) => {
        try {
            const sneakerId = parseInt(req.params.id, 10);
            const sizeId = parseInt(req.params.sizeId, 10);
            if (!sneakerId) {
                throw new Error('Sneaker ID is required');
            }
            if (!sizeId) {
                throw new Error('Size ID is required');
            }
            const size = await AdminService.deleteSizeFromSneaker(sneakerId, sizeId);
            if (size) {
                res.status(200).json({message: 'Size deleted successfully', data: size});
            } else {
                throw new Error('Error deleting size from sneaker');
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };
}

module.exports = new AdminSneakerController();