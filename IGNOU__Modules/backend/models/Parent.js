const mongoose = require('mongoose');

const parentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    phone: {
        type: String
    },
    address: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Parent', parentSchema);
