const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventSchema = new Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String, required: true },
    sneakers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Sneaker',
        }
    ],
});


const Event = mongoose.model('Event', eventSchema);

module.exports =  Event;
