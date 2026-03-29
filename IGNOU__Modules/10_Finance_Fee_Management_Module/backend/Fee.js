const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Tuition', 'Library', 'Exam', 'Hostel', 'transportation', 'Other'], required: true },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    date: { type: Date, default: Date.now },
    semester: { type: String },
    transactionId: { type: String },
    serialNo: { type: String, unique: true }
});

module.exports = mongoose.model('Fee', feeSchema);
