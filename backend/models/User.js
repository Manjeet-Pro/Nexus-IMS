const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty', 'student', 'parent'], required: true },
    avatar: {
        type: String,
        default: '/uploads/avatars/default.png'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    publicProfile: {
        type: Boolean,
        default: true
    },
    emailNotifs: {
        type: Boolean,
        default: true
    },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

module.exports = mongoose.model('User', userSchema);
