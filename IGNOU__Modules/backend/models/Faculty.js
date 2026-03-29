const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, unique: true, sparse: true }, // FAC01, FAC02, etc.
    department: { type: String, required: true },
    designation: { type: String, required: true },
    courses: [{ type: String }] // Array of Course IDs
}, {
    timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
