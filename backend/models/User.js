// User model schema with authentication, profile fields, and password reset functionality

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
        enum: ['New', 'Old']
    },
    cgpa: {
        type: Number,
        required: [true, 'CGPA is required'],
        min: [0, 'CGPA must be at least 0'],
        max: [4, 'CGPA cannot exceed 4']
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
        sparse: true,
        unique: true
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
    const crypto = require('crypto');

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
