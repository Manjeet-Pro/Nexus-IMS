const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceMessage: {
        type: String,
        default: 'System is under maintenance. Please try again later.'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
