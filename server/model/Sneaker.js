const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sneakerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
            default: "https://www.placeholder.com/200/300",
        },
        description: {
            type: String,
            required: true,
        },
        size: [
            {
                type: Number,
                required: true,
            }
        ],
        relatedCollections: [
            {
                type: Schema.Types.ObjectId,
                ref: "Collection",
            }
        ],
        price: {
            type: Number,
            required: false,
        },
        stock: {
            type: Number,
            default: 99,
            required: false,
        },
        status: {
            type: String,
            enum: ["pending", "available", "sold out"],
            default: "available",
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Sneaker = mongoose.model("Sneaker", sneakerSchema);

module.exports = Sneaker;
