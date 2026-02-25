const Exam = require('../models/Exam');
const Course = require('../models/Course');

// @desc    Schedule a new exam
// @route   POST /api/exams
// @access  Private (Admin)
exports.createExam = async (req, res) => {
    try {
        const { name, courseId, date, startTime, duration, room, type } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const exam = await Exam.create({
            name,
            course: courseId,
            date,
            startTime,
            duration,
            room,
            type,
            createdBy: req.user._id
        });

        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private (Admin/Faculty/Student)
exports.getExams = async (req, res) => {
    try {
        const { courseId, type } = req.query;
        let query = {};

        if (courseId) query.course = courseId;
        if (type) query.type = type;

        // If student, maybe restrict to their enrolled courses?
        // For now, let's keep it open or filter by frontend request using courseId

        const exams = await Exam.find(query)
            .populate('course', 'name code')
            .sort({ date: 1 }); // Ascending order of date

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (exam) {
            await exam.deleteOne();
            res.json({ message: 'Exam removed' });
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
