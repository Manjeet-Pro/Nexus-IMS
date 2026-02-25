const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { emitToUser } = require('../utils/socket');

// @desc    Add or Update Marks
// @route   POST /api/marks
// @access  Private (Faculty)
exports.addMark = async (req, res) => {
    try {
        const { studentId, courseId, type, marks, total } = req.body;

        // Validate required fields
        if (!studentId || !courseId || !type || marks === undefined || !total) {
            return res.status(400).json({
                message: 'Missing required fields',
                received: { studentId, courseId, type, marks, total }
            });
        }

        // Check if mark already exists for this exam type
        let mark = await Mark.findOne({ student: studentId, course: courseId, type });

        if (mark) {
            mark.marks = marks;
            mark.total = total;
            await mark.save();
        } else {
            mark = await Mark.create({
                student: studentId,
                course: courseId,
                type,
                marks,
                total
            });
        }

        // Fetch student to get the user ID for socket notification
        const student = await Student.findById(studentId);
        if (student && student.user) {
            emitToUser(student.user.toString(), 'marks_updated', {
                message: `Your marks for ${type} have been updated.`,
                mark
            });
        }

        res.json(mark);
    } catch (error) {
        console.error('Error in addMark:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get marks for a specific course (Faculty view)
// @route   GET /api/marks/course/:courseId
// @access  Private (Faculty)
exports.getCourseMarks = async (req, res) => {
    try {
        const marks = await Mark.find({ course: req.params.courseId })
            .populate({
                path: 'student',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .populate('course', 'name code');
        res.json(marks);
    } catch (error) {
        console.error('Error fetching course marks:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my marks (Student view)
// @route   GET /api/marks/my
// @access  Private (Student)
exports.getMyMarks = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const marks = await Mark.find({ student: student._id })
            .populate('course', 'name code credits');
        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get marks for a specific student (Admin/Faculty view)
// @route   GET /api/marks/student/:studentId
// @access  Private (Admin/Faculty)
exports.getStudentMarks = async (req, res) => {
    try {
        const marks = await Mark.find({ student: req.params.studentId })
            .populate('course', 'name code credits');
        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
