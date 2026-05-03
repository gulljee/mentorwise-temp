const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        default: 'General Mentorship'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Prevent duplicate requests for the same mentor+subject pair
connectionRequestSchema.index({ mentee: 1, mentor: 1, subject: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
