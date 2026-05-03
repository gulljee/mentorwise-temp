const mongoose = require('mongoose');

const testSubmissionSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest',
        required: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        answerText: {
            type: String
        },
        isCorrect: {
            type: Boolean, // Automatically calculated for MCQs
            default: null
        }
    }],
    score: {
        type: String // Mentor can provide out of total
    },
    feedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['submitted', 'graded'],
        default: 'submitted'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TestSubmission', testSubmissionSchema);
