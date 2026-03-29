const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for system-wide admin alerts, or specific user
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'alert', 'success', 'academic'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
