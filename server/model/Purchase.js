const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sneakerId: {
            type: Schema.Types.ObjectId,
            ref: "Sneaker",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "delivered", "cancelled", "complete"],
            default: "pending",
            required: true,
        },
        userStripeId: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
