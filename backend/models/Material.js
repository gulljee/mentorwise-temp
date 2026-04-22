const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Notes', 'Past Paper'],
        required: [true, 'Material type is required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
