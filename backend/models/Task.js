const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest',
        required: [true, 'Connection is required']
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date
    },
    mentorAttachment: {
        url: { type: String },
        type: { type: String, enum: ['image', 'video', 'document'] },
        name: { type: String }
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'pending'
    },
    submission: {
        text: { type: String, trim: true },
        attachment: {
            url: { type: String },
            type: { type: String, enum: ['image', 'video', 'document'] },
            name: { type: String }
        },
        submittedAt: { type: Date }
    },
    grade: { type: String },
    feedback: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
