const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
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
    sneakers: [
        {
            type: Schema.Types.ObjectId,
            ref: "Sneaker",
        },
    ],
});

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;
