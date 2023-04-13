const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        stripeProductId: {
            type: String,
            required: false,
        },
        stripePriceId: {
            type: String,
            required: false,
        },
        relatedCollections: [
            {
                type: Schema.Types.ObjectId,
                ref: "Collection",
                required: false,
            },
        ]
    },
    {
        timestamps: true,
    }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
