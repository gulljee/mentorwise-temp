const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectionRequest',
        required: [true, 'Connection is required']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender is required']
    },
    text: {
        type: String,
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    attachment: {
        url:  { type: String },
        type: { type: String, enum: ['image', 'video', 'document'] },
        name: { type: String }
    }
}, {
    timestamps: true
});

messageSchema.index({ connection: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
