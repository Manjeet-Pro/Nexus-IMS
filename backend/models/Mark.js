const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    type: { type: String, required: true, enum: ['Mid-Term', 'End-Term', 'Assignment', 'Quiz'] },
    marks: { type: Number, required: true },
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mark', markSchema);
