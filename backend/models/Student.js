const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rollNo: { type: String, required: true, unique: true },
    course: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: String, default: '1st' },
    sections: { type: String }, // e.g., 'A', 'B'
    cgpa: { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },
    rollNoChanges: { type: Number, default: 0 },
    attendance: [{
        subject: String,
        present: Number,
        total: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
