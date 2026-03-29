
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true },
    department: { type: String, required: true }, // e.g., 'CSE', 'ECE'
    semester: { type: String, required: true }, // e.g., '3rd', '5th'
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    schedule: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        startTime: String, // "14:00"
        endTime: String,   // "16:00"
        room: String       // "302"
    }],
    syllabus: [{
        topic: { type: String, required: true },
        completed: { type: Boolean, default: false },
        week: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
