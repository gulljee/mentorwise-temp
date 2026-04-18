const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest',
        required: true
    },
    rater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ratee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

ratingSchema.index({ connection: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
