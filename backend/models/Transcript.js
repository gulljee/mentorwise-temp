const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
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
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest',
        required: true
    },
    academicGrade: {
        type: String,
        required: true,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F']
    },
    behaviorRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    punctualityRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    remarks: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transcript', transcriptSchema);
