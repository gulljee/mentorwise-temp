const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest',
        required: [true, 'Connection is required']
    },
    title: {
        type: String,
        required: [true, 'Test title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    durationMins: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Minimum 1 minute']
    },
    dueDate: {
        type: Date
    },
    questions: [{
        questionType: {
            type: String,
            enum: ['mcq', 'short'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        options: {
            type: [String] // Only for MCQ
        },
        correctAnswer: {
            type: String // Only for MCQ
        }
    }],
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
