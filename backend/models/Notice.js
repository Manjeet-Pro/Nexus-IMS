const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString() }, // Store formatted date or Date object
    audience: { type: String, default: 'All Students' }, // e.g., 'All', 'CSE', etc.
    type: { type: String, enum: ['academic', 'event', 'holiday', 'info'], default: 'info' },
    attachmentUrl: { type: String }, // URL to the hosted file (PDF, image, etc.)
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Notice', noticeSchema);
