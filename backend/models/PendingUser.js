const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    batch: {
        type: String,
        required: [true, 'Batch is required'],
        enum: ['F22', 'F23', 'F24', 'F25']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['CS', 'IT', 'SE', 'DS']
    },
    campus: {
        type: String,
        required: [true, 'Campus is required'],
        enum: ['PUCIT', 'New', 'Old']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['Mentor', 'Mentee'],
        default: 'Mentee'
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === 'local';
        },
        minlength: [6, 'Password must be at least 6 characters']
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true
    },
    otpCode: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    transcript: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // Auto-deletes this document after 15 mins (900 seconds)
    }
}, {
    timestamps: true
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
module.exports = PendingUser;
