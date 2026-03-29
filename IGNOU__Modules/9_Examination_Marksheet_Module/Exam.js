const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "End Term Exam Decl 2026"
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "10:00 AM"
    duration: { type: Number, required: true }, // in minutes
    room: { type: String, required: true },
    type: { type: String, enum: ['Mid-Term', 'End-Term', 'Quiz', 'Assignment'], required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);
